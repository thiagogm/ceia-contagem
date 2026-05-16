import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface CountingZoneProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onHaptic?: (type: "increment" | "decrement") => void;
}

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

interface FloatLabel {
  id: number;
  x: number;
  y: number;
  kind: "plus" | "minus";
}

export function CountingZone({ count, onIncrement, onDecrement, onHaptic }: CountingZoneProps) {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);
  const [floats, setFloats] = useState<FloatLabel[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const rippleId = useRef(0);

  const addRipple = useCallback((e: React.TouchEvent | React.MouseEvent, kind: "plus" | "minus") => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    setFloats((prev) => [...prev, { id, x, y, kind }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 800);
  }, []);

  const handlePointerDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onDecrement();
      onHaptic?.("decrement");
      addRipple(e, "minus");
    }, 500);
  }, [onDecrement, onHaptic, addRipple]);

  const handlePointerUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      addRipple(e, "plus");
      onIncrement();
      onHaptic?.("increment");
    }
  }, [onIncrement, onHaptic, addRipple]);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  return (
    <motion.div
      className="counting-zone relative overflow-hidden cursor-pointer rounded-3xl flex-1"
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      role="button"
      aria-label={`Contador. Total atual: ${count}. Toque para somar, segure para subtrair.`}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-24 h-24 rounded-full bg-primary/30 animate-ripple pointer-events-none"
          style={{ left: r.x - 40, top: r.y - 40 }}
        />
      ))}

      {/* Floating +1 / -1 labels */}
      <AnimatePresence>
        {floats.map((f) => (
          <motion.span
            key={f.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: 1, y: -60, scale: 1 }}
            exit={{ opacity: 0, y: -90 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`absolute pointer-events-none flex items-center gap-0.5 font-extrabold text-2xl tabular-nums ${
              f.kind === "plus" ? "text-primary" : "text-destructive"
            }`}
            style={{ left: f.x - 16, top: f.y - 20 }}
          >
            {f.kind === "plus" ? <Plus className="w-5 h-5" strokeWidth={3} /> : <Minus className="w-5 h-5" strokeWidth={3} />}
            1
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Counter */}
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          className="counter-display text-foreground"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          {count}
        </motion.span>
      </AnimatePresence>

      {/* Hint */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1 px-4">
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center text-primary">
              <Plus className="w-3 h-3" strokeWidth={3} />
            </span>
            Toque
          </span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-md bg-destructive/15 flex items-center justify-center text-destructive">
              <Minus className="w-3 h-3" strokeWidth={3} />
            </span>
            Segure
          </span>
        </div>
      </div>
    </motion.div>
  );
}
