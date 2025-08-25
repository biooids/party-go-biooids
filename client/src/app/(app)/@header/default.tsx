// src/app/(app)/@header/page.tsx

import Header from "@/components/layouts/header/Header";

// ✅ FIXED: Removed the unnecessary and redundant wrapper div.
export default function Page() {
  return <Header />;
}
