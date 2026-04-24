import type { ReactNode } from 'react';

type IcProps = { d: ReactNode; size?: number; stroke?: number };

function Ic({ d, size = 22, stroke = 2 }: IcProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
    >
      {d}
    </svg>
  );
}

type IconProps = { s?: number };

export const IDash = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 22}
    d={
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    }
  />
);

export const ITrans = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 22}
    d={
      <>
        <path d="M17 3l4 4-4 4" />
        <path d="M3 7h18" />
        <path d="M7 21l-4-4 4-4" />
        <path d="M21 17H3" />
      </>
    }
  />
);

export const ICats = ({ s }: IconProps = {}) => (
  <Ic size={s ?? 22} d={<path d="M4 6h16M4 12h10M4 18h6" />} />
);

export const IHistory = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 22}
    d={
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </>
    }
  />
);

export const IPlus = ({ s }: IconProps = {}) => (
  <Ic size={s ?? 22} stroke={2.5} d={<path d="M12 5v14M5 12h14" />} />
);

export const ITrash = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 20}
    d={
      <>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </>
    }
  />
);

export const IUp = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 20}
    stroke={2.5}
    d={
      <>
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </>
    }
  />
);

export const IDown = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 20}
    stroke={2.5}
    d={
      <>
        <path d="M12 5v14" />
        <path d="M19 12l-7 7-7-7" />
      </>
    }
  />
);

export const IClose = ({ s }: IconProps = {}) => (
  <Ic size={s ?? 22} stroke={2.5} d={<path d="M18 6L6 18M6 6l12 12" />} />
);

export const ISearch = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 18}
    d={
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </>
    }
  />
);

export const IUndo = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 18}
    d={
      <>
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
      </>
    }
  />
);

export const IRedo = ({ s }: IconProps = {}) => (
  <Ic
    size={s ?? 18}
    d={
      <>
        <path d="M21 7v6h-6" />
        <path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
      </>
    }
  />
);

export const IFolder = ({ s }: IconProps = {}) => (
  <Ic size={s ?? 18} d={<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />} />
);
