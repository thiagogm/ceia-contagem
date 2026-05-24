import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Trash2, Clock, Users, TrendingUp, Calendar, Sun, Moon, Settings } from "lucide-react";
import type { SantaCeia } from "@/types/santa-ceia";
import { formatarDataCurta, CATEGORIA_ORDER, CATEGORIA_LABELS } from "@/types/santa-ceia";

import { useNavigate } from "react-router-dom";
import { useSantaCeiaStore } from "@/hooks/use-santa-ceia-store";
import { SettingsPanel } from "@/components/SettingsPanel";
import { useAccessibilityStore } from "@/hooks/use-accessibility-store";

const CHIP_BY_CAT: Record<string, string> = {
  enfermos: "bg-amber-400/20 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  irmas: "bg-rose-400/20 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  irmaos: "bg-sky-400/20 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
};

export function Dashboard() {
  const navigate = useNavigate();
  const { historico, iniciarNovaCeia, excluirCeia } = useSantaCeiaStore();
  const { settings, update, toggleDarkMode } = useAccessibilityStore();
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localidade, setLocalidade] = useState("");

  const stats = useMemo(() => {
    const totalParticipantes = historico.reduce((s, c) => s + c.totalGeral, 0);
    const ultimaCeia = historico[0];
    const media = historico.length > 0 ? Math.round(totalParticipantes / historico.length) : 0;
    return { totalParticipantes, ultimaCeia, media, totalCeias: historico.length };
  }, [historico]);

  const handleIniciar = () => {
    iniciarNovaCeia(localidade.trim() || "Congregação");
    setShowModal(false);
    setLocalidade("");
    // Atrasar levemente a navegação para garantir que o React Context
    // tenha tempo de propagar o ceiaAtual antes da página de contagem montar.
    setTimeout(() => {
      navigate("/contagem");
    }, 10);
  };

  return (
    <motion.div
      className="min-h-screen bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <header className="px-5 pt-8 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center text-xl" aria-hidden>🍷</div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground font-display tracking-tight leading-none">Santa Ceia</h1>
            <p className="text-xs text-muted-foreground mt-1">Contador oficial</p>
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
      </header>

      {/* Bento overview */}
      {historico.length > 0 && (
        <section className="px-4 pb-4 grid grid-cols-2 gap-3" aria-label="Visão geral">
          {/* Total */}
          <div className="col-span-2 rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 p-5 text-primary-foreground shadow-lg shadow-primary/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Users className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-2 opacity-90">
                <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Total de Participantes</p>
              </div>
              <div>
                <p className="text-6xl font-extrabold tabular-nums font-display tracking-tighter leading-none">
                  {stats.totalParticipantes}
                </p>
                <p className="text-sm opacity-80 mt-1 font-medium">Acumulado em {stats.totalCeias} {stats.totalCeias === 1 ? "ceia" : "ceias"}</p>
              </div>
            </div>
          </div>
          
          {/* Media */}
          <div className="rounded-[1.25rem] bg-amber-50 dark:bg-amber-500/10 p-4 border border-amber-100 dark:border-amber-500/20 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">Média</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold tabular-nums font-display text-amber-950 dark:text-amber-100 leading-tight">
                {stats.media}
              </p>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80 font-medium">por ceia</p>
            </div>
          </div>

          {/* Ultima */}
          <div className="rounded-[1.25rem] bg-emerald-50 dark:bg-emerald-500/10 p-4 border border-emerald-100 dark:border-emerald-500/20 flex flex-col justify-between min-h-[110px]">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Última Ceia</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold tabular-nums font-display text-emerald-950 dark:text-emerald-100 leading-tight">
                {stats.ultimaCeia?.totalGeral ?? 0}
              </p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 font-medium truncate">
                {stats.ultimaCeia ? formatarDataCurta(stats.ultimaCeia.data) : "—"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-12 text-center px-6">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-5xl mb-6 shadow-inner">
              🍷
            </div>
            <h2 className="text-xl font-extrabold text-foreground font-display">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-[260px] leading-relaxed">
              Toque em <strong className="text-primary font-bold">Nova Santa Ceia</strong> para começar a primeira contagem.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-xs">
              {[
                { i: "♿", l: "Enfermos", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
                { i: "👩", l: "Irmãs", color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" },
                { i: "👨", l: "Irmãos", color: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400" },
              ].map((c) => (
                <div key={c.l} className="flex flex-col items-center gap-2">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${c.color}`}>
                    {c.i}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.l}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1 pt-2 pb-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground tracking-wide">Histórico Recente</h3>
            </div>
            {historico.map((ceia) => (
              <motion.div
                key={ceia.id}
                layout
                className="bg-card dark:bg-surface rounded-2xl p-4 border border-border/50 shadow-sm flex items-center gap-3 relative overflow-hidden transition-colors"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
                <button
                  onClick={() => navigate(`/relatorio/${ceia.id}`)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-foreground">{ceia.localidade}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{formatarDataCurta(ceia.data)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl font-extrabold tabular-nums text-foreground font-display tracking-tight">{ceia.totalGeral}</span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/60" />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {CATEGORIA_ORDER.map((cat) => {
                      const t = ceia.categorias[cat].total;
                      if (t === 0) return null;
                      return (
                        <span key={cat} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${CHIP_BY_CAT[cat]}`}>
                          {CATEGORIA_LABELS[cat]}: {t}
                        </span>
                      );
                    })}
                  </div>
                </button>
                <div className="pl-2 border-l border-border/50">
                  <button
                    onClick={() => excluirCeia(ceia.id)}
                    className="p-2 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Excluir registro"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-5 left-0 right-0 flex justify-center z-30 pointer-events-none">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="pointer-events-auto flex items-center gap-2 px-7 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/40 ring-4 ring-primary/20"
        >
          <Plus className="w-5 h-5" strokeWidth={3} />
          NOVA SANTA CEIA
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8dvh] bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.form
              className="w-full max-w-md bg-card p-6 rounded-3xl shadow-2xl space-y-4 border border-border/40"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                handleIniciar();
              }}
            >
              <h2 className="text-xl font-extrabold text-foreground font-display">Nova Contagem</h2>
              <p className="text-sm text-muted-foreground -mt-2">Identifique a congregação para o relatório.</p>
              <div>
                <label className="label-caps block mb-2 text-xs">Congregação / Localidade</label>
                <input
                  type="text"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Ex: Itaquera, Brás..."
                  className="w-full bg-accent rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleIniciar();
                }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/30"
              >
                Iniciar Contagem →
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

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
    </motion.div>
  );
}