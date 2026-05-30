// Ficheiro: app/responses/page.tsx
// Finalidade: Página que lista todos os rascunhos de resposta gerados pelo agente.
// Permite ao utilizador aprovar ou rejeitar cada resposta antes do envio.

// Componente placeholder para a listagem de respostas geradas pelo agente
export default function ResponsesPage() {
  return (
    <div>
      {/* Cabeçalho da página de respostas */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Respostas</h2>
        <p className="text-gray-500 mt-1">
          Rascunhos gerados pelo agente Claude para revisão e aprovação
        </p>
      </div>

      {/* Estado vazio — será preenchido quando o agente gerar rascunhos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-400 text-lg">Nenhum rascunho gerado ainda.</p>
        <p className="text-gray-400 text-sm mt-2">
          O agente gera rascunhos automaticamente ao processar novos emails.
        </p>
      </div>
    </div>
  );
}
