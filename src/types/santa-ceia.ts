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

export interface Oficiantes {
  anciaes: string[];
  cooperadores: string[];
  cooperadoresJovens: string[];
  diaconos: string[];
}

export interface SantaCeia {
  id: string;
  data: string; // ISO date
  localidade: string;
  categorias: Record<Categoria, CategoriaData>;
  totalGeral: number;
  finalizada: boolean;
  criadaEm: string;
  oficiantes?: Oficiantes;
}

export function criarSantaCeiaVazia(localidade: string): SantaCeia {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2),
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
    oficiantes: {
      anciaes: [],
      cooperadores: [],
      cooperadoresJovens: [],
      diaconos: [],
    },
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
    `*Relatório Santa Ceia - ${ceia.localidade}*`,
    `_${data}_`,
    "",
  ];

  if (ceia.oficiantes) {
    const formatNames = (label: string, names: string[]) => {
      if (names.length === 0) return null;
      if (names.length === 1) return `*${label}:* ${names[0]}`;
      return `*${label}s:* ${names.join(", ")}`;
    };

    const ofs = [
      formatNames("Ancião", ceia.oficiantes.anciaes),
      formatNames("Cooperador do Ofício", ceia.oficiantes.cooperadores),
      formatNames("Cooperador de Jovens", ceia.oficiantes.cooperadoresJovens),
      formatNames("Diácono", ceia.oficiantes.diaconos),
    ].filter(Boolean);

    if (ofs.length > 0) {
      lines.push(...(ofs as string[]));
      lines.push("");
    }
  }

  for (const cat of CATEGORIA_ORDER) {
    const label = CATEGORIA_LABELS[cat];
    const catData = ceia.categorias[cat];
    if (catData.rodadas.length > 0) {
      lines.push(`- *${label}:* ${catData.total}`);
    }
  }

  lines.push("");
  lines.push(`*Total: ${ceia.totalGeral} participantes.*`);

  return lines.join("\n");
}
