import type { ReactNode } from "react";

interface SurfaceProps {
  children: ReactNode;
  className?: string;
  raised?: boolean;
}

export function Surface({
  children,
  className = "",
  raised = false,
}: SurfaceProps) {
  return (
    <div
      className={`${raised ? "surface-raised" : "surface"} p-6 ${className}`}
    >
      {children}
    </div>
  );
}
