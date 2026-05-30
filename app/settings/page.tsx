// Ficheiro: app/settings/page.tsx
// Finalidade: Página de configurações da aplicação.
// Mostra ao utilizador as variáveis de ambiente necessárias e o estado da ligação.

// Variáveis de ambiente requeridas pela aplicação
const requiredEnvVars = [
  {
    name: "DATABASE_URL",
    description: "URL de conexão MySQL",
    source: "Servidor MySQL local ou PlanetScale/Railway",
  },
  {
    name: "ANTHROPIC_API_KEY",
    description: "Chave de API da Anthropic",
    source: "console.anthropic.com → API Keys",
  },
];

// Página de configurações — mostra checklist de variáveis necessárias
export default function SettingsPage() {
  return (
    <div>
      {/* Cabeçalho da página de configurações */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-500 mt-1">
          Variáveis de ambiente e configuração do agente
        </p>
      </div>

      {/* Lista de variáveis de ambiente necessárias */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Variáveis de Ambiente</h3>
        <div className="space-y-4">
          {requiredEnvVars.map((envVar) => (
            <div
              key={envVar.name}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              {/* Nome da variável */}
              <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded shrink-0">
                {envVar.name}
              </code>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {envVar.description}
                </p>
                {/* Onde obter o valor da variável */}
                <p className="text-xs text-gray-400 mt-1">
                  Onde obter: {envVar.source}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Nota sobre o ficheiro .env.local */}
        <p className="text-xs text-gray-400 mt-4 border-t pt-4">
          Defina estas variáveis no ficheiro{" "}
          <code className="bg-gray-100 px-1 rounded">.env.local</code> na raiz
          do projeto. Nunca as commita no git.
        </p>
      </div>
    </div>
  );
}
