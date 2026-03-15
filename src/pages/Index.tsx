import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useSantaCeiaStore } from "@/hooks/use-santa-ceia-store";
import type { SantaCeia } from "@/types/santa-ceia";
import { Dashboard } from "@/pages/Dashboard";
import { Contagem } from "@/pages/Contagem";
import { ReportView } from "@/components/ReportView";

type Tela = "dashboard" | "contagem" | "relatorio";

const Index = () => {
  const store = useSantaCeiaStore();
  const [tela, setTela] = useState<Tela>("dashboard");
  const [ceiaRelatorio, setCeiaRelatorio] = useState<SantaCeia | null>(null);

  const handleNovaCeia = (localidade: string) => {
    store.iniciarNovaCeia(localidade);
    setTela("contagem");
  };

  const handleVerRelatorio = (ceia: SantaCeia) => {
    setCeiaRelatorio(ceia);
    setTela("relatorio");
  };

  const handleFinalizar = () => {
    store.finalizarCeia();
    const ceia = store.obterCeiaFinalizada();
    if (ceia) {
      setCeiaRelatorio(ceia);
      setTela("relatorio");
    } else {
      setTela("dashboard");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {tela === "dashboard" && (
          <Dashboard
            key="dashboard"
            historico={store.historico}
            onNovaCeia={handleNovaCeia}
            onVerRelatorio={handleVerRelatorio}
            onExcluir={store.excluirCeia}
          />
        )}
        {tela === "contagem" && store.ceiaAtual && (
          <Contagem
            key="contagem"
            ceia={store.ceiaAtual}
            onSalvarRodada={store.adicionarRodada}
            onFinalizar={handleFinalizar}
            onCancelar={() => {
              store.limparCeiaAtual();
              setTela("dashboard");
            }}
          />
        )}
        {tela === "relatorio" && ceiaRelatorio && (
          <ReportView
            key="relatorio"
            ceia={ceiaRelatorio}
            onVoltar={() => {
              setCeiaRelatorio(null);
              store.limparCeiaAtual();
              setTela("dashboard");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
