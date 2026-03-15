export type Categoria = "enfermos" | "irmas" | "irmaos";

export const CATEGORIA_LABELS: Record<Categoria, string> = {
  enfermos: "Enfermos",
  irmas: "Irmãs",
  irmaos: "Irmãos",
};

export const CATEGORIA_ORDER: Categoria[] = ["enfermos", "irmas", "irmaos"];

export interface Rodada {
  id: string;
  numero: number;
  contagem: number;
}

export interface CategoriaData {
  rodadas: Rodada[];
  total: number;
}

export interface SantaCeia {
  id: string;
  data: string; // ISO date
  localidade: string;
  categorias: Record<Categoria, CategoriaData>;
  totalGeral: number;
  finalizada: boolean;
  criadaEm: string;
}

export function criarSantaCeiaVazia(localidade: string): SantaCeia {
  return {
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
    localidade,
    categorias: {
      enfermos: { rodadas: [], total: 0 },
      irmas: { rodadas: [], total: 0 },
      irmaos: { rodadas: [], total: 0 },
    },
    totalGeral: 0,
    finalizada: false,
    criadaEm: new Date().toISOString(),
  };
}

export function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatarDataCurta(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function gerarRelatorioTexto(ceia: SantaCeia): string {
  const data = formatarData(ceia.data);
  const lines: string[] = [
    `📋 *Relatório Santa Ceia — ${ceia.localidade}*`,
    `📅 _${data}_`,
    "",
  ];

  for (const cat of CATEGORIA_ORDER) {
    const label = CATEGORIA_LABELS[cat];
    const catData = ceia.categorias[cat];
    if (catData.rodadas.length > 0) {
      lines.push(`• *${label}:* ${catData.total} (${catData.rodadas.length} rodada${catData.rodadas.length > 1 ? "s" : ""})`);
    }
  }

  lines.push("");
  lines.push(`*Total: ${ceia.totalGeral} participantes.*`);

  const totalRodadas = CATEGORIA_ORDER.reduce((s, c) => s + ceia.categorias[c].rodadas.length, 0);
  if (totalRodadas > 0) {
    const media = (ceia.totalGeral / totalRodadas).toFixed(1);
    lines.push(`_Média: ${media} por rodada._`);
  }

  return lines.join("\n");
}
