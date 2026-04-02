"use client";

import { type ReactNode } from "react";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { OfflineBanner } from "@/components/layout/OfflineBanner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      {children}
    </ErrorBoundary>
  );
}
