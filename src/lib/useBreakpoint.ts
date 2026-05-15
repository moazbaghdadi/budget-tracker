import { useEffect, useState } from 'react';
import type { Breakpoint } from '../types';

// Breakpoints match the table in CLAUDE.md: mobile < 640, tablet 640-1100, desktop > 1100.
const MOBILE_MAX = 640;
const TABLET_MAX = 1100;

function compute(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < MOBILE_MAX) return 'mobile';
  if (w <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(compute);
  useEffect(() => {
    const onResize = () => setBp(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}
