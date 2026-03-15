import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export function CountingZone({ count, onIncrement, onDecrement, onHaptic }: CountingZoneProps) {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);
  const rippleId = useRef(0);

  const addRipple = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const id = ++rippleId.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  }, []);

  const handlePointerDown = useCallback((_e: React.TouchEvent | React.MouseEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onDecrement();
      onHaptic?.("decrement");
    }, 500);
  }, [onDecrement, onHaptic]);

  const handlePointerUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isLongPress.current) {
      addRipple(e);
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
      className="counting-zone relative overflow-hidden cursor-pointer rounded-3xl"
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute w-20 h-20 rounded-full bg-primary/20 animate-ripple pointer-events-none"
          style={{ left: r.x - 40, top: r.y - 40 }}
        />
      ))}

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
      <p className="absolute bottom-6 label-caps text-muted-foreground/50 text-xs">
        Toque para contar • Segure para corrigir
      </p>
    </motion.div>
  );
}
