import type { SVGProps } from 'react';

/** One 24px stroke grid for the whole app, so icons stay optically consistent. */
const PATHS = {
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35',
  star: 'M12 3.6l2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.87l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.6Z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  copy: 'M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9Zm-2 6H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2',
  close: 'M6 6l12 12M18 6 6 18',
  grip: 'M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01',
  tag: 'M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Zm5-5h.01',
  group: 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7zM4 13h7v7H4z',
  sparkle:
    'M12 3c1.1 5.4 2.5 6.8 7.9 7.9-5.4 1.1-6.8 2.5-7.9 7.9-1.1-5.4-2.5-6.8-7.9-7.9C9.5 9.8 10.9 8.4 12 3Z',
  list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  board: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h4A2.5 2.5 0 0 1 12 5.5v3A2.5 2.5 0 0 1 9.5 11h-4A2.5 2.5 0 0 1 3 8.5v-3ZM14 13.5A2.5 2.5 0 0 1 16.5 11h2A2.5 2.5 0 0 1 21 13.5v5A2.5 2.5 0 0 1 18.5 21h-2A2.5 2.5 0 0 1 14 18.5v-5ZM14 4.5A1.5 1.5 0 0 1 15.5 3h4A1.5 1.5 0 0 1 21 4.5v2A1.5 1.5 0 0 1 19.5 8h-4A1.5 1.5 0 0 1 14 6.5v-2ZM3 15.5A1.5 1.5 0 0 1 4.5 14h5A1.5 1.5 0 0 1 11 15.5v4A1.5 1.5 0 0 1 9.5 21h-5A1.5 1.5 0 0 1 3 19.5v-4Z',
  check: 'M4.5 12.5 9 17 19.5 6.5',
  checkCircle: 'M9 12.5l2.2 2.2L15.5 10M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z',
  undo: 'M4 9h11a5 5 0 0 1 0 10h-6M4 9l4-4M4 9l4 4',
  redo: 'M20 9H9a5 5 0 0 0 0 10h6M20 9l-4-4M20 9l-4 4',
  download: 'M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  upload: 'M12 15V3m0 0L8 7m4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-3a8.4 8.4 0 0 0-.14-1.5l2-1.55-2-3.46-2.36.95a8.3 8.3 0 0 0-2.6-1.5L14.9 2h-4l-.4 2.44a8.3 8.3 0 0 0-2.6 1.5l-2.36-.95-2 3.46 2 1.55a8.5 8.5 0 0 0 0 3l-2 1.55 2 3.46 2.36-.95a8.3 8.3 0 0 0 2.6 1.5l.4 2.44h4l.4-2.44a8.3 8.3 0 0 0 2.6-1.5l2.36.95 2-3.46-2-1.55c.09-.49.14-.99.14-1.5Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-14v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z',
  install: 'M12 3v11m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 0 0 2-2v-3H3v3a2 2 0 0 0 2 2Z',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  arrowLeft: 'M19 12H5m0 0 6-6m-6 6 6 6',
  note: 'M6 3h9l5 5v13H6zM15 3v5h5M9 13h7M9 17h5',
  zoomIn: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35M8 11h6m-3-3v6',
  zoomOut: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35M8 11h6',
  fit: 'M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M17 10h.01M7 14h10',
  target: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-5a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z',
  filter: 'M3 5h18l-7 8v6l-4 2v-8L3 5Z',
  info: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Zm0-13h.01M11 12h1v5h1',
  wifiOff: 'M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M12 20h.01M5 12.5a11 11 0 0 1 4-2.6M19.5 12.5a11 11 0 0 0-8-3.4',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 18, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
