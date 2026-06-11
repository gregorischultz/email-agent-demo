// Este ficheiro desenha o gráfico de barras com os emails agrupados por categoria.
// Precisa de "use client" porque o recharts usa funcionalidades do browser
// (canvas, animações, eventos de rato) que não existem no servidor.
// O servidor não tem ecrã — só o browser é que sabe desenhar gráficos.

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Cor de cada categoria no gráfico — escolhidas para serem distintas e legíveis
const CORES_CATEGORIA: Record<string, string> = {
  VISITE_REQUEST: "#3b82f6", // azul
  PRICE_INQUIRY:  "#8b5cf6", // roxo
  COMPLAINT:      "#ef4444", // vermelho
  INFO_REQUEST:   "#10b981", // verde
  OTHER:          "#6b7280", // cinzento
};

// Texto legível para cada categoria (para mostrar no gráfico em vez do código)
const LABEL_CATEGORIA: Record<string, string> = {
  VISITE_REQUEST: "Visitas",
  PRICE_INQUIRY:  "Preços",
  COMPLAINT:      "Reclamações",
  INFO_REQUEST:   "Informação",
  OTHER:          "Outros",
};

// O que este componente recebe do Server Component pai
interface DadosGrafico {
  categoria: string;
  total: number;
}

interface PropsGrafico {
  dados: DadosGrafico[];
}

// Componente do gráfico de barras — recebe os dados prontos e só trata de os desenhar
export default function EmailsPorCategoria({ dados }: PropsGrafico) {
  // Transformamos os dados para ter etiquetas legíveis em vez dos códigos em maiúsculas
  const dadosFormatados = dados.map((item) => ({
    ...item,
    nome: LABEL_CATEGORIA[item.categoria] ?? item.categoria,
    cor:  CORES_CATEGORIA[item.categoria] ?? "#6b7280",
  }));

  // Se não há dados, mostramos uma mensagem simples em vez de um gráfico vazio
  if (dadosFormatados.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum email classificado ainda.
      </div>
    );
  }

  return (
    // ResponsiveContainer faz o gráfico ocupar 100% da largura do pai — adaptável ao ecrã
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dadosFormatados} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        {/* Linhas de fundo cinzentas que ajudam a ler os valores */}
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        {/* Eixo horizontal — mostra o nome da categoria */}
        <XAxis
          dataKey="nome"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />

        {/* Eixo vertical — mostra o número de emails, só inteiros */}
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />

        {/* Caixa que aparece ao passar o rato por cima de uma barra */}
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
          }}
          formatter={(valor) => [`${valor ?? 0} emails`, "Total"]}
        />

        {/* As barras em si — cada uma tem a cor da sua categoria */}
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {dadosFormatados.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
