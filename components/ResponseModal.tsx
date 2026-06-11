// Este ficheiro desenha a janela (modal) que aparece depois de a IA gerar uma resposta.
// O utilizador pode ler e editar o rascunho, e depois aprovar ou pedir uma nova versão.

"use client";

import { useState } from "react";
import type { DadosModal, Urgency } from "@/lib/types";

// Mapeamento de urgência para cor e texto legível
const CORES_URGENCIA: Record<Urgency, { fundo: string; texto: string; label: string }> = {
  HIGH:   { fundo: "bg-red-100",    texto: "text-red-700",    label: "Urgente" },
  MEDIUM: { fundo: "bg-yellow-100", texto: "text-yellow-700", label: "Médio" },
  LOW:    { fundo: "bg-green-100",  texto: "text-green-700",  label: "Baixo" },
};

// Mapeamento de categoria para texto legível em francês (como aparece na modal)
const LABEL_CATEGORIA: Record<string, string> = {
  VISITE_REQUEST: "Demande de visite",
  PRICE_INQUIRY:  "Question de prix",
  COMPLAINT:      "Réclamation",
  INFO_REQUEST:   "Demande d'information",
  OTHER:          "Autre",
};

interface PropsModal {
  dados: DadosModal;
  onFechar: () => void;
  // Chamado quando o utilizador quer uma resposta diferente — passa o emailId de volta
  onRegenerar: () => void;
  // Verdadeiro enquanto a IA está a gerar uma nova resposta (para mostrar loading)
  regenerando: boolean;
}

// Componente da modal — aparece por cima de tudo o resto quando o utilizador clica "Gerar resposta"
export default function ResponseModal({ dados, onFechar, onRegenerar, regenerando }: PropsModal) {
  // Guardamos o texto do rascunho aqui para que o utilizador possa editar antes de aprovar
  const [rascunho, setRascunho] = useState(dados.draft);
  // Controla se o botão "Aprovar" está a processar (a fazer o pedido à API)
  const [aprovando, setAprovando] = useState(false);
  // Mensagem de sucesso ou erro após tentar aprovar
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const urgencia = CORES_URGENCIA[dados.urgency];

  // Quando o utilizador clica "Aprovar":
  // 1. Marcamos o botão como ocupado para evitar cliques duplos
  // 2. Enviamos o rascunho (possivelmente editado) à API para guardar
  // 3. Mostramos confirmação ou erro
  async function handleAprovar() {
    setAprovando(true);
    setMensagem(null);

    try {
      const resposta = await fetch(`/api/responses/${dados.responseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Enviamos o rascunho actual — pode ter sido editado pelo utilizador
        body: JSON.stringify({ approved: true, draft: rascunho }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json() as { erro?: string };
        throw new Error(erro.erro ?? "Erro desconhecido ao aprovar.");
      }

      // Aprovado com sucesso — mostramos a mensagem e fechamos a modal após 1.5s
      setMensagem({ tipo: "ok", texto: "Resposta aprovada e guardada com sucesso!" });
      setTimeout(onFechar, 1500);
    } catch (erro) {
      setMensagem({
        tipo: "erro",
        texto: erro instanceof Error ? erro.message : "Não foi possível aprovar. Tente novamente.",
      });
    } finally {
      setAprovando(false);
    }
  }

  // Quando o utilizador clica fora da modal (no fundo escuro), fechamos
  function handleClickFundo(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onFechar();
  }

  return (
    // Fundo escuro semi-transparente que cobre o ecrã inteiro
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClickFundo}
    >
      {/* Caixa branca da modal — max-w-2xl para não ficar demasiado larga */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">

        {/* Cabeçalho da modal com categoria, urgência e botão de fechar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Resposta gerada pela IA</h2>
            {/* Badge de categoria */}
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {LABEL_CATEGORIA[dados.category] ?? dados.category}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Badge de urgência com cor a condizer */}
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${urgencia.fundo} ${urgencia.texto}`}>
              {urgencia.label}
            </span>
            {/* Botão X para fechar */}
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Fechar modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Corpo da modal — zona de edição do rascunho */}
        <div className="flex-1 overflow-y-auto p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rascunho da resposta{" "}
            <span className="text-gray-400 font-normal">(pode editar antes de aprovar)</span>
          </label>

          {/* Se estiver a regenerar, mostramos um spinner em vez da textarea */}
          {regenerando ? (
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                {/* Círculo a girar a indicar que a IA está a trabalhar */}
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">A IA está a gerar uma nova resposta…</span>
              </div>
            </div>
          ) : (
            <textarea
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              rows={10}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Mensagem de sucesso (verde) ou erro (vermelho) após tentar aprovar */}
          {mensagem && (
            <p className={`mt-3 text-sm font-medium ${mensagem.tipo === "ok" ? "text-green-600" : "text-red-600"}`}>
              {mensagem.tipo === "ok" ? "✓" : "✗"} {mensagem.texto}
            </p>
          )}
        </div>

        {/* Rodapé com os botões de acção */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          {/* Botão "Regenerar" — pede uma nova resposta à IA sem fechar a modal */}
          <button
            onClick={onRegenerar}
            disabled={regenerando || aprovando}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {regenerando ? "A regenerar…" : "↺ Regenerar"}
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onFechar}
              disabled={aprovando}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>

            {/* Botão "Aprovar" — envia o rascunho (editado ou original) para a API */}
            <button
              onClick={handleAprovar}
              disabled={aprovando || regenerando || rascunho.trim() === ""}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {aprovando ? "A aprovar…" : "✓ Aprovar resposta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
