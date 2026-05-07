import type { SVGProps } from "react";

export type IconName =
  | "bell"
  | "calendar"
  | "chevronLeft"
  | "chevronRight"
  | "close"
  | "filter"
  | "help"
  | "history"
  | "logOut"
  | "eye"
  | "list"
  | "plus"
  | "sparkles"
  | "warning";

export function Icon({
  name,
  className = "h-4 w-4",
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  const commonProps = {
    "aria-hidden": true,
    className,
    fill: "none",
    focusable: false,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    ...props,
  };

  switch (name) {
    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M15 17H9" />
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...commonProps}>
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
          <rect height="18" rx="3" width="18" x="3" y="4" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...commonProps}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevronRight":
      return (
        <svg {...commonProps}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "close":
      return (
        <svg {...commonProps}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "filter":
      return (
        <svg {...commonProps}>
          <path d="M4 7h16" />
          <path d="M7 12h10" />
          <path d="M10 17h4" />
        </svg>
      );
    case "eye":
      return (
        <svg {...commonProps}>
          <path d="M2.1 12s3.5-7 9.9-7 9.9 7 9.9 7-3.5 7-9.9 7-9.9-7-9.9-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "help":
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.7 2.7 0 0 1 5.1 1.25c0 1.75-1.6 2.25-2.3 3.15" />
          <path d="M12 17h.01" />
        </svg>
      );
    case "history":
      return (
        <svg {...commonProps}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "list":
      return (
        <svg {...commonProps}>
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <path d="M3 6h.01" />
          <path d="M3 12h.01" />
          <path d="M3 18h.01" />
        </svg>
      );
    case "logOut":
      return (
        <svg {...commonProps}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case "plus":
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "sparkles":
      return (
        <svg {...commonProps}>
          <path d="M12 3 10.4 8.1 5.5 10 10.4 11.9 12 17l1.6-5.1 4.9-1.9-4.9-1.9L12 3Z" />
          <path d="m19 15-.7 2.3L16 18l2.3.7L19 21l.7-2.3L22 18l-2.3-.7L19 15Z" />
          <path d="m5 3-.7 2.3L2 6l2.3.7L5 9l.7-2.3L8 6l-2.3-.7L5 3Z" />
        </svg>
      );
    case "warning":
      return (
        <svg {...commonProps}>
          <path d="m12 3 10 18H2L12 3Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}
