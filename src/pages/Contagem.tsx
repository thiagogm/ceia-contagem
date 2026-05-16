import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sun, Moon, Settings, CheckCircle2, Cloud } from "lucide-react";
import { toast } from "sonner";
import type { Categoria, SantaCeia } from "@/types/santa-ceia";
import { CATEGORIA_LABELS, CATEGORIA_ORDER } from "@/types/santa-ceia";
import { CountingZone } from "@/components/CountingZone";
import { CategorySelector } from "@/components/CategorySelector";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAccessibilityStore } from "@/hooks/use-accessibility-store";

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
  const [showSettings, setShowSettings] = useState(false);
  const [undoData, setUndoData] = useState<{ cat: Categoria; count: number } | null>(null);
  const [savedPulse, setSavedPulse] = useState(false);

  const { settings, update, toggleDarkMode, triggerHaptic } = useAccessibilityStore();

  const rodadaNumero = ceia.categorias[categoriaAtual].rodadas.length + 1;

  const rodadasPorCategoria = CATEGORIA_ORDER.reduce((acc, cat) => {
    acc[cat] = ceia.categorias[cat].rodadas.length;
    return acc;
  }, {} as Record<Categoria, number>);

  // Autosave pulse — flashes the "salvo" badge whenever the stored ceia updates
  useEffect(() => {
    setSavedPulse(true);
    const t = setTimeout(() => setSavedPulse(false), 1200);
    return () => clearTimeout(t);
  }, [ceia.totalGeral, ceia.categorias.enfermos.total, ceia.categorias.irmas.total, ceia.categorias.irmaos.total]);

  const handleIncrement = useCallback(() => {
    setContagemAtual((p) => p + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setContagemAtual((p) => Math.max(0, p - 1));
  }, []);

  const handleHaptic = useCallback((type: "increment" | "decrement") => {
    triggerHaptic(type);
  }, [triggerHaptic]);

  const handleFinalizarRodada = () => {
    if (contagemAtual === 0) return;
    setShowConfirm(true);
  };

  const confirmarRodada = () => {
    const cat = categoriaAtual;
    const count = contagemAtual;
    onSalvarRodada(categoriaAtual, contagemAtual);
    setUndoData({ cat: categoriaAtual, count: contagemAtual });
    setContagemAtual(0);
    setShowConfirm(false);
    triggerHaptic("action");
    toast.success(`Rodada salva — ${CATEGORIA_LABELS[cat]}`, {
      description: `${count} ${count === 1 ? "pessoa" : "pessoas"} contabilizadas.`,
      duration: 2200,
    });
    setTimeout(() => setUndoData(null), 5000);
  };

  const handleChangeCategoria = (cat: Categoria) => {
    if (contagemAtual > 0) {
      onSalvarRodada(categoriaAtual, contagemAtual);
      toast.success(`Salvo em ${CATEGORIA_LABELS[categoriaAtual]}: ${contagemAtual}`, { duration: 1600 });
      setContagemAtual(0);
    }
    setCategoriaAtual(cat);
    triggerHaptic("action");
  };

  // Per-category accent color tokens (color-blind safe icons + labels handle differentiation)
  const categoriaTheme: Record<Categoria, { ring: string; chip: string; icon: string }> = {
    enfermos: { ring: "ring-amber-400/40", chip: "bg-amber-400/15 text-amber-300", icon: "♿" },
    irmas:    { ring: "ring-rose-400/40",  chip: "bg-rose-400/15 text-rose-300",  icon: "👩" },
    irmaos:   { ring: "ring-sky-400/40",   chip: "bg-sky-400/15 text-sky-300",    icon: "👨" },
  };
  const theme = categoriaTheme[categoriaAtual];
  const totalGeralComAtual = ceia.totalGeral + contagemAtual;

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <button onClick={onCancelar} className="p-2 rounded-xl bg-surface-active" aria-label="Cancelar">
          <X className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {savedPulse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider"
              >
                <CheckCircle2 className="w-3 h-3" /> Salvo
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-active text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
            <Cloud className="w-3 h-3" /> Auto
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-surface-active"
            aria-label={settings.darkMode ? "Modo claro" : "Modo escuro"}
          >
            {settings.darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl bg-surface-active"
            aria-label="Configurações"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Bento grid */}
      <div className="flex-1 flex flex-col gap-3 px-3 py-2 overflow-hidden">
        {/* Status tile — current category + round */}
        <motion.div
          layout
          className={`bento-tile flex items-center justify-between py-3 ring-2 ${theme.ring}`}
        >
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${theme.chip}`} aria-hidden>
              {theme.icon}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contando</p>
              <p className="text-base font-bold text-foreground leading-tight">
                {CATEGORIA_LABELS[categoriaAtual]}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rodada</p>
            <p className="text-2xl font-extrabold tabular-nums text-foreground leading-none font-display">#{rodadaNumero}</p>
          </div>
        </motion.div>

        {/* Counter tile — the main tap zone */}
        <AnimatePresence mode="wait">
          <motion.div
            key={categoriaAtual}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="bento-tile p-0 overflow-hidden flex-1 min-h-0 flex"
          >
            <div className="flex-1 flex">
              <CountingZone
                count={contagemAtual}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onHaptic={handleHaptic}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Mini stats row — totals at a glance */}
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIA_ORDER.map((cat) => {
            const t = ceia.categorias[cat].total;
            const r = ceia.categorias[cat].rodadas.length;
            const isActive = cat === categoriaAtual;
            return (
              <motion.div
                key={cat}
                layout
                className={`bento-tile py-2.5 px-3 text-center ${
                  isActive ? "ring-2 " + categoriaTheme[cat].ring : ""
                }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                  {CATEGORIA_LABELS[cat]}
                </p>
                <p className="text-xl font-extrabold tabular-nums text-foreground font-display leading-none mt-1">
                  {t}
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{r} rod.</p>
              </motion.div>
            );
          })}
        </div>

        {/* Grand total tile */}
        <div className="bento-tile-primary flex items-center justify-between py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Geral</p>
            <p className="text-3xl font-extrabold tabular-nums font-display leading-none mt-0.5">
              {totalGeralComAtual}
            </p>
          </div>
          <button
            onClick={() => setShowFinalizar(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-foreground/15 text-primary-foreground text-xs font-bold backdrop-blur-sm"
            aria-label="Encerrar Santa Ceia"
          >
            <Check className="w-3.5 h-3.5" /> Encerrar
          </button>
        </div>
      </div>

      {/* Undo Toast */}
      <AnimatePresence>
        {undoData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-44 left-4 right-4 rounded-2xl p-3 flex items-center justify-between z-20 card-surface-sm"
          >
            <span className="text-sm text-foreground">
              <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-success" />
              {CATEGORIA_LABELS[undoData.cat]}: {undoData.count} salvo
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Save button + Category tabs at bottom */}
      <div className="px-3 pb-2 pt-1">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleFinalizarRodada}
          disabled={contagemAtual === 0}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            contagemAtual > 0
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          ✓ Salvar Rodada #{rodadaNumero} • {contagemAtual}{" "}
          {contagemAtual === 1 ? "pessoa" : "pessoas"}
        </motion.button>
      </div>

      {/* Bottom Category Tabs */}
      <div className="pb-3">
        <CategorySelector
          categoriaAtual={categoriaAtual}
          onChange={handleChangeCategoria}
          rodadasPorCategoria={rodadasPorCategoria}
        />
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        open={showSettings}
        onClose={() => setShowSettings(false)}
        textSize={settings.textSize}
        contrast={settings.contrast}
        vibration={settings.vibration}
        onTextSize={(v) => update("textSize", v)}
        onContrast={(v) => update("contrast", v)}
        onVibration={(v) => update("vibration", v)}
      />

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
              <p className="label-caps text-center">
                {CATEGORIA_LABELS[categoriaAtual]} — Rodada {rodadaNumero}
              </p>
              <p className="text-5xl font-extrabold text-center tabular-nums text-foreground">
                {contagemAtual}
              </p>
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
              <h3 className="text-lg font-bold text-center text-foreground">
                Encerrar Santa Ceia?
              </h3>
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
