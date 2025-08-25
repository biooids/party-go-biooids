/*
================================================================================
| FILE: /src/components/layouts/footer/Footer.tsx (Unchanged)
================================================================================
*/
export default function Footer() {
  return (
    <footer className="border-t bg-background text-center py-4 text-sm text-muted-foreground">
      © {new Date().getFullYear()} NightOwl Inc. · All rights reserved.
    </footer>
  );
}
