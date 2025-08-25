// src/app/(app)/@sidebar/page.tsx

import Sidebar from "@/components/layouts/sidebar/Sidebar";

// ✅ FIXED: Removed the unnecessary wrapper div.
export default function Page() {
  return <Sidebar />;
}
