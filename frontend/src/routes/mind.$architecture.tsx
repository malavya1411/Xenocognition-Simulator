import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { OctopusChatRealm } from "@/components/xeno/OctopusChatRealm";
import { MycelialChatRealm } from "@/components/xeno/MycelialChatRealm";
import { HiveChatRealm } from "@/components/xeno/HiveChatRealm";
import { BoltzmannChatRealm } from "@/components/xeno/BoltzmannChatRealm";
import { MeshChatRealm } from "@/components/xeno/MeshChatRealm";

export const Route = createFileRoute("/mind/$architecture")({
  component: MindRouteComponent,
});

type ArchId = "octopus" | "mycelium" | "hive" | "boltzmann" | "mesh";

function MindRouteComponent() {
  const { architecture } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Protect Route
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-base text-text-primary">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Connecting consciousness uplink...
        </p>
      </div>
    );
  }

  const archKey = architecture.toLowerCase() as ArchId;
  const initialConcept = "xenocognition";
  const handleClose = () => {
    navigate({ to: "/architectures" });
  };

  switch (archKey) {
    case "octopus":
      return <OctopusChatRealm initialConcept={initialConcept} onClose={handleClose} />;
    case "mycelium":
      return <MycelialChatRealm initialConcept={initialConcept} onClose={handleClose} />;
    case "hive":
      return <HiveChatRealm initialConcept={initialConcept} onClose={handleClose} />;
    case "boltzmann":
      return <BoltzmannChatRealm initialConcept={initialConcept} onClose={handleClose} />;
    case "mesh":
      return <MeshChatRealm initialConcept={initialConcept} onClose={handleClose} />;
    default:
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-base text-text-primary gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
            Error: Unknown architecture profile.
          </p>
          <button
            onClick={handleClose}
            className="rounded border border-border-dim px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-white transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      );
  }
}
