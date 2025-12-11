import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/10 p-4">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            AI Tree Chat
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive conversations with advanced AI capabilities
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn UI,
            and Supabase.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg">Get Started</Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>

        <div className="pt-8 text-xs text-muted-foreground">
          <p>Complete development setup with modern tooling and best practices</p>
        </div>
      </div>
    </main>
  );
}
