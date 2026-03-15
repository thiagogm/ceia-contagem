import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Trash2, Clock } from "lucide-react";
import type { SantaCeia } from "@/types/santa-ceia";
import { formatarDataCurta, CATEGORIA_ORDER, CATEGORIA_LABELS } from "@/types/santa-ceia";

interface DashboardProps {
  historico: SantaCeia[];
  onNovaCeia: (localidade: string) => void;
  onVerRelatorio: (ceia: SantaCeia) => void;
  onExcluir: (id: string) => void;
}

export function Dashboard({ historico, onNovaCeia, onVerRelatorio, onExcluir }: DashboardProps) {
  const [showModal, setShowModal] = useState(false);
  const [localidade, setLocalidade] = useState("");

  const handleIniciar = () => {
    onNovaCeia(localidade.trim() || "Congregação");
    setShowModal(false);
    setLocalidade("");
  };

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Santa Ceia</h1>
        <p className="text-sm text-muted-foreground mt-1">Contador de participantes</p>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <Clock className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">Nenhuma contagem registrada</p>
            <p className="text-muted-foreground/50 text-xs mt-1">Inicie uma nova Santa Ceia abaixo</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="label-caps mb-2">Histórico</p>
            {historico.map((ceia) => (
              <motion.div
                key={ceia.id}
                layout
                className="card-surface-sm p-4 flex items-center gap-3"
              >
                <button
                  onClick={() => onVerRelatorio(ceia)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ceia.localidade}</p>
                      <p className="text-xs text-muted-foreground">{formatarDataCurta(ceia.data)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold tabular-nums text-foreground">{ceia.totalGeral}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    {CATEGORIA_ORDER.map((cat) => {
                      const t = ceia.categorias[cat].total;
                      if (t === 0) return null;
                      return (
                        <span key={cat} className="text-[10px] text-muted-foreground">
                          {CATEGORIA_LABELS[cat]}: {t}
                        </span>
                      );
                    })}
                  </div>
                </button>
                <button
                  onClick={() => onExcluir(ceia.id)}
                  className="p-2 rounded-xl text-muted-foreground/40 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-30">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Nova Santa Ceia
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8 space-y-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-2" />
              <h2 className="text-lg font-bold text-foreground">Nova Contagem</h2>
              <div>
                <label className="label-caps block mb-2">Congregação / Localidade</label>
                <input
                  type="text"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  placeholder="Ex: Itaquera, Brás..."
                  className="w-full bg-accent rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              </div>
              <button
                onClick={handleIniciar}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                Iniciar Contagem
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
