import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSantaCeiaStore } from "@/hooks/use-santa-ceia-store";
import { ReportView } from "@/components/ReportView";

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { historico } = useSantaCeiaStore();
  
  const ceia = historico.find((c) => c.id === id);

  useEffect(() => {
    if (!ceia) {
      navigate("/", { replace: true });
    }
  }, [ceia, navigate]);

  if (!ceia) return null;

  return <ReportView ceia={ceia} onVoltar={() => navigate("/")} />;
}
