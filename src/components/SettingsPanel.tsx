import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { TextSize, ContrastMode } from "@/hooks/use-accessibility-store";

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
