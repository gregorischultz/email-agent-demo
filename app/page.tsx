// Ficheiro: app/page.tsx
// Finalidade: Página principal (dashboard) da aplicação.
// Mostra um resumo do estado dos emails e acesso rápido às funcionalidades.

// Cartões de estatísticas mostrados no dashboard
const stats = [
  { label: "Emails pendentes", value: "—", color: "text-yellow-600" },
  { label: "Respostas geradas", value: "—", color: "text-blue-600" },
  { label: "Aprovadas e enviadas", value: "—", color: "text-green-600" },
];

// Página do dashboard — Server Component por omissão no App Router
export default function DashboardPage() {
  return (
    <div>
      {/* Cabeçalho da página */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Visão geral do agente de email inteligente
        </p>
      </div>

      {/* Grelha de cartões com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-4xl font-bold mt-2 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Instruções iniciais para configurar o projeto */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-2">Como começar</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
          <li>Configure o ficheiro <code className="bg-gray-100 px-1 rounded">.env.local</code> com as suas credenciais</li>
          <li>Execute <code className="bg-gray-100 px-1 rounded">npx prisma migrate dev</code> para criar as tabelas</li>
          <li>Aceda a <strong>Emails</strong> para ver e processar emails recebidos</li>
          <li>O agente Claude gera rascunhos de resposta automaticamente</li>
        </ol>
      </div>
    </div>
  );
}
