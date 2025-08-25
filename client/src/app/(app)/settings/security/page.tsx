//src/app/(app)/settings/security/page.tsx
"use client";

import ChangePasswordForm from "@/components/pages/settings/ChangePasswordForm";
import DangerZone from "@/components/pages/settings/DangerZone";

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-12">
      <ChangePasswordForm />
      <DangerZone />
    </div>
  );
}
