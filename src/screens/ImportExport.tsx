import { useState } from 'react';
import type { AppData, Categories, Transaction } from '../types';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { useConfirm } from '../components/ConfirmDialog';
import { IDown, IUp } from '../components/icons';
import { useT } from '../i18n/LangProvider';
import { isTauri } from '../lib/persist';
import { buildWorkbook, parseWorkbook, type ImportIssue } from '../lib/excel';

type Props = {
  data: AppData;
  onImport: (mode: 'append' | 'replace', txs: Transaction[], cats: Categories) => void;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'busy' }
  | { kind: 'ok'; message: string }
  | { kind: 'err'; message: string };

type Preview = {
  transactions: Transaction[];
  cats: Categories;
  errors: ImportIssue[];
};

const SKIP_PREVIEW = 5;

export function ImportExportScreen({ data, onImport }: Props) {
  const { t, tp } = useT();
  const confirm = useConfirm();
  const supported = isTauri();

  const [exportStatus, setExportStatus] = useState<Status>({ kind: 'idle' });
  const [importStatus, setImportStatus] = useState<Status>({ kind: 'idle' });
  const [preview, setPreview] = useState<Preview | null>(null);

  async function handleExport() {
    setExportStatus({ kind: 'busy' });
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');
      const today = new Date().toISOString().slice(0, 10);
      const path = await save({
        defaultPath: `muhaseb-tech-${today}.xlsx`,
        filters: [{ name: 'Excel', extensions: ['xlsx'] }],
      });
      if (!path) {
        setExportStatus({ kind: 'idle' });
        return;
      }
      const bytes = buildWorkbook(data);
      await writeFile(path, bytes);
      setExportStatus({
        kind: 'ok',
        message: tp('importExport.export.success', { path: basename(path) }),
      });
    } catch (e) {
      console.error(e);
      setExportStatus({ kind: 'err', message: t('importExport.error.write') });
    }
  }

  async function handlePickImport() {
    setImportStatus({ kind: 'busy' });
    setPreview(null);
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readFile } = await import('@tauri-apps/plugin-fs');
      const picked = await open({
        multiple: false,
        directory: false,
        filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
      });
      if (picked === null || Array.isArray(picked)) {
        setImportStatus({ kind: 'idle' });
        return;
      }
      const bytes = await readFile(picked);
      let parsed: Preview;
      try {
        parsed = parseWorkbook(bytes);
      } catch (e) {
        console.error(e);
        setImportStatus({ kind: 'err', message: t('importExport.error.parse') });
        return;
      }
      if (parsed.transactions.length === 0) {
        setImportStatus({ kind: 'err', message: t('importExport.error.noData') });
        return;
      }
      setPreview(parsed);
      setImportStatus({ kind: 'idle' });
    } catch (e) {
      console.error(e);
      setImportStatus({ kind: 'err', message: t('importExport.error.read') });
    }
  }

  function handleAppend() {
    if (!preview) return;
    onImport('append', preview.transactions, preview.cats);
    setImportStatus({
      kind: 'ok',
      message: tp('importExport.import.successAppend', {
        tx: preview.transactions.length,
        cat: preview.cats.income.length + preview.cats.expense.length,
      }),
    });
    setPreview(null);
  }

  async function handleReplace() {
    if (!preview) return;
    if (!(await confirm(t('importExport.import.confirmReplace')))) return;
    onImport('replace', preview.transactions, preview.cats);
    setImportStatus({
      kind: 'ok',
      message: tp('importExport.import.successReplace', {
        tx: preview.transactions.length,
        cat: preview.cats.income.length + preview.cats.expense.length,
      }),
    });
    setPreview(null);
  }

  function handleCancel() {
    setPreview(null);
    setImportStatus({ kind: 'idle' });
  }

  return (
    <div>
      <PageHeader title={t('importExport.title')} subtitle={t('importExport.subtitle')} />

      {!supported && (
        <Card style={{ marginBottom: 20 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            {t('importExport.webDisabled')}
          </p>
        </Card>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        <ActionCard
          title={t('importExport.export.title')}
          desc={t('importExport.export.desc')}
          color="var(--teal)"
          bg="var(--teal-light)"
          icon={<IUp s={20} />}
          buttonLabel={t('importExport.export.btn')}
          onClick={handleExport}
          disabled={!supported || exportStatus.kind === 'busy'}
          status={exportStatus}
        />
        <ActionCard
          title={t('importExport.import.title')}
          desc={t('importExport.import.desc')}
          color="var(--green)"
          bg="var(--green-light)"
          icon={<IDown s={20} />}
          buttonLabel={t('importExport.import.btn')}
          onClick={handlePickImport}
          disabled={!supported || importStatus.kind === 'busy'}
          status={importStatus}
        />
      </div>

      {preview && (
        <Card style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            {tp('importExport.import.found', {
              tx: preview.transactions.length,
              cat: preview.cats.income.length + preview.cats.expense.length,
            })}
          </h2>

          {preview.errors.length > 0 && (
            <div style={{ marginTop: 12, marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--red)', fontWeight: 600, marginBottom: 6 }}>
                {tp('importExport.import.skipped', { n: preview.errors.length })}
              </p>
              <ul
                style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  padding: 0,
                  margin: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                {preview.errors.slice(0, SKIP_PREVIEW).map((iss, i) => (
                  <li key={i}>
                    {tp('importExport.import.skippedRow', {
                      row: `${iss.sheet}#${iss.row}`,
                      reason: iss.reason,
                    })}
                  </li>
                ))}
                {preview.errors.length > SKIP_PREVIEW && (
                  <li>
                    {tp('importExport.import.moreSkipped', {
                      n: preview.errors.length - SKIP_PREVIEW,
                    })}
                  </li>
                )}
              </ul>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button onClick={handleAppend} style={primaryBtn('var(--green)')}>
              {t('importExport.import.append')}
            </button>
            <button onClick={handleReplace} style={primaryBtn('var(--red)')}>
              {t('importExport.import.replace')}
            </button>
            <button onClick={handleCancel} style={secondaryBtn()}>
              {t('importExport.import.cancel')}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

type ActionCardProps = {
  title: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  buttonLabel: string;
  onClick: () => void;
  disabled: boolean;
  status: Status;
};

function ActionCard({
  title,
  desc,
  color,
  bg,
  icon,
  buttonLabel,
  onClick,
  disabled,
  status,
}: ActionCardProps) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span
          style={{
            color,
            display: 'flex',
            background: bg,
            borderRadius: 10,
            padding: 8,
          }}
        >
          {icon}
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 700, color }}>{title}</h2>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
        {desc}
      </p>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...primaryBtn(color),
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {buttonLabel}
      </button>
      {status.kind === 'ok' && (
        <p
          role="status"
          style={{ marginTop: 12, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}
        >
          {status.message}
        </p>
      )}
      {status.kind === 'err' && (
        <p
          role="status"
          style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', fontWeight: 600 }}
        >
          {status.message}
        </p>
      )}
    </Card>
  );
}

function primaryBtn(color: string): React.CSSProperties {
  return {
    minHeight: 48,
    padding: '0 22px',
    borderRadius: 12,
    border: 'none',
    background: color,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  };
}

function secondaryBtn(): React.CSSProperties {
  return {
    minHeight: 48,
    padding: '0 22px',
    borderRadius: 12,
    border: '1.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--text)',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  };
}

function basename(p: string): string {
  const n = p.replace(/[/\\]+$/, '');
  const i = Math.max(n.lastIndexOf('/'), n.lastIndexOf('\\'));
  return i === -1 ? n : n.slice(i + 1);
}
