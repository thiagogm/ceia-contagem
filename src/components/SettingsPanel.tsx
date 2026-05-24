import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { TextSize, ContrastMode } from "@/hooks/use-accessibility-store";
import { useSantaCeiaStore } from "@/hooks/use-santa-ceia-store";
import { toast } from "sonner";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  textSize: TextSize;
  contrast: ContrastMode;
  vibration: boolean;
  onTextSize: (v: TextSize) => void;
  onContrast: (v: ContrastMode) => void;
  onVibration: (v: boolean) => void;
}

function OptionGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="label-caps text-xs">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPanel({
  open,
  onClose,
  textSize,
  contrast,
  vibration,
  onTextSize,
  onContrast,
  onVibration,
}: SettingsPanelProps) {
  const { historico, restaurarHistorico, limparHistorico } = useSantaCeiaStore();

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(historico, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `santa-ceia-backup-${new Date().toISOString().slice(0,10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success("Backup exportado com sucesso!");
    } catch (e) {
      toast.error("Falha ao exportar o backup.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!Array.isArray(parsed)) {
            throw new Error("Formato inválido");
          }
          const isValid = parsed.every(c => c.id && c.localidade && c.categorias);
          if (!isValid) {
            throw new Error("Estrutura inválida");
          }
          const restored = parsed.map(c => ({
            ...c,
            data: new Date(c.data).toISOString()
          }));
          restaurarHistorico(restored);
          toast.success("Histórico restaurado com sucesso!");
        } catch (err) {
          toast.error("Arquivo de backup inválido ou corrompido.");
        }
      };
    }
  };

  const handleClear = () => {
    const confirmed1 = window.confirm("Deseja realmente apagar TODO o histórico de contagens?");
    if (confirmed1) {
      const confirmed2 = window.confirm("ATENÇÃO: Esta ação é definitiva e não poderá ser desfeita. Tem certeza absoluta?");
      if (confirmed2) {
        limparHistorico();
        toast.success("Histórico limpo com sucesso!");
      }
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md bg-card rounded-t-3xl p-6 space-y-6 card-surface"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Ajustes</h3>
              <button onClick={onClose} className="p-2 rounded-xl bg-surface-active">
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            <OptionGroup
              label="Tamanho do Texto"
              options={[
                { value: "normal" as TextSize, label: "Normal" },
                { value: "grande" as TextSize, label: "Grande" },
                { value: "extra" as TextSize, label: "Extra" },
              ]}
              value={textSize}
              onChange={onTextSize}
            />

            <OptionGroup
              label="Contraste"
              options={[
                { value: "padrao" as ContrastMode, label: "Padrão" },
                { value: "alto" as ContrastMode, label: "Alto Contraste" },
              ]}
              value={contrast}
              onChange={onContrast}
            />

            <div className="space-y-2">
              <p className="label-caps text-xs">Vibração</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onVibration(true)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                    vibration
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  Ligada
                </button>
                <button
                  onClick={() => onVibration(false)}
                  className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                    !vibration
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  Desligada
                </button>
              </div>
            </div>

            {/* Dados e Segurança */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <p className="label-caps text-xs">Dados e Segurança</p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExport}
                  disabled={historico.length === 0}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    historico.length > 0
                      ? "bg-secondary text-foreground hover:bg-surface-active"
                      : "bg-secondary/40 text-muted-foreground/40 cursor-not-allowed"
                  }`}
                >
                  📥 Exportar Backup
                </button>
                
                <label className="py-3 rounded-2xl text-xs font-bold bg-secondary text-foreground hover:bg-surface-active transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center">
                  📤 Importar Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              {historico.length > 0 && (
                <button
                  onClick={handleClear}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-destructive/10 border border-destructive/20 active:bg-destructive/25 text-destructive transition-colors flex items-center justify-center gap-1.5"
                >
                  🗑️ Limpar Histórico Completo
                </button>
              )}
            </div>

            {/* Version Footer */}
            <div className="text-center pt-2 flex flex-col items-center justify-center text-[10px] text-muted-foreground/60 font-semibold tracking-wide flex-shrink-0">
              <p>Santa Ceia Contador • Versão 1.2.0</p>
              <p className="mt-0.5 opacity-80">Desenvolvido com dedicação para a CCB</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
