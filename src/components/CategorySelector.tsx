import { motion } from "framer-motion";
import type { Categoria } from "@/types/santa-ceia";
import { CATEGORIA_ORDER } from "@/types/santa-ceia";

interface CategorySelectorProps {
  categoriaAtual: Categoria;
  onChange: (cat: Categoria) => void;
  rodadasPorCategoria: Record<Categoria, number>;
}

const CATEGORY_CONFIG: Record<Categoria, { icon: string; label: string; colorClass: string; activeClass: string }> = {
  enfermos: {
    icon: "♿",
    label: "Enfermos",
    colorClass: "text-amber-400",
    activeClass: "bg-amber-400/15 border-amber-400/40",
  },
  irmas: {
    icon: "👩",
    label: "Irmãs",
    colorClass: "text-rose-400",
    activeClass: "bg-rose-400/15 border-rose-400/40",
  },
  irmaos: {
    icon: "👨",
    label: "Irmãos",
    colorClass: "text-sky-400",
    activeClass: "bg-sky-400/15 border-sky-400/40",
  },
};

export function CategorySelector({ categoriaAtual, onChange, rodadasPorCategoria }: CategorySelectorProps) {
  return (
    <div className="flex gap-2 px-3 pb-2" role="tablist" aria-label="Categorias">
      {CATEGORIA_ORDER.map((cat) => {
        const config = CATEGORY_CONFIG[cat];
        const isActive = cat === categoriaAtual;
        const rodadas = rodadasPorCategoria[cat];

        return (
          <button
            key={cat}
            role="tab"
            onClick={() => {
              onChange(cat);
              if ("vibrate" in navigator) navigator.vibrate(10);
            }}
            className={`
              relative flex-1 py-3 px-2 rounded-2xl text-center transition-all duration-200 min-h-[76px]
              border-2
              ${isActive ? config.activeClass + " scale-[1.02]" : "bg-surface-active border-transparent active:scale-95"}
            `}
            aria-current={isActive ? "true" : undefined}
            aria-selected={isActive}
            aria-label={`${config.label} - ${rodadas} rodadas`}
          >
            {isActive && (
              <motion.div
                layoutId="category-bottom-indicator"
                className="absolute bottom-0 left-3 right-3 h-1 rounded-full bg-current"
                style={{ color: "inherit" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="text-2xl block leading-none mb-1" role="img" aria-hidden="true">
              {config.icon}
            </span>
            <span className={`text-sm font-bold block ${isActive ? config.colorClass : "text-muted-foreground"}`}>
              {config.label}
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
