import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { useSantaCeiaStore, SantaCeiaProvider } from "./use-santa-ceia-store";

describe("useSantaCeiaStore Business Logic", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SantaCeiaProvider>{children}</SantaCeiaProvider>
  );

  it("deve iniciar com o historico vazio e ceiaAtual nulo", () => {
    const { result } = renderHook(() => useSantaCeiaStore(), { wrapper });
    expect(result.current.historico).toEqual([]);
    expect(result.current.ceiaAtual).toBeNull();
  });

  it("deve iniciar uma nova ceia corretamente com o nome da localidade", () => {
    const { result } = renderHook(() => useSantaCeiaStore(), { wrapper });
    
    act(() => {
      result.current.iniciarNovaCeia("Igreja Sede");
    });

    expect(result.current.ceiaAtual).not.toBeNull();
    expect(result.current.ceiaAtual?.localidade).toBe("Igreja Sede");
    expect(result.current.ceiaAtual?.totalGeral).toBe(0);
    expect(result.current.ceiaAtual?.finalizada).toBe(false);
  });

  it("deve adicionar múltiplas rodadas e calcular os totais por categoria e total geral", () => {
    const { result } = renderHook(() => useSantaCeiaStore(), { wrapper });
    
    act(() => {
      result.current.iniciarNovaCeia("Teste");
    });

    act(() => {
      result.current.adicionarRodada("enfermos", 5);
      result.current.adicionarRodada("enfermos", 3);
      result.current.adicionarRodada("irmas", 10);
    });

    const ceia = result.current.ceiaAtual;
    expect(ceia?.categorias.enfermos.total).toBe(8); // 5 + 3
    expect(ceia?.categorias.enfermos.rodadas).toHaveLength(2);
    expect(ceia?.categorias.irmas.total).toBe(10);
    expect(ceia?.categorias.irmaos.total).toBe(0);
    expect(ceia?.totalGeral).toBe(18); // 8 + 10
  });

  it("deve finalizar a ceia e salvar no histórico", () => {
    const { result } = renderHook(() => useSantaCeiaStore(), { wrapper });
    
    act(() => {
      result.current.iniciarNovaCeia("Ceia Final");
      result.current.adicionarRodada("irmaos", 50);
    });

    act(() => {
      result.current.finalizarCeia();
    });

    expect(result.current.ceiaAtual?.finalizada).toBe(true);
    expect(result.current.historico).toHaveLength(1);
    expect(result.current.historico[0].localidade).toBe("Ceia Final");
    expect(result.current.historico[0].totalGeral).toBe(50);
  });

  it("deve limpar a ceia atual da memória após finalização", () => {
    const { result } = renderHook(() => useSantaCeiaStore(), { wrapper });
    
    act(() => {
      result.current.iniciarNovaCeia("Limpeza");
      result.current.limparCeiaAtual();
    });

    expect(result.current.ceiaAtual).toBeNull();
  });
});
