// Ficheiro: components/Sidebar.tsx
// Finalidade: Componente de navegação lateral (sidebar) da aplicação.
// Mostra os links principais e o estado do agente.

import Link from "next/link";

// Lista de itens de navegação da sidebar
const navItems = [
  { href: "/",        label: "Dashboard" },
  { href: "/emails",  label: "Emails" },
  { href: "/stats",   label: "Estatísticas" },
  { href: "/settings", label: "Configurações" },
];

// Componente sidebar — renderizado no layout principal para aparecer em todas as páginas
export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Cabeçalho da sidebar com o nome da aplicação */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Email Agent</h1>
        <p className="text-xs text-gray-400 mt-1">Powered by Groq AI</p>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Rodapé da sidebar com indicador de estado */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {/* Indicador visual de que o agente está ativo */}
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Agente ativo
        </div>
      </div>
    </aside>
  );
}
