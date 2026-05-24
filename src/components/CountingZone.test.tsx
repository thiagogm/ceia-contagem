import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { CountingZone } from "./CountingZone";

describe("CountingZone UI Integration", () => {
  it("deve renderizar o total atual (count prop)", () => {
    render(<CountingZone count={10} onIncrement={() => {}} onDecrement={() => {}} />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("deve disparar onIncrement em um clique rápido (tap)", () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();
    render(<CountingZone count={0} onIncrement={onIncrement} onDecrement={onDecrement} />);
    
    const zone = screen.getByRole("button");
    fireEvent.mouseDown(zone, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(zone, { clientX: 10, clientY: 10 });
    
    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).not.toHaveBeenCalled();
  });

  it("deve disparar onDecrement após segurar (long press > 500ms)", () => {
    vi.useFakeTimers();
    const onDecrement = vi.fn();
    const onIncrement = vi.fn();
    
    render(<CountingZone count={0} onIncrement={onIncrement} onDecrement={onDecrement} />);
    
    const zone = screen.getByRole("button");
    
    // Toca e segura
    fireEvent.mouseDown(zone, { clientX: 10, clientY: 10 });
    
    // Avança o relógio interno em 550ms
    vi.advanceTimersByTime(550);
    
    // Deve ter subtraído
    expect(onDecrement).toHaveBeenCalledTimes(1);
    
    // Solta o dedo
    fireEvent.mouseUp(zone, { clientX: 10, clientY: 10 });
    
    // Como foi long press, não deve incrementar
    expect(onIncrement).not.toHaveBeenCalled();
    
    vi.useRealTimers();
  });
});
