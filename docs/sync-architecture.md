# Sync architecture

> **Status:** design doc, not yet implemented. Track 2 of the [product roadmap](../README.md#roadmap).
>
> **Last updated:** 2026-05-15.

This document pins down the design decisions for the optional sync layer described in the README roadmap. No sync code exists yet; this doc is the contract that the future server, the future client sync worker, and the disk-format schema all build against.

## Goals

1. **Local-first stays first-class.** A user who never enables sync should not pay any cost (no extra fields they care about, no perceptible startup time, no nagging UI). All sync-related fields on disk are additive and default to "no server".
2. **Same binary, both modes.** A single build of the app runs offline-only OR connected to a server; the user toggles in Settings.
3. **End-to-end encrypted.** The server (whether self-hosted or CodeTiquette-hosted) never sees plaintext. This is mandatory for a finance app, both for trust and for compliance posture.
4. **Self-host is upstream of hosted.** Whatever protocol the cloud server speaks, the self-host Docker image speaks the same one. No proprietary cloud-only endpoints.
5. **Conflict-tolerant.** Two devices editing offline must converge to a consistent state on next sync. Conflicts get surfaced in the UI, not silently dropped.

## Non-goals

- **Real-time collaborative editing.** This isn't a Google Docs competitor. Two users editing the same transaction simultaneously is an edge case; we resolve via divergent-branch UI, not OT/CRDT character-level merge.
- **Selective sync.** All data syncs to all paired devices. Per-device filtering ("only sync this account") is out of scope.
- **Shared multi-user accounts.** v1 is single-user-per-account. Couples sharing a ledger is v2+ territory.
- **Sync-without-account.** Peer-to-peer or QR-code transfer between two devices without going through a server: nice to have, not v1.

## Core insight: the undo-tree IS the sync substrate

The existing `History` type in `src/types.ts` is already a commit DAG. Each `Snapshot` has:

- A unique `id` (UUID per snapshot).
- A `parentId` pointer (immutable after creation).
- A `childIds` list (mutable as new children are appended).
- A `createdAt` timestamp.
- A `label` and structured `descriptor` that already describe what changed.
- The full `AppData` after the change.

This is essentially a git commit DAG without content addressing. Branches form naturally: when a user undoes and then edits, the new edit becomes a sibling child of the parent, not an overwrite of the undone snapshot. The `restore(id)` operation is a forward commit, so older snapshots are immutable.

**Sync, in this model, is just exchanging snapshots between devices on the same DAG.** Two devices that have been offline arrive at the next sync each with their own "tip" (`currentId`). The server has the union of both DAGs. Each device pulls the snapshots the server has that it doesn't, and ends up with multiple visible branches in its undo-tree — exactly the same data structure that already supports local undo/redo with branches.

This is the model. The rest of this doc is implementation detail for it.

---

## Sync model in practice

### Per-device state

Every install gets a stable `deviceId` (UUID) generated at first run. Stored on disk; survives upgrades; regenerated only on full data wipe.

Each snapshot is **authored by exactly one device**, recorded at commit time. The author can never change.

The `currentId` (HEAD pointer) is per-device. After a sync that introduces new snapshots from other devices, the local HEAD does NOT auto-move — the user keeps editing on their own branch until they explicitly merge or switch branches.

### Push / pull

A connected client runs a sync worker that:

1. **Push** — sends to the server any snapshot whose `id` the server doesn't yet have, encrypted (see § Encryption below).
2. **Pull** — fetches from the server any snapshot whose `id` the local DAG doesn't yet have.
3. Updates the local "what does the server know about" bookkeeping.

Snapshots are **append-only on the server**. The server never receives "snapshot X has been modified" — that's impossible in this model because snapshots are immutable. Deletion of stale snapshots (the 200-cap pruning that already exists) is coordinated separately, see § Pruning.

### Sync triggers

For v1, simple polling:

- On app focus / mount.
- On every `commit` (push-only; tells the server "I just made a thing").
- Every N minutes while the app is in foreground (configurable; default 5 min).

Server-Sent Events for low-latency pull-on-change is a v2 optimization. Polling is good enough for a finance app where edits are infrequent and "within a few minutes" feels real-time-enough.

### What gets surfaced in the UI

The existing History screen (`src/screens/History.tsx`) already renders the undo-tree as a list of snapshots grouped by branch. With sync, the same UI shows snapshots authored by other devices — labelled with the device's name (user-assigned in Settings) and a small icon.

When the local HEAD and another device's HEAD are not in an ancestor relationship, the History screen calls this out: "This device is on branch A; <other device> is on branch B. [Switch to other branch] [Merge]". The "Merge" action creates a new snapshot whose parent is local HEAD and which contains the *data* of the other branch — i.e. a manual fast-forward. No automatic three-way merge for v1.

---

## Wire protocol

REST over HTTPS. Endpoints:

```
POST   /v1/auth/signup           { email, srpVerifier, srpSalt }      → { sessionToken }
POST   /v1/auth/login            { email, srpA }                       → { srpB, salt }
POST   /v1/auth/verify           { srpM1 }                             → { sessionToken, srpM2 }
POST   /v1/auth/logout

GET    /v1/account               → { email, deviceCount, quotaUsage }
PUT    /v1/account/devices/:id   { name }                              → device metadata
DELETE /v1/account/devices/:id

POST   /v1/snapshots             { snapshots: EncryptedSnapshot[] }    → { acceptedIds }
GET    /v1/snapshots?since=<rev> → { snapshots: EncryptedSnapshot[], rev }
DELETE /v1/snapshots             { ids: string[] }                     → { deletedIds }

POST   /v1/attachments/:hash     <encrypted blob, content-addressed>   → 204
GET    /v1/attachments/:hash                                           → encrypted blob
HEAD   /v1/attachments/:hash                                           → 200 or 404

GET    /v1/health                → { version, time }
```

Authentication uses **SRP-6a (Secure Remote Password)** so the server never sees the user's master passphrase. Standard Notes uses this; Bitwarden uses a similar PBKDF2-based variant. SRP is well-studied, has multiple production-quality libraries (jsbn-srp, secure-remote-password), and means "server compromise" doesn't leak passphrases.

`?since=<rev>` uses a monotonic per-account server revision counter — the server stamps each accepted batch with `rev++` and returns `rev` to the client; client passes the last-seen `rev` to fetch deltas. No timestamps in protocol logic (those are not monotonic across clock skew).

---

## Conflict resolution: divergent HEADs

Defined entirely by the existing DAG semantics:

- **No divergence (most common).** Local HEAD is an ancestor of server-known HEADs, or vice versa. Pull, fast-forward the local DAG, optionally fast-forward HEAD if the user enabled "auto-follow upstream" in Settings (off by default to keep local control).
- **Divergence.** Local HEAD and another device's HEAD share an ancestor but neither is an ancestor of the other. UI shows both branches with a clear "Your last edit on this device" marker. User picks which branch to continue from.
- **Conflicting edits on the same transaction.** Falls out of the above: two devices each commit a snapshot editing transaction `T`. Both snapshots exist; user sees both branches; user picks one to continue.

The deliberately simple choice here is to **never auto-merge**. Auto-merging means picking a winner silently, which a finance app cannot do. The user must see the divergence and resolve it.

---

## Encryption

End-to-end. The server stores ciphertext only.

### Key derivation

- **Master passphrase** entered by user at signup; never sent to server.
- **Master key (Mk)** = Argon2id(passphrase, salt, t=3, m=64MiB, p=1, 32 bytes).
- **Account key (Ak)** = HKDF-SHA256(Mk, info="account-key").
- **Data key (Dk)** = HKDF-SHA256(Mk, info="data-key").
- **Attachment key (Atk)** = HKDF-SHA256(Mk, info="attachment-key").

The Master key never leaves the device. SRP verifier (derived from Mk via SRP's `x = H(salt, identity, passphrase)`) is what the server stores for authentication.

### Snapshot encryption

Each snapshot has two encrypted envelopes:

1. **Metadata envelope** (small, indexed): includes `id`, `parentId`, `deviceId`, `createdAt`, `descriptor.kind`. Encrypted with Dk so the server cannot read kind/timestamps. The server only sees `id`, `accountId`, the encrypted ciphertext, and a content hash for deduplication.
2. **Payload envelope** (potentially large): the full `Snapshot.data` (transactions + categories). Also encrypted with Dk.

Both envelopes use **XChaCha20-Poly1305** (AEAD; widely available; misuse-resistant via 192-bit nonce; libsodium-supported on every platform we target).

### Attachment encryption

Per-attachment unique key derived as HKDF-SHA256(Atk, info=attachmentId). Encrypt the file bytes with XChaCha20-Poly1305 client-side; upload by content hash of the ciphertext. The server stores opaque encrypted blobs and never receives the per-attachment key.

### Key rotation

Out of scope for v1. Implementable later by issuing a new Mk, re-wrapping all per-snapshot keys client-side, and re-uploading. Documented limitation, surface it in Settings: "Changing your passphrase requires re-uploading your data."

### Recovery

A **recovery code** is generated at signup: 12 base32 groups (~60 bits of entropy), displayed once, instructed to print/store offline. The recovery code is itself a derivation input: `Mk = Argon2id(passphrase OR recovery_code, salt, ...)`. Losing both passphrase AND recovery code = data is unrecoverable. The server cannot help — that's the trade-off for E2E.

---

## Identity & accounts

- **Identifier:** email address. Used for login + recovery emails. Never used for encryption directly.
- **Signup:** email + master passphrase (8+ chars enforced; passphrase-style hints in the UI to discourage short-and-common). Recovery code shown once.
- **Login:** email + master passphrase. SRP handshake; no plaintext passphrase ever leaves the device.
- **Email verification:** required before sync activates. Magic-link verification on signup.
- **Email change:** out of scope for v1. Settings page hides the option.

Why not passkeys? They're the better UX once supported everywhere, but they don't directly support the "master passphrase = encryption key" model — passkey-protected secrets would need a separate vault wrapping. v2 candidate: passkey-unlocks-local-key combined with a passphrase fallback.

---

## Attachments

Sync the metadata as part of the snapshot DAG (it's already a field on `Transaction`). Sync the binaries via separate object-storage endpoints, content-addressed by ciphertext hash. Three observable consequences:

1. **Snapshots are small.** A snapshot mentioning an attachment is still just a few KB. The binary is fetched on demand.
2. **Attachments sync lazily.** A device that doesn't open a transaction's attachment never downloads it. The "open" gesture triggers download + decrypt on the spot, with a progress UI for large files.
3. **Content addressing means deduplication.** If the same file is attached to two transactions, the server stores one ciphertext blob. (Two clients independently uploading the same plaintext produce identical ciphertext because the per-attachment key is derived deterministically from the attachment id, not random.)

Object storage: self-host uses the local filesystem under a configurable path; cloud-hosted uses an S3-compatible bucket. Same code path; the storage backend is a configuration choice on the server.

---

## Server data model

SQLite for the MVP (single-tenant DB per account is the cleanest isolation story; one Postgres-shaped engine isn't worth the operational overhead for the self-host case).

```sql
-- accounts.db (one global, for auth)
CREATE TABLE accounts (
  id            TEXT PRIMARY KEY,           -- UUID
  email         TEXT NOT NULL UNIQUE,
  email_verified_at INTEGER,
  srp_salt      BLOB NOT NULL,
  srp_verifier  BLOB NOT NULL,
  created_at    INTEGER NOT NULL,
  quota_bytes   INTEGER NOT NULL DEFAULT 100000000  -- 100 MB free tier
);

CREATE TABLE devices (
  id           TEXT PRIMARY KEY,           -- the client-generated deviceId
  account_id   TEXT NOT NULL REFERENCES accounts(id),
  name         TEXT,                       -- user-assigned
  last_seen_at INTEGER,
  created_at   INTEGER NOT NULL
);

CREATE TABLE sessions (
  token        TEXT PRIMARY KEY,
  account_id   TEXT NOT NULL REFERENCES accounts(id),
  device_id    TEXT NOT NULL REFERENCES devices(id),
  expires_at   INTEGER NOT NULL
);

-- account-<accountId>.db (one per account, holds the sync data)
CREATE TABLE snapshots (
  id              TEXT PRIMARY KEY,         -- the client-generated snapshot id
  device_id       TEXT NOT NULL,
  metadata_blob   BLOB NOT NULL,            -- encrypted metadata envelope
  payload_blob    BLOB NOT NULL,            -- encrypted payload envelope
  content_hash    BLOB NOT NULL,            -- SHA-256 of payload ciphertext
  rev             INTEGER NOT NULL,         -- monotonic server revision when this row landed
  created_at      INTEGER NOT NULL,
  UNIQUE(content_hash)
);
CREATE INDEX idx_snapshots_rev ON snapshots(rev);

CREATE TABLE attachments (
  hash            BLOB PRIMARY KEY,         -- SHA-256 of ciphertext
  size            INTEGER NOT NULL,
  refcount        INTEGER NOT NULL,         -- snapshots that reference this
  created_at      INTEGER NOT NULL
);
```

The "DB per account" pattern keeps each account's data physically separated — drastically simpler GDPR right-to-delete (drop the file). It's also easier for self-host backups (one user, one DB file).

Cloud-hosted scaling: even on a $5/mo VPS, SQLite handles ~100k QPS reads against a single DB. With one DB per account and most reads being on-demand pulls, this won't be the bottleneck for a long time.

---

## On-disk schema additions (v3 → v4)

Concrete diff for `src/types.ts`:

```ts
export type Snapshot = {
  id: string;
  parentId: string | null;
  childIds: string[];
  createdAt: number;
  label: string;
  descriptor?: SnapshotDescriptor;
  data: AppData;

  // v4 additions — defaulted at migration time
  deviceId?: string;          // author of this snapshot; absent on pre-v4 snapshots
};

export type History = {
  rootId: string;
  currentId: string;
  nodes: Record<string, Snapshot>;

  // v4 additions
  deviceId?: string;          // this install's identity; never persisted off this device
};

export type ServerState = {
  url: string;
  lastSyncedRev: number;      // last rev pulled from the server
  pendingPushIds: string[];   // snapshots not yet acknowledged by the server
};

export type DiskFormat = {
  schemaVersion: 4;
  history: History;
  serverState?: ServerState;  // absent = local-only mode
};
```

**Migration v3 → v4:**

- Generate a `deviceId` UUID on first v4 load and set it on `History`.
- Leave existing snapshots' `deviceId` field absent; backfilled when those snapshots get authored-by attribution on first push (the sync code treats absent `deviceId` as "this device" for legacy snapshots, since pre-v4 there was only one device).
- `serverState` is absent (local-only mode).
- Schema bump is silent; user sees nothing different until they enable sync from Settings.

This migration is **additive only**. Downgrading v4 → v3 is unsupported, but old data is forward-compatible.

The `parseAndMigrate` function in `src/lib/persist.ts` currently returns `null` for non-matching schemas (Phase 0 noted this is broken — it doesn't actually migrate). Track 2's implementation step fixes that: the function gets a real chain of migrators (v1 → v2 → v3 → v4) that mutate the parsed object in place.

---

## Pruning interaction with sync

The existing `prune()` caps snapshot count at 200. With sync, this needs adjustment:

- **Never prune a snapshot the server hasn't acknowledged yet.** A pruned snapshot is permanently lost — if it never reached the server, no other device will ever see it.
- **Never prune a snapshot that is the local HEAD on this device OR is reachable from any device's last-seen HEAD that has been pushed to the server.** This requires the server to publish per-device HEAD info (currently only `rev` is published).

For v1, the simplest correct rule: **don't prune anything that hasn't been confirmed-pushed.** Effective cap becomes "200 OR pending-push set, whichever is larger." Users who never enable sync see no change.

For long-term: cap-based pruning needs a server-coordinated tombstone protocol so all devices agree on what was pruned. Out of scope for the first sync release; tracked in deferred decisions.

---

## Migration & backward compatibility

| Direction | Behavior |
|---|---|
| v3 → v4 (sync-enabled build) | Silent additive migration on first load. User unaffected until they enable sync. |
| v4 → v3 (sync-enabled build downgraded to local-only build) | Not supported. v4 file remains readable by any v4+ build. |
| Browser localStorage → Tauri | Already works; sync state defaults to local-only on first Tauri run. |

Protocol versioning: the wire protocol has a `/v1/` prefix. A future `/v2/` can coexist; old clients keep talking `/v1/` until upgraded.

The on-disk schema and the wire protocol are versioned **independently**. A v4 disk format may speak protocol v1 or v2 — they're decoupled.

---

## Deferred decisions

- **Pruning coordination protocol** (above). Servers and clients need a tombstone exchange before pruning can safely advance with sync enabled.
- **Account deletion.** The DB-per-account model makes the data side trivial (drop the file). The auth side needs a tombstone in `accounts` to prevent the same email from being re-registered immediately (rate-limit).
- **Email change.** Requires re-encrypting the SRP verifier; medium complexity.
- **Multi-account on the same device.** Probably never. One device = one account. Cleaner threat model.
- **Real-time push (SSE/WebSocket).** v2 optimization for low-latency cross-device.
- **Selective sync** (per-bucket or per-category filters). Probably never — keeps the data model simpler.
- **Server-side audit log** (for compliance). Probably required if we ever target organizations rather than individuals.

---

## License implication of AGPL on the server

The repo is AGPL-3.0-or-later. Since the CodeTiquette-hosted server is "the program as a network service", AGPL §13 requires us to publish the server source under AGPL too. This is intentional — it's the lock-in that the license choice produces in our favor: anyone else who hosts a competing service must also open-source their fork.

Implementation consequence: the server code lives in this repo (e.g. `apps/server/`) or a sibling AGPL-licensed repo, not in a private one.

---

## References

- **Standard Notes encryption spec** — https://standardnotes.com/specification (E2E with SRP, similar threat model).
- **Bitwarden whitepaper** — https://bitwarden.com/help/bitwarden-security-white-paper/ (key derivation patterns, PBKDF2 vs Argon2 trade-offs).
- **SRP-6a** — https://datatracker.ietf.org/doc/html/rfc5054 (the specific SRP variant used here; supported in `secure-remote-password` npm + Rust `srp` crates).
- **XChaCha20-Poly1305** — libsodium docs at https://doc.libsodium.org/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction (justified over AES-GCM for the larger nonce avoiding catastrophic reuse).
- **Argon2id** — RFC 9106 https://datatracker.ietf.org/doc/html/rfc9106 (memory-hard KDF; the OWASP-recommended default).
- **git's commit DAG** — https://git-scm.com/book/en/v2/Git-Internals-Git-Objects (the mental model for the undo-tree-as-sync-substrate insight).

---

## Implementation order

The doc commits as one chunk. The on-disk schema additions land as a separate small PR before mobile Phase 2:

1. **This doc.** Committed. Iterates via PRs.
2. **Schema additions** (separate PR): bump `SCHEMA_VERSION` to 4, add the new optional fields to `Snapshot`/`History`/`DiskFormat`, generate a `deviceId` on first v4 load, fix `parseAndMigrate` to actually chain migrations. ~30 lines of code + tests.
3. **Server MVP** (Track 4): implement the protocol above against the SQLite schema above.
4. **Desktop sync client** (Track 5): UI in Settings, sync worker, conflict UI in History screen.
5. **Mobile sync client** (Track 6): same code, mobile glue.
