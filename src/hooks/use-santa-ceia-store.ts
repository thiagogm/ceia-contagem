import { useState, useCallback, useEffect } from "react";
import type { SantaCeia, Categoria } from "@/types/santa-ceia";
import { criarSantaCeiaVazia } from "@/types/santa-ceia";

const STORAGE_KEY = "santa-ceia-historico";

function loadFromStorage(): SantaCeia[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(data: SantaCeia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useSantaCeiaStore() {
  const [historico, setHistorico] = useState<SantaCeia[]>(loadFromStorage);
  const [ceiaAtual, setCeiaAtual] = useState<SantaCeia | null>(null);

  useEffect(() => {
    saveToStorage(historico);
  }, [historico]);

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
        id: crypto.randomUUID(),
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

  return {
    historico,
    ceiaAtual,
    iniciarNovaCeia,
    adicionarRodada,
    finalizarCeia,
    obterCeiaFinalizada,
    limparCeiaAtual,
    excluirCeia,
  };
}
