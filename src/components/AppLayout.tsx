import type { ReactNode } from "react";

type AppLayoutProps = {
  sidebar: ReactNode;
  summary: ReactNode;
  children: ReactNode;
};

export function AppLayout({ sidebar, summary, children }: AppLayoutProps) {
  return (
    <div className="app-shell">
      {sidebar}
      <main className="main-content">{children}</main>
      {summary}
    </div>
  );
}
