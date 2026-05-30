// Ficheiro: app/layout.tsx
// Finalidade: Layout raiz da aplicação Next.js App Router.
// Define a estrutura HTML base com a sidebar e a área de conteúdo principal.
// Este layout envolve todas as páginas da aplicação.

import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

// Metadados da aplicação — aparecem no <head> HTML (título do separador, SEO)
export const metadata: Metadata = {
  title: "Email Agent Demo",
  description: "Agente de email inteligente com Claude AI e Next.js 14",
};

// Layout principal — renderizado uma vez e partilhado por todas as rotas
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="antialiased bg-gray-50 text-gray-900">
        {/* Estrutura flex horizontal: sidebar à esquerda, conteúdo à direita */}
        <div className="flex min-h-screen">
          {/* Sidebar de navegação lateral */}
          <Sidebar />

          {/* Área de conteúdo principal — ocupa o espaço restante */}
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
