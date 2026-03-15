import { motion } from "framer-motion";
import { Heart, Users } from "lucide-react";
import type { Categoria } from "@/types/santa-ceia";
import { CATEGORIA_LABELS, CATEGORIA_ORDER } from "@/types/santa-ceia";

interface CategorySelectorProps {
  categoriaAtual: Categoria;
  onChange: (cat: Categoria) => void;
  rodadasPorCategoria: Record<Categoria, number>;
}

const ICONS: Record<Categoria, typeof Heart> = {
  enfermos: Heart,
  irmas: Users,
  irmaos: Users,
};

export function CategorySelector({ categoriaAtual, onChange, rodadasPorCategoria }: CategorySelectorProps) {
  return (
    <div className="flex gap-2 px-4">
      {CATEGORIA_ORDER.map((cat) => {
        const Icon = ICONS[cat];
        const isActive = cat === categoriaAtual;
        const rodadas = rodadasPorCategoria[cat];

        return (
          <button
            key={cat}
            onClick={() => {
              onChange(cat);
              if ("vibrate" in navigator) navigator.vibrate(10);
            }}
            className={`
              relative flex-1 py-3 px-2 rounded-2xl text-center transition-colors duration-200
              ${isActive ? "bg-primary/15" : "bg-surface-active"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-2xl border border-primary/30"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={`w-4 h-4 mx-auto mb-1 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-semibold block ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {CATEGORIA_LABELS[cat]}
            </span>
            {rodadas > 0 && (
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                {rodadas} rod.
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
