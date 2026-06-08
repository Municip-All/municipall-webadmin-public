"use client";

import React from "react";
import clsx from "clsx";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Full-height layout (database explorer) */
  fullHeight?: boolean;
}

export default function PageShell({
  children,
  className,
  fullHeight = false,
}: PageShellProps) {
  return (
    <div
      className={clsx(
        "flex flex-col",
        fullHeight ? "h-full min-h-0" : "min-h-0 flex-1 overflow-y-auto",
        className,
      )}
    >
      <div
        className={clsx(
          "mx-auto w-full max-w-[1600px] px-6 py-6 lg:px-8 lg:py-8",
          fullHeight && "flex h-full min-h-0 flex-col",
        )}
      >
        {children}
      </div>
    </div>
  );
}
