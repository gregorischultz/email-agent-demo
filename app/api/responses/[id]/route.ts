// Este ficheiro trata do pedido de aprovação de uma resposta gerada pela IA.
// Quando o utilizador clica "Aprovar" na modal, o frontend envia um PATCH aqui
// com o rascunho final (possivelmente editado) e nós guardamos na base de dados.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handler PATCH — actualiza uma resposta existente como "aprovada"
// O [id] na pasta corresponde ao id do registo Response na base de dados
export async function PATCH(
  pedido: NextRequest,
  { params }: { params: { id: string } }
) {
  // --- PASSO 1: Converter o id da URL (texto) para número ---
  const responseId = Number(params.id);
  if (isNaN(responseId)) {
    // Isto acontece se alguém chamar a API com um id que não é número (ex: /api/responses/abc)
    return NextResponse.json(
      { erro: "O id da resposta tem de ser um número válido." },
      { status: 400 }
    );
  }

  // --- PASSO 2: Ler o corpo do pedido ---
  let approved: boolean;
  let draft: string | undefined;

  try {
    const corpo = await pedido.json() as { approved?: unknown; draft?: unknown };

    if (typeof corpo.approved !== "boolean") {
      return NextResponse.json(
        { erro: "O campo 'approved' é obrigatório e tem de ser true ou false." },
        { status: 400 }
      );
    }

    approved = corpo.approved;

    // O rascunho editado é opcional — se não vier, mantemos o que estava guardado
    if (typeof corpo.draft === "string" && corpo.draft.trim() !== "") {
      draft = corpo.draft;
    }
  } catch {
    // Acontece se o body não for JSON válido
    return NextResponse.json(
      { erro: "O corpo do pedido não é JSON válido." },
      { status: 400 }
    );
  }

  // --- PASSO 3: Verificar que a resposta existe antes de a actualizar ---
  let respostaExistente;
  try {
    respostaExistente = await prisma.response.findUnique({
      where: { id: responseId },
    });
  } catch {
    return NextResponse.json(
      { erro: "Não foi possível ligar à base de dados." },
      { status: 500 }
    );
  }

  if (!respostaExistente) {
    // Isto pode acontecer se o utilizador tentar aprovar uma resposta que foi entretanto apagada
    return NextResponse.json(
      { erro: `Resposta com id ${responseId} não encontrada.` },
      { status: 404 }
    );
  }

  // --- PASSO 4: Actualizar a resposta na base de dados ---
  try {
    const respostaActualizada = await prisma.response.update({
      where: { id: responseId },
      data: {
        approved,
        // Se foi aprovada, guardamos a data e hora de aprovação em sentAt
        sentAt: approved ? new Date() : null,
        // Se o utilizador editou o rascunho, guardamos a versão editada
        ...(draft !== undefined && { draft }),
      },
    });

    // --- PASSO 5: Devolver a resposta actualizada ao frontend ---
    return NextResponse.json({
      sucesso: true,
      resposta: {
        id: respostaActualizada.id,
        approved: respostaActualizada.approved,
        draft: respostaActualizada.draft,
        sentAt: respostaActualizada.sentAt?.toISOString() ?? null,
      },
    });
  } catch {
    // Pode acontecer se a base de dados estiver em baixo durante a actualização
    return NextResponse.json(
      { erro: "Não foi possível guardar a aprovação. Tente novamente." },
      { status: 500 }
    );
  }
}
