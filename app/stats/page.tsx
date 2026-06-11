// Esta página mostra o ROI (retorno sobre investimento) do agente de IA aos clientes.
// É o argumento de vendas em dados: quanto tempo se poupa, quantos emails foram processados,
// e quais os tipos de pedido mais frequentes. Corre no servidor e vai directamente à BD.

import { prisma } from "@/lib/prisma";
import EmailsPorCategoria from "@/components/EmailsPorCategoria";

// Tempo que um humano leva em média a responder a um email manualmente (em minutos)
// Valor configurável — ajusta conforme a realidade da agência
const MINUTOS_RESPOSTA_MANUAL = 25;

// Tempo que o agente de IA leva a processar e gerar uma resposta (em segundos)
const SEGUNDOS_RESPOSTA_IA = 30;

// Economia por email: diferença entre o tempo manual e o tempo da IA (em minutos)
// Usamos 8 minutos porque a IA gera o rascunho em 30s, mas o humano ainda revisa ~7 min
const MINUTOS_POUPADOS_POR_EMAIL = 8;

// Texto legível para cada categoria
const LABEL_CATEGORIA: Record<string, string> = {
  VISITE_REQUEST: "Pedidos de visita",
  PRICE_INQUIRY:  "Perguntas de preço",
  COMPLAINT:      "Reclamações",
  INFO_REQUEST:   "Pedidos de informação",
  OTHER:          "Outros",
};

// Cor do badge de cada categoria
const COR_CATEGORIA: Record<string, string> = {
  VISITE_REQUEST: "bg-blue-100 text-blue-700",
  PRICE_INQUIRY:  "bg-purple-100 text-purple-700",
  COMPLAINT:      "bg-red-100 text-red-700",
  INFO_REQUEST:   "bg-green-100 text-green-700",
  OTHER:          "bg-gray-100 text-gray-600",
};

// Página de estatísticas — Server Component que calcula tudo no servidor
export default async function StatsPage() {

  // Buscamos todos os emails de uma vez — precisamos deles para vários cálculos
  const todosEmails = await prisma.email.findMany({
    select: { category: true, status: true },
  });

  // Total de emails que já foram processados pela IA (têm categoria definida)
  const emailsRespondidos = todosEmails.filter((e) => e.status === "respondido").length;

  // --- CÁLCULO: HORAS POUPADAS ---
  // Fórmula: (nº de emails respondidos) × (minutos poupados por email) ÷ 60
  // Por exemplo: 10 emails × 8 minutos = 80 minutos = 1.3 horas poupadas
  const horasPoupadas = (emailsRespondidos * MINUTOS_POUPADOS_POR_EMAIL) / 60;

  // --- CÁLCULO: EMAILS POR CATEGORIA ---
  // Contamos quantos emails há de cada tipo para o gráfico de barras
  const contagemPorCategoria: Record<string, number> = {};
  for (const email of todosEmails) {
    if (email.category) {
      // Se já existe uma contagem para esta categoria, somamos 1; se não, começamos em 1
      contagemPorCategoria[email.category] = (contagemPorCategoria[email.category] ?? 0) + 1;
    }
  }

  // Transformamos o objecto num array para o gráfico e ordenamos do maior para o menor
  const dadosGrafico = Object.entries(contagemPorCategoria)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  // --- CÁLCULO: TOP 3 CATEGORIAS ---
  // Os três tipos de email mais frequentes — útil para planear respostas modelo
  const totalClassificados = dadosGrafico.reduce((soma, item) => soma + item.total, 0);
  const top3 = dadosGrafico.slice(0, 3).map((item) => ({
    ...item,
    // Percentagem: (contagem desta categoria ÷ total) × 100, arredondado a 1 casa decimal
    percentagem: totalClassificados > 0
      ? Math.round((item.total / totalClassificados) * 1000) / 10
      : 0,
  }));

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── CABEÇALHO ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas — ROI do Agente IA</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Impacto real do assistente na produtividade da Agence Dupont
        </p>
      </div>

      {/* ── CARDS DE TEMPO: ANTES vs DEPOIS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

        {/* Card: tempo de resposta antes da IA */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
            Antes da IA
          </p>
          <p className="text-3xl font-bold text-red-500">{MINUTOS_RESPOSTA_MANUAL} min</p>
          <p className="text-sm text-gray-500 mt-1">por email (resposta manual)</p>
        </div>

        {/* Card: tempo de resposta com a IA */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 ring-1 ring-blue-100">
          <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-1">
            Com a IA
          </p>
          <p className="text-3xl font-bold text-blue-600">{SEGUNDOS_RESPOSTA_IA}s</p>
          <p className="text-sm text-gray-500 mt-1">por email (rascunho gerado)</p>
        </div>

        {/* Card: horas poupadas — o número mais importante para o cliente */}
        <div className="bg-blue-600 rounded-xl shadow-sm p-5">
          <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mb-1">
            Horas poupadas
          </p>
          {/* toFixed(1) garante sempre 1 casa decimal, ex: "1.3" */}
          <p className="text-3xl font-bold text-white">{horasPoupadas.toFixed(1)}h</p>
          <p className="text-sm text-blue-200 mt-1">
            {emailsRespondidos} emails × {MINUTOS_POUPADOS_POR_EMAIL} min
          </p>
        </div>
      </div>

      {/* ── GRÁFICO + TOP 3 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Gráfico de barras — ocupa 2/3 do espaço */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Emails por categoria</h2>
          <p className="text-xs text-gray-400 mb-4">
            Distribuição dos emails classificados pela IA
          </p>

          {/* EmailsPorCategoria é Client Component — está num ficheiro separado por causa do "use client" */}
          <EmailsPorCategoria dados={dadosGrafico} />
        </div>

        {/* Top 3 categorias — ocupa 1/3 do espaço */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">Top 3 tipos</h2>
          <p className="text-xs text-gray-400 mb-4">Pedidos mais frequentes</p>

          {top3.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Ainda sem dados. Processa alguns emails no dashboard.
            </p>
          ) : (
            <ol className="space-y-3">
              {top3.map((item, index) => (
                <li key={item.categoria} className="flex items-center gap-3">
                  {/* Número de posição no ranking */}
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Badge com a cor da categoria */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${COR_CATEGORIA[item.categoria] ?? "bg-gray-100 text-gray-600"}`}>
                      {LABEL_CATEGORIA[item.categoria] ?? item.categoria}
                    </span>

                    {/* Barra de progresso visual que representa a percentagem */}
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.percentagem}%` }}
                      />
                    </div>
                  </div>

                  {/* Contagem e percentagem à direita */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">{item.total}</p>
                    <p className="text-xs text-gray-400">{item.percentagem}%</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* ── NOTA EXPLICATIVA DO CÁLCULO ── */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700">
        <strong>Como calculamos as horas poupadas:</strong>{" "}
        cada email respondido pela IA poupa {MINUTOS_POUPADOS_POR_EMAIL} minutos em relação
        à resposta manual ({MINUTOS_RESPOSTA_MANUAL} min), considerando que o agente humano
        ainda revisa e aprova o rascunho em ~{MINUTOS_RESPOSTA_MANUAL - MINUTOS_POUPADOS_POR_EMAIL} min.
        Fórmula: <code className="bg-blue-100 px-1 rounded">emails × {MINUTOS_POUPADOS_POR_EMAIL} min ÷ 60</code>
      </div>
    </div>
  );
}
