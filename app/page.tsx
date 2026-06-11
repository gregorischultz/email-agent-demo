// Este ficheiro é o dashboard principal da aplicação.
// Corre no servidor (Server Component) — vai directamente à base de dados buscar os emails
// e as métricas, sem precisar de uma API intermédia. O React renderiza o HTML no servidor
// e envia-o pronto para o browser.

import { prisma } from "@/lib/prisma";
import EmailCardClient from "@/components/EmailCardClient";
import type { EmailSerializado } from "@/lib/types";

// Função auxiliar: devolve a data de hoje às 00:00:00 (meia-noite)
// Usada para filtrar emails respondidos hoje
function inicioDeHoje(): Date {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

// Página do dashboard — é um Server Component, por isso pode usar async/await directamente
export default async function DashboardPage() {

  // Buscamos as três métricas ao mesmo tempo para não esperar uma de cada vez
  const [totalEmails, emailsPendentes, respondidosHoje] = await Promise.all([
    // Contagem total de emails na base de dados
    prisma.email.count(),

    // Apenas os que ainda não foram processados pela IA
    prisma.email.count({
      where: { status: "pendente" },
    }),

    // Respostas aprovadas hoje — usamos a tabela Response porque é lá que fica o registo de aprovação
    // sentAt fica preenchido quando o utilizador aprova (via PATCH /api/responses/[id])
    prisma.response.count({
      where: {
        approved: true,
        sentAt: { gte: inicioDeHoje() },
      },
    }),
  ]);

  // Buscamos todos os emails ordenados do mais recente para o mais antigo
  // Incluímos as respostas para saber se já existe um rascunho gerado
  const emails = await prisma.email.findMany({
    orderBy: { receivedAt: "desc" },
    include: {
      responses: {
        orderBy: { id: "desc" },
        take: 1, // Só precisamos da resposta mais recente
      },
    },
  });

  // Convertemos as datas para strings antes de passar aos Client Components
  // O React não consegue serializar objectos Date entre servidor e cliente
  const emailsSerializados: EmailSerializado[] = emails.map((email) => ({
    id: email.id,
    from: email.from,
    subject: email.subject,
    body: email.body,
    receivedAt: email.receivedAt.toISOString(),
    category: email.category as EmailSerializado["category"],
    status: email.status as EmailSerializado["status"],
  }));

  // Dados dos três cartões de métricas
  const metricas = [
    {
      label: "Total de emails",
      valor: totalEmails,
      cor: "text-gray-900",
      corFundo: "bg-white",
      icone: "✉",
    },
    {
      label: "Pendentes",
      valor: emailsPendentes,
      cor: "text-yellow-600",
      corFundo: "bg-yellow-50",
      icone: "⏳",
    },
    {
      label: "Aprovados hoje",
      valor: respondidosHoje,
      cor: "text-green-600",
      corFundo: "bg-green-50",
      icone: "✓",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── CABEÇALHO ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Assistant Email IA — Agence Dupont
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tours · Gestion intelligente des emails clients
        </p>
      </div>

      {/* ── CARTÕES DE MÉTRICAS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {metricas.map((m) => (
          <div
            key={m.label}
            className={`rounded-xl border border-gray-200 shadow-sm p-5 ${m.corFundo}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{m.label}</p>
              <span className="text-lg">{m.icone}</span>
            </div>
            {/* Número grande e colorido — chama a atenção para o valor */}
            <p className={`text-4xl font-bold ${m.cor}`}>{m.valor}</p>
          </div>
        ))}
      </div>

      {/* ── LISTA DE EMAILS ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700">
            Emails recebidos
          </h2>
          {/* Contador de emails pendentes como lembrete rápido */}
          {emailsPendentes > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
              {emailsPendentes} por processar
            </span>
          )}
        </div>

        {/* Se não houver emails, mostramos um estado vazio simpático */}
        {emailsSerializados.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400">Nenhum email recebido ainda.</p>
            <p className="text-gray-400 text-sm mt-1">
              Corre <code className="bg-gray-100 px-1 rounded">npm run seed</code> para popular a base de dados.
            </p>
          </div>
        ) : (
          // Grelha responsiva: 1 coluna em mobile, 2 em ecrãs médios
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emailsSerializados.map((email) => (
              // EmailCardClient é um Client Component — trata dos cliques e da modal
              <EmailCardClient key={email.id} email={email} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
