// Este ficheiro trata de tudo o que é interactivo num cartão de email:
// o botão "Gerar resposta", o estado de loading enquanto a IA trabalha,
// e abrir/fechar a modal com o rascunho.

"use client";

import { useState } from "react";
import ResponseModal from "./ResponseModal";
import type { EmailSerializado, DadosModal, RespostaProcessEmail } from "@/lib/types";

// Cores e etiquetas dos badges de categoria
const BADGE_CATEGORIA: Record<string, { fundo: string; texto: string; label: string }> = {
  VISITE_REQUEST: { fundo: "bg-blue-100",   texto: "text-blue-700",   label: "Visita" },
  PRICE_INQUIRY:  { fundo: "bg-purple-100", texto: "text-purple-700", label: "Preço" },
  COMPLAINT:      { fundo: "bg-red-100",    texto: "text-red-700",    label: "Reclamação" },
  INFO_REQUEST:   { fundo: "bg-green-100",  texto: "text-green-700",  label: "Informação" },
  OTHER:          { fundo: "bg-gray-100",   texto: "text-gray-600",   label: "Outro" },
};

// Badge cinzento para quando a IA ainda não classificou o email
const BADGE_SEM_CATEGORIA = { fundo: "bg-gray-100", texto: "text-gray-500", label: "Não classificado" };

interface PropsCard {
  email: EmailSerializado;
}

// Componente de cartão interactivo — um por cada email na lista
export default function EmailCardClient({ email }: PropsCard) {
  // Verdadeiro enquanto estamos à espera da resposta da IA (primeira geração)
  const [loading, setLoading] = useState(false);
  // Quando temos dados da modal preenchidos, mostramos a modal; null = modal fechada
  const [dadosModal, setDadosModal] = useState<DadosModal | null>(null);
  // Verdadeiro enquanto a IA está a regenerar uma resposta dentro da modal
  const [regenerando, setRegenerando] = useState(false);
  // Mensagem de erro a mostrar no cartão (fora da modal)
  const [erro, setErro] = useState<string | null>(null);

  // Formatar a data recebida de forma legível (ex: "3 juin 2025")
  const dataFormatada = new Date(email.receivedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Preview do corpo — mostramos apenas os primeiros 100 caracteres para não ocupar muito espaço
  const bodyPreview = email.body.length > 100
    ? email.body.slice(0, 100).trimEnd() + "…"
    : email.body;

  const badgeCategoria = email.category
    ? (BADGE_CATEGORIA[email.category] ?? BADGE_SEM_CATEGORIA)
    : BADGE_SEM_CATEGORIA;

  // Função chamada ao clicar "Gerar resposta" ou "Regenerar"
  // emailId: qual email processar | dentroModal: se verdadeiro, atualiza o rascunho sem fechar a modal
  async function chamarAPI(emailId: number, dentroModal = false) {
    // Passo 1 — Activar o estado de loading no sítio certo
    if (dentroModal) {
      setRegenerando(true);
    } else {
      setLoading(true);
      setErro(null);
    }

    try {
      // Passo 2 — Fazer o pedido POST à nossa rota de API
      const resposta = await fetch("/api/process-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId }),
      });

      // Passo 3 — Verificar se a API respondeu com sucesso
      if (!resposta.ok) {
        const dadosErro = await resposta.json() as { erro?: string };
        throw new Error(dadosErro.erro ?? `Erro ${resposta.status} ao chamar a API.`);
      }

      const dados = await resposta.json() as RespostaProcessEmail;

      // Passo 4 — Preencher os dados da modal com o rascunho recebido e abri-la
      setDadosModal({
        responseId: dados.resposta.id,
        emailId: emailId,
        draft: dados.resposta.draft,
        urgency: dados.urgency,
        // A categoria pode ter vindo da API agora, ou já existia
        category: (dados.email.category as DadosModal["category"]) ?? email.category ?? "OTHER",
      });
    } catch (e) {
      // Passo 5 (erro) — Mostrar mensagem de erro abaixo do botão
      const msg = e instanceof Error ? e.message : "Erro desconhecido. Tente novamente.";
      if (dentroModal) {
        // Se o erro foi durante regeneração, mantemos a modal aberta mas não temos dados novos
        console.error("Erro ao regenerar:", msg);
      } else {
        setErro(msg);
      }
    } finally {
      // Passo 6 — Desactivar sempre o loading, independentemente do resultado
      if (dentroModal) {
        setRegenerando(false);
      } else {
        setLoading(false);
      }
    }
  }

  return (
    <>
      {/* Cartão do email — borda esquerda colorida por estado */}
      <div className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 transition-all
        ${email.status === "respondido" ? "border-l-4 border-l-green-400" : "border-l-4 border-l-yellow-400"}
      `}>

        {/* Linha de topo: badges + data */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Badge de categoria — cinzento enquanto não classificado */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeCategoria.fundo} ${badgeCategoria.texto}`}>
              {badgeCategoria.label}
            </span>

            {/* Badge de estado do email */}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full
              ${email.status === "respondido" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
            `}>
              {email.status === "respondido" ? "Respondido" : "Pendente"}
            </span>
          </div>

          {/* Data de receção formatada */}
          <span className="text-xs text-gray-400">{dataFormatada}</span>
        </div>

        {/* Remetente e assunto */}
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{email.from}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{email.subject}</h3>
        </div>

        {/* Preview do corpo do email — texto truncado */}
        <p className="text-sm text-gray-500 leading-relaxed">{bodyPreview}</p>

        {/* Mensagem de erro (aparece só se houve problema ao chamar a API) */}
        {erro && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
            ✗ {erro}
          </p>
        )}

        {/* Botão "Gerar resposta" — só aparece em emails pendentes */}
        {email.status === "pendente" && (
          <div className="pt-1">
            <button
              onClick={() => chamarAPI(email.id)}
              disabled={loading}
              className="w-full py-2 px-4 text-sm font-semibold text-white bg-blue-600 rounded-lg
                hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  {/* Spinner enquanto a IA trabalha */}
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A IA está a analisar…
                </>
              ) : (
                "✦ Gerar resposta"
              )}
            </button>
          </div>
        )}

        {/* Se o email já foi respondido, mostramos uma nota discreta */}
        {email.status === "respondido" && (
          <p className="text-xs text-green-600 text-center pt-1">
            ✓ Resposta já gerada
          </p>
        )}
      </div>

      {/* Modal — só é renderizada quando dadosModal tem conteúdo */}
      {dadosModal && (
        <ResponseModal
          dados={dadosModal}
          onFechar={() => setDadosModal(null)}
          onRegenerar={() => chamarAPI(email.id, true)}
          regenerando={regenerando}
        />
      )}
    </>
  );
}
