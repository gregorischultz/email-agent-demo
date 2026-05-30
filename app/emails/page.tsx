// Ficheiro: app/emails/page.tsx
// Finalidade: Página que lista todos os emails recebidos e permite ao agente
// gerar rascunhos de resposta usando a API da Anthropic (Claude).

// Componente placeholder para a listagem de emails
// A lógica de fetch e o componente de ação serão adicionados nas próximas iterações
export default function EmailsPage() {
  return (
    <div>
      {/* Cabeçalho da página de emails */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Emails</h2>
        <p className="text-gray-500 mt-1">
          Lista de emails recebidos para processamento pelo agente
        </p>
      </div>

      {/* Estado vazio — será substituído pela lista real após configuração do DB */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-lg">Nenhum email recebido ainda.</p>
        <p className="text-gray-400 text-sm mt-2">
          Configure a base de dados e o webhook de email para começar.
        </p>
      </div>
    </div>
  );
}
