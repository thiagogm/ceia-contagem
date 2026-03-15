import { motion } from "framer-motion";
import { Share2, ArrowLeft, Users, BarChart3 } from "lucide-react";
import type { SantaCeia } from "@/types/santa-ceia";
import { CATEGORIA_LABELS, CATEGORIA_ORDER, formatarData, gerarRelatorioTexto } from "@/types/santa-ceia";

interface ReportViewProps {
  ceia: SantaCeia;
  onVoltar: () => void;
}

export function ReportView({ ceia, onVoltar }: ReportViewProps) {
  const totalRodadas = CATEGORIA_ORDER.reduce((s, c) => s + ceia.categorias[c].rodadas.length, 0);
  const media = totalRodadas > 0 ? (ceia.totalGeral / totalRodadas).toFixed(1) : "0";

  const handleCompartilhar = async () => {
    const texto = gerarRelatorioTexto(ceia);
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
      } catch { /* cancelled */ }
    } else {
      // Fallback: copy + WhatsApp link
      await navigator.clipboard.writeText(texto);
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    }
  };

  // Calculate max for bar chart
  const maxCategoria = Math.max(...CATEGORIA_ORDER.map((c) => ceia.categorias[c].total), 1);

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={onVoltar} className="p-2 rounded-xl bg-surface-active">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">Relatório</h1>
          <p className="text-xs text-muted-foreground">{formatarData(ceia.data)}</p>
        </div>
        <button
          onClick={handleCompartilhar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Share2 className="w-4 h-4" />
          Enviar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
        {/* Total Card */}
        <div className="card-surface p-6 text-center">
          <p className="label-caps mb-2">Participantes Totais</p>
          <p className="text-6xl font-extrabold tracking-tighter tabular-nums text-foreground">{ceia.totalGeral}</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">{totalRodadas}</p>
              <p className="text-xs text-muted-foreground">Rodadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold tabular-nums text-foreground">{media}</p>
              <p className="text-xs text-muted-foreground">Média/Rodada</p>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <p className="label-caps">Por Categoria</p>
          </div>
          <div className="space-y-3">
            {CATEGORIA_ORDER.map((cat) => {
              const catData = ceia.categorias[cat];
              const pct = maxCategoria > 0 ? (catData.total / maxCategoria) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{CATEGORIA_LABELS[cat]}</span>
                    <span className="font-semibold tabular-nums text-foreground">{catData.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rounds detail */}
        {CATEGORIA_ORDER.map((cat) => {
          const catData = ceia.categorias[cat];
          if (catData.rodadas.length === 0) return null;
          return (
            <div key={cat} className="card-surface p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="label-caps">{CATEGORIA_LABELS[cat]}</p>
                <span className="ml-auto text-sm font-bold tabular-nums text-foreground">{catData.total}</span>
              </div>
              <div className="space-y-2">
                {catData.rodadas.map((r) => (
                  <div key={r.id} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span className="text-muted-foreground">Rodada {r.numero}</span>
                    <span className="font-semibold tabular-nums text-foreground">{r.contagem}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Locality */}
        {ceia.localidade && (
          <p className="text-center text-xs text-muted-foreground pt-2">
            {ceia.localidade}
          </p>
        )}
      </div>
    </motion.div>
  );
}
