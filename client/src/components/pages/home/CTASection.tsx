import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui components path

export default function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-card border-t border-border relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-primary/10 via-pink-500/5 to-teal-400/10 blur-3xl" />

      <div className="container mx-auto max-w-screen-md px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
          Never Miss a Night Out Again 🎉
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Discover the hottest parties, exclusive student deals, and trending
          bars around campus. Your next great night starts here.
        </p>

        {/* Buttons using shadcn/ui Button component */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="w-full sm:w-auto font-semibold">
            📱 Get the App
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto font-semibold"
          >
            🎤 List Your Event <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Available soon on iOS & Android. Be the first to know!
        </p>
      </div>
    </section>
  );
}
