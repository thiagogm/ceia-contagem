import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ArrowLeft, Users, BarChart3, UserCheck, Edit3, X } from "lucide-react";
import type { SantaCeia } from "@/types/santa-ceia";
import { CATEGORIA_LABELS, CATEGORIA_ORDER, formatarData, gerarRelatorioTexto } from "@/types/santa-ceia";
import { useSantaCeiaStore } from "@/hooks/use-santa-ceia-store";

interface ReportViewProps {
  ceia: SantaCeia;
  onVoltar: () => void;
}

export function ReportView({ ceia, onVoltar }: ReportViewProps) {
  const { atualizarOficiantes } = useSantaCeiaStore();
  const [showEditModal, setShowEditModal] = useState(false);

  // Local state for oficiantes textareas
  const [anciaesText, setAnciaesText] = useState("");
  const [cooperadoresText, setCooperadoresText] = useState("");
  const [cooperadoresJovensText, setCooperadoresJovensText] = useState("");
  const [diaconosText, setDiaconosText] = useState("");

  const handleOpenEdit = () => {
    setAnciaesText(ceia.oficiantes?.anciaes.join("\n") || "");
    setCooperadoresText(ceia.oficiantes?.cooperadores.join("\n") || "");
    setCooperadoresJovensText(ceia.oficiantes?.cooperadoresJovens.join("\n") || "");
    setDiaconosText(ceia.oficiantes?.diaconos.join("\n") || "");
    setShowEditModal(true);
  };

  const handleSaveOficiantes = () => {
    const parseLines = (text: string) =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    atualizarOficiantes(ceia.id, {
      anciaes: parseLines(anciaesText),
      cooperadores: parseLines(cooperadoresText),
      cooperadoresJovens: parseLines(cooperadoresJovensText),
      diaconos: parseLines(diaconosText),
    });
    setShowEditModal(false);
  };

  const totalRodadas = CATEGORIA_ORDER.reduce((s, c) => s + ceia.categorias[c].rodadas.length, 0);
  const media = totalRodadas > 0 ? (ceia.totalGeral / totalRodadas).toFixed(1) : "0";

  const handleCompartilhar = async () => {
    const texto = gerarRelatorioTexto(ceia);
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch { /* cancelled */ }
    }

    // Fallback: Clipboard API or traditional execCommand for HTTP insecure context
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = texto;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn("Clipboard fallback failed:", err);
    }

    // Always launch WhatsApp sharing using native deep links on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const whatsappUrl = isMobile
      ? `whatsapp://send?text=${encodeURIComponent(texto)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;

    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, "_blank");
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
        <div className="rounded-[1.5rem] bg-gradient-to-br from-primary to-blue-600 p-6 text-center text-primary-foreground shadow-lg shadow-primary/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest opacity-90 mb-2">Participantes Totais</p>
            <p className="text-7xl font-extrabold tracking-tighter tabular-nums font-display">{ceia.totalGeral}</p>
            <div className="flex justify-center gap-6 mt-5">
              <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl py-2.5 px-5 flex-1 max-w-[120px]">
                <p className="text-2xl font-bold tabular-nums">{totalRodadas}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">Rodadas</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl py-2.5 px-5 flex-1 max-w-[120px]">
                <p className="text-2xl font-bold tabular-nums">{media}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mt-0.5">Média/Rod</p>
              </div>
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

        {/* Oficiantes Card */}
        <div className="card-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <p className="label-caps">Ministério / Oficiantes</p>
            </div>
            <button
              onClick={handleOpenEdit}
              className="text-xs font-bold text-primary flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit3 className="w-3 h-3" /> Editar
            </button>
          </div>

          {(!ceia.oficiantes || 
            (ceia.oficiantes.anciaes.length === 0 &&
             ceia.oficiantes.cooperadores.length === 0 &&
             ceia.oficiantes.cooperadoresJovens.length === 0 &&
             ceia.oficiantes.diaconos.length === 0)) ? (
            <p className="text-sm text-muted-foreground italic">Nenhum oficiante registrado. Clique em Editar para preencher.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {ceia.oficiantes.anciaes.length > 0 && (
                <div>
                  <span className="font-bold text-foreground">Ancião(es) no atendimento:</span>
                  <p className="text-muted-foreground mt-0.5">{ceia.oficiantes.anciaes.join(", ")}</p>
                </div>
              )}
              {ceia.oficiantes.cooperadores.length > 0 && (
                <div>
                  <span className="font-bold text-foreground">Cooperador(es) do ofício:</span>
                  <p className="text-muted-foreground mt-0.5">{ceia.oficiantes.cooperadores.join(", ")}</p>
                </div>
              )}
              {ceia.oficiantes.cooperadoresJovens.length > 0 && (
                <div>
                  <span className="font-bold text-foreground">Cooperador(es) de jovens:</span>
                  <p className="text-muted-foreground mt-0.5">{ceia.oficiantes.cooperadoresJovens.join(", ")}</p>
                </div>
              )}
              {ceia.oficiantes.diaconos.length > 0 && (
                <div>
                  <span className="font-bold text-foreground">Diácono(s):</span>
                  <p className="text-muted-foreground mt-0.5">{ceia.oficiantes.diaconos.join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Locality */}
        {ceia.localidade && (
          <p className="text-center text-xs text-muted-foreground pt-2">
            {ceia.localidade}
          </p>
        )}
      </div>

      {/* Edit Oficiantes Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8dvh] bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="w-full max-w-md bg-card p-6 flex flex-col shadow-2xl space-y-4 rounded-3xl max-h-[85vh] border border-border/40"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground font-display">Oficiantes da Ceia</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Digite um nome por linha. Deixe em branco caso não tenha sido preenchido.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-xl bg-surface-active text-muted-foreground flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                <div>
                  <label className="label-caps block mb-1 text-[10px]">Ancião no Atendimento</label>
                  <textarea
                    value={anciaesText}
                    onChange={(e) => setAnciaesText(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Ex: João da Silva&#10;José de Souza"
                    rows={2}
                    className="w-full bg-accent rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="label-caps block mb-1 text-[10px]">Cooperador do Ofício</label>
                  <textarea
                    value={cooperadoresText}
                    onChange={(e) => setCooperadoresText(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Ex: Pedro Paulo"
                    rows={2}
                    className="w-full bg-accent rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="label-caps block mb-1 text-[10px]">Cooperador de Jovens</label>
                  <textarea
                    value={cooperadoresJovensText}
                    onChange={(e) => setCooperadoresJovensText(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Ex: Lucas Mendes"
                    rows={2}
                    className="w-full bg-accent rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="label-caps block mb-1 text-[10px]">Diácono</label>
                  <textarea
                    value={diaconosText}
                    onChange={(e) => setDiaconosText(e.target.value)}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="Ex: Marcos Antônio&#10;Felipe Souza"
                    rows={2}
                    className="w-full bg-accent rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex-shrink-0 pt-2">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleSaveOficiantes();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30"
                >
                  Salvar Informações
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
