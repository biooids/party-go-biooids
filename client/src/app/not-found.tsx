import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <Frown className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-2">
        404 - Page Not Found
      </h1>
      <p className="max-w-md text-lg text-muted-foreground mb-8">
        Oops! It looks like the page you were looking for has either been moved
        or doesn't exist.
      </p>
      <Button asChild size="lg">
        <Link href="/">Go Back Home</Link>
      </Button>
    </div>
  );
}
