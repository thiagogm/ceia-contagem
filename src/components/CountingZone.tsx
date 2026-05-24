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
  const intervalTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isLongPress = useRef(false);
  const rippleId = useRef(0);

  const addRipple = useCallback((clientX: number, clientY: number, rect: DOMRect, kind: "plus" | "minus") => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    setFloats((prev) => [...prev, { id, x, y, kind }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 800);
  }, []);

  const clearTimers = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (intervalTimer.current) {
      clearInterval(intervalTimer.current);
      intervalTimer.current = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isLongPress.current = false;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;

    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      // First decrement
      onDecrement();
      onHaptic?.("decrement");
      addRipple(clientX, clientY, rect, "minus");

      // Auto-decrement loop
      intervalTimer.current = setInterval(() => {
        onDecrement();
        onHaptic?.("decrement");
        addRipple(clientX, clientY, rect, "minus");
      }, 800); // 800ms between decrements for better control
    }, 700); // 700ms to trigger long press
  }, [onDecrement, onHaptic, addRipple]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    clearTimers();
    if (!isLongPress.current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const { clientX, clientY } = e;
      addRipple(clientX, clientY, rect, "plus");
      onIncrement();
      onHaptic?.("increment");
    }
  }, [onIncrement, onHaptic, addRipple, clearTimers]);

  const handlePointerLeave = useCallback(() => {
    clearTimers();
  }, [clearTimers]);

  return (
    <motion.div
      className="counting-zone relative overflow-hidden cursor-pointer rounded-3xl flex-1 select-none touch-manipulation"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      role="button"
      aria-label="Área de toque do contador. Toque para somar, segure para subtrair."
    >
      {/* Floating Minus Button (Instant Subtraction) */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => {
          e.stopPropagation();
          onDecrement();
          onHaptic?.("decrement");
        }}
        className="absolute bottom-4 left-4 w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 active:bg-destructive/25 text-destructive flex items-center justify-center shadow-lg transition-colors z-20"
        aria-label="Subtrair 1"
      >
        <Minus className="w-6 h-6" strokeWidth={3} />
      </button>

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

      {/* Counter — centered in available space with aria-live for a11y announcement */}
      <div className="flex-1 flex items-center justify-center min-h-0" aria-live="polite">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={count}
            className="counter-display text-foreground"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {count}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hint */}
      <div className="flex-shrink-0 pb-3 flex flex-col items-center gap-1 px-4">
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
