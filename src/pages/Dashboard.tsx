import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronRight, Trash2, Clock, Users, TrendingUp, Calendar } from "lucide-react";
import type { SantaCeia } from "@/types/santa-ceia";
import { formatarDataCurta, CATEGORIA_ORDER, CATEGORIA_LABELS } from "@/types/santa-ceia";

interface DashboardProps {
  historico: SantaCeia[];
  onNovaCeia: (localidade: string) => void;
  onVerRelatorio: (ceia: SantaCeia) => void;
  onExcluir: (id: string) => void;
}

const CHIP_BY_CAT: Record<string, string> = {
  enfermos: "bg-amber-400/15 text-amber-300",
  irmas: "bg-rose-400/15 text-rose-300",
  irmaos: "bg-sky-400/15 text-sky-300",
};

export function Dashboard({ historico, onNovaCeia, onVerRelatorio, onExcluir }: DashboardProps) {
  const [showModal, setShowModal] = useState(false);
  const [localidade, setLocalidade] = useState("");

  const stats = useMemo(() => {
    const totalParticipantes = historico.reduce((s, c) => s + c.totalGeral, 0);
    const ultimaCeia = historico[0];
    const media = historico.length > 0 ? Math.round(totalParticipantes / historico.length) : 0;
    return { totalParticipantes, ultimaCeia, media, totalCeias: historico.length };
  }, [historico]);

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
      <header className="px-5 pt-8 pb-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 flex items-center justify-center text-xl" aria-hidden>🍷</div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground font-display tracking-tight leading-none">Santa Ceia</h1>
          <p className="text-xs text-muted-foreground mt-1">Contador oficial por rodada</p>
        </div>
      </header>

      {/* Bento overview */}
      {historico.length > 0 && (
        <section className="px-3 pb-3 grid grid-cols-4 gap-2" aria-label="Visão geral">
          <div className="bento-tile-primary col-span-2 row-span-2 flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 opacity-80" />
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Acumulado</p>
            </div>
            <p className="text-5xl font-extrabold tabular-nums font-display tracking-tighter leading-none">
              {stats.totalParticipantes}
            </p>
            <p className="text-xs opacity-80">em {stats.totalCeias} {stats.totalCeias === 1 ? "ceia" : "ceias"}</p>
          </div>
          <div className="bento-tile col-span-2 py-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-muted-foreground" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Média</p>
            </div>
            <p className="text-2xl font-extrabold tabular-nums font-display text-foreground leading-tight mt-1">
              {stats.media}
            </p>
            <p className="text-[10px] text-muted-foreground">por ceia</p>
          </div>
          <div className="bento-tile col-span-2 py-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Última</p>
            </div>
            <p className="text-2xl font-extrabold tabular-nums font-display text-foreground leading-tight mt-1">
              {stats.ultimaCeia?.totalGeral ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {stats.ultimaCeia ? formatarDataCurta(stats.ultimaCeia.data) : "—"}
            </p>
          </div>
        </section>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-3 pb-32">
        {historico.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-12 text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-4xl mb-4">
              🍷
            </div>
            <h2 className="text-lg font-bold text-foreground font-display">Bem-vindo</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
              Toque em <strong className="text-primary">Nova Santa Ceia</strong> para começar a contagem por rodada.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 w-full max-w-xs">
              {[
                { i: "♿", l: "Enfermos" },
                { i: "👩", l: "Irmãs" },
                { i: "👨", l: "Irmãos" },
              ].map((c) => (
                <div key={c.l} className="bento-tile py-3 text-center">
                  <div className="text-2xl">{c.i}</div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">{c.l}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 px-2 pt-1 pb-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="label-caps text-xs">Histórico</p>
            </div>
            {historico.map((ceia) => (
              <motion.div
                key={ceia.id}
                layout
                className="bento-tile p-3 flex items-center gap-3"
              >
                <button
                  onClick={() => onVerRelatorio(ceia)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">{ceia.localidade}</p>
                      <p className="text-[11px] text-muted-foreground">{formatarDataCurta(ceia.data)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold tabular-nums text-foreground font-display">{ceia.totalGeral}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {CATEGORIA_ORDER.map((cat) => {
                      const t = ceia.categorias[cat].total;
                      if (t === 0) return null;
                      return (
                        <span key={cat} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${CHIP_BY_CAT[cat]}`}>
                          {CATEGORIA_LABELS[cat]}: {t}
                        </span>
                      );
                    })}
                  </div>
                </button>
                <button
                  onClick={() => onExcluir(ceia.id)}
                  className="p-2 rounded-xl text-muted-foreground/40 hover:text-destructive transition-colors"
                  aria-label="Excluir registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <h2 className="text-xl font-extrabold text-foreground font-display">Nova Contagem</h2>
              <p className="text-sm text-muted-foreground -mt-2">Identifique a congregação para o relatório.</p>
              <div>
                <label className="label-caps block mb-2 text-xs">Congregação / Localidade</label>
                <input
                  type="text"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  placeholder="Ex: Itaquera, Brás..."
                  className="w-full bg-accent rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>
              <button
                onClick={handleIniciar}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg shadow-primary/30"
              >
                Iniciar Contagem →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}