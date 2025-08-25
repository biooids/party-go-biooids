//src/app/(app)/layout.tsx

import "@/app/globals.css";
import MobileBottomBar from "@/components/layouts/sidebar/MobileBottomBar";

export default function AppLayout({
  children,
  header,
  sidebar,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {header}
      <div className="flex flex-1">
        {sidebar}
        <main className="flex-1 p-6 bg-muted/30">{children}</main>
      </div>
      {footer}
      <MobileBottomBar />
    </div>
  );
}
