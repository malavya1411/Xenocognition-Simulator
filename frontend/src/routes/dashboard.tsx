import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return (
    <div className="flex h-screen items-center justify-center bg-base text-text-primary">
      <p className="font-mono text-sm uppercase tracking-widest animate-pulse">
        Initializing dashboard interface...
      </p>
    </div>
  );
}
