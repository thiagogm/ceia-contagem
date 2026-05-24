import React, { useState, useCallback, useEffect, createContext, useContext } from "react";
import type { SantaCeia, Categoria } from "@/types/santa-ceia";
import { criarSantaCeiaVazia } from "@/types/santa-ceia";

const STORAGE_KEY_HISTORICO = "santa-ceia-historico";
const STORAGE_KEY_ATUAL = "santa-ceia-atual";

function loadHistorico(): SantaCeia[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORICO);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        data: new Date(c.data),
      }));
    }
  } catch (e) {
    console.error("Falha ao carregar histórico", e);
  }
  return [];
}

function loadCeiaAtual(): SantaCeia | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ATUAL);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.data = new Date(parsed.data);
      return parsed;
    }
  } catch (e) {
    console.error("Falha ao carregar ceia atual", e);
  }
  return null;
}

interface SantaCeiaContextType {
  historico: SantaCeia[];
  ceiaAtual: SantaCeia | null;
  iniciarNovaCeia: (localidade: string) => SantaCeia;
  adicionarRodada: (categoria: Categoria, contagem: number) => void;
  finalizarCeia: () => void;
  obterCeiaFinalizada: () => SantaCeia | null;
  limparCeiaAtual: () => void;
  excluirCeia: (id: string) => void;
  atualizarOficiantes: (id: string, of: Partial<import("@/types/santa-ceia").Oficiantes>) => void;
  atualizarContagemRodada: (ceiaId: string, categoria: Categoria, rodadaId: string, novaContagem: number) => void;
}

const SantaCeiaContext = createContext<SantaCeiaContextType | null>(null);

export function SantaCeiaProvider({ children }: { children: React.ReactNode }) {
  const [historico, setHistorico] = useState<SantaCeia[]>(loadHistorico);
  const [ceiaAtual, setCeiaAtual] = useState<SantaCeia | null>(loadCeiaAtual);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORICO, JSON.stringify(historico));
    } catch (e) {
      console.error("Falha ao salvar histórico", e);
    }
  }, [historico]);

  useEffect(() => {
    try {
      if (ceiaAtual) {
        localStorage.setItem(STORAGE_KEY_ATUAL, JSON.stringify(ceiaAtual));
      } else {
        localStorage.removeItem(STORAGE_KEY_ATUAL);
      }
    } catch (e) {
      console.error("Falha ao salvar ceia atual", e);
    }
  }, [ceiaAtual]);

  const iniciarNovaCeia = useCallback((localidade: string) => {
    const nova = criarSantaCeiaVazia(localidade);
    setCeiaAtual(nova);
    return nova;
  }, []);

  const adicionarRodada = useCallback((categoria: Categoria, contagem: number) => {
    setCeiaAtual((prev) => {
      if (!prev) return prev;
      const catData = prev.categorias[categoria];
      const novaRodada = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        numero: catData.rodadas.length + 1,
        contagem,
      };
      const novasRodadas = [...catData.rodadas, novaRodada];
      const novoTotal = novasRodadas.reduce((s, r) => s + r.contagem, 0);

      const novasCategorias = {
        ...prev.categorias,
        [categoria]: { rodadas: novasRodadas, total: novoTotal },
      };

      const totalGeral = Object.values(novasCategorias).reduce((s, c) => s + c.total, 0);

      return { ...prev, categorias: novasCategorias, totalGeral };
    });
  }, []);

  const finalizarCeia = useCallback(() => {
    setCeiaAtual((prev) => {
      if (!prev) return prev;
      const finalizada = { ...prev, finalizada: true };
      setHistorico((h) => [finalizada, ...h]);
      return finalizada;
    });
  }, []);

  const obterCeiaFinalizada = useCallback(() => {
    return ceiaAtual;
  }, [ceiaAtual]);

  const limparCeiaAtual = useCallback(() => {
    setCeiaAtual(null);
  }, []);

  const excluirCeia = useCallback((id: string) => {
    setHistorico((h) => h.filter((c) => c.id !== id));
  }, []);

  const atualizarOficiantes = useCallback((id: string, of: Partial<import("@/types/santa-ceia").Oficiantes>) => {
    setHistorico((h) =>
      h.map((ceia) => {
        if (ceia.id === id) {
          return {
            ...ceia,
            oficiantes: {
              ...ceia.oficiantes,
              ...of,
            } as import("@/types/santa-ceia").Oficiantes,
          };
        }
        return ceia;
      })
    );
  }, []);

  const atualizarContagemRodada = useCallback((ceiaId: string, categoria: Categoria, rodadaId: string, novaContagem: number) => {
    setHistorico((h) =>
      h.map((ceia) => {
        if (ceia.id === ceiaId) {
          const catData = ceia.categorias[categoria];
          const novasRodadas = catData.rodadas.map((r) => {
            if (r.id === rodadaId) {
              return { ...r, contagem: novaContagem };
            }
            return r;
          });
          const novoTotal = novasRodadas.reduce((s, r) => s + r.contagem, 0);

          const novasCategorias = {
            ...ceia.categorias,
            [categoria]: { rodadas: novasRodadas, total: novoTotal },
          };

          const totalGeral = Object.values(novasCategorias).reduce((s, c) => s + c.total, 0);

          return { ...ceia, categorias: novasCategorias, totalGeral };
        }
        return ceia;
      })
    );
  }, []);

  const value = {
    historico,
    ceiaAtual,
    iniciarNovaCeia,
    adicionarRodada,
    finalizarCeia,
    obterCeiaFinalizada,
    limparCeiaAtual,
    excluirCeia,
    atualizarOficiantes,
    atualizarContagemRodada,
  };

  return (
    <SantaCeiaContext.Provider value={value}>
      {children}
    </SantaCeiaContext.Provider>
  );
}

export function useSantaCeiaStore() {
  const context = useContext(SantaCeiaContext);
  if (!context) {
    throw new Error("useSantaCeiaStore must be used within a SantaCeiaProvider");
  }
  return context;
}
