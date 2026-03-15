import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Categoria, SantaCeia } from "@/types/santa-ceia";
import { CATEGORIA_LABELS, CATEGORIA_ORDER } from "@/types/santa-ceia";
import { CountingZone } from "@/components/CountingZone";
import { CategorySelector } from "@/components/CategorySelector";

interface ContagemProps {
  ceia: SantaCeia;
  onSalvarRodada: (categoria: Categoria, contagem: number) => void;
  onFinalizar: () => void;
  onCancelar: () => void;
}

export function Contagem({ ceia, onSalvarRodada, onFinalizar, onCancelar }: ContagemProps) {
  const [categoriaAtual, setCategoriaAtual] = useState<Categoria>("enfermos");
  const [contagemAtual, setContagemAtual] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [undoData, setUndoData] = useState<{ cat: Categoria; count: number } | null>(null);

  const rodadaNumero = ceia.categorias[categoriaAtual].rodadas.length + 1;

  const rodadasPorCategoria = CATEGORIA_ORDER.reduce((acc, cat) => {
    acc[cat] = ceia.categorias[cat].rodadas.length;
    return acc;
  }, {} as Record<Categoria, number>);

  const handleIncrement = useCallback(() => {
    setContagemAtual((p) => p + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setContagemAtual((p) => Math.max(0, p - 1));
  }, []);

  const handleFinalizarRodada = () => {
    if (contagemAtual === 0) return;
    setShowConfirm(true);
  };

  const confirmarRodada = () => {
    onSalvarRodada(categoriaAtual, contagemAtual);
    setUndoData({ cat: categoriaAtual, count: contagemAtual });
    setContagemAtual(0);
    setShowConfirm(false);

    // Auto-clear undo after 5s
    setTimeout(() => setUndoData(null), 5000);
  };

  const handleChangeCategoria = (cat: Categoria) => {
    if (contagemAtual > 0) {
      // Auto-save current before switching
      onSalvarRodada(categoriaAtual, contagemAtual);
      setContagemAtual(0);
    }
    setCategoriaAtual(cat);
  };

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={onCancelar} className="p-2 rounded-xl bg-surface-active">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="text-center">
          <p className="label-caps">{CATEGORIA_LABELS[categoriaAtual]}</p>
          <p className="text-xs text-muted-foreground/60">Rodada {rodadaNumero}</p>
        </div>
        <button
          onClick={() => setShowFinalizar(true)}
          className="p-2 rounded-xl bg-surface-active"
        >
          <Check className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Category Tabs */}
      <CategorySelector
        categoriaAtual={categoriaAtual}
        onChange={handleChangeCategoria}
        rodadasPorCategoria={rodadasPorCategoria}
      />

      {/* Counting Zone */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={categoriaAtual}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CountingZone
              count={contagemAtual}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {undoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 bg-card rounded-2xl p-3 flex items-center justify-between z-20 card-surface-sm"
          >
            <span className="text-sm text-muted-foreground">
              {CATEGORIA_LABELS[undoData.cat]}: {undoData.count} salvo
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-4 pb-6 pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinalizarRodada}
          disabled={contagemAtual === 0}
          className={`w-full py-4 rounded-2xl font-semibold text-sm transition-colors ${
            contagemAtual > 0
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Finalizar Rodada #{rodadaNumero} • {contagemAtual} {contagemAtual === 1 ? "pessoa" : "pessoas"}
        </motion.button>
      </div>

      {/* Confirm Round Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-card rounded-3xl p-6 space-y-4 card-surface"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="label-caps text-center">{CATEGORIA_LABELS[categoriaAtual]} — Rodada {rodadaNumero}</p>
              <p className="text-5xl font-extrabold text-center tabular-nums text-foreground">{contagemAtual}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm font-semibold"
                >
                  Voltar
                </button>
                <button
                  onClick={confirmarRodada}
                  className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finalize Session Modal */}
      <AnimatePresence>
        {showFinalizar && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFinalizar(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-card rounded-3xl p-6 space-y-4 card-surface"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-center text-foreground">Encerrar Santa Ceia?</h3>
              <p className="text-sm text-center text-muted-foreground">
                Total parcial: {ceia.totalGeral + contagemAtual} participantes
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFinalizar(false)}
                  className="flex-1 py-3 rounded-2xl bg-secondary text-foreground text-sm font-semibold"
                >
                  Continuar
                </button>
                <button
                  onClick={() => {
                    if (contagemAtual > 0) {
                      onSalvarRodada(categoriaAtual, contagemAtual);
                    }
                    onFinalizar();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
                >
                  Encerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
