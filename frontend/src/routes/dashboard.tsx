import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/architectures" });
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-base text-text-primary">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
        Redirecting to laboratory interface...
      </p>
    </div>
  );
}
