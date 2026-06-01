// Este ficheiro é a porta de entrada da IA na aplicação.
// Quando o frontend envia um emailId, este ficheiro vai à base de dados buscar o email,
// envia-o à Claude para análise, e guarda a categoria e o rascunho de resposta.

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import type { ClaudeEmailAnalysis } from "@/lib/types";

// Criamos o cliente da Anthropic uma única vez fora da função
// para não o recriar a cada pedido que chega
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Instrução exacta que damos à Claude antes de lhe mostrar o email.
// Definida aqui fora para ser fácil de alterar sem tocar na lógica.
const SYSTEM_PROMPT = `Tu es un assistant pour une agence immobilière française.
Analyse cet email et:
1. Classe en: VISITE_REQUEST, PRICE_INQUIRY, COMPLAINT, INFO_REQUEST, OTHER
2. Génère une réponse professionnelle en français (max 150 mots)
3. Réponds UNIQUEMENT en JSON: {"category": "...", "response": "...", "urgency": "LOW|MEDIUM|HIGH"}`;

// Categorias válidas que a Claude pode devolver — usamos isto para validar a resposta
const CATEGORIAS_VALIDAS = [
  "VISITE_REQUEST",
  "PRICE_INQUIRY",
  "COMPLAINT",
  "INFO_REQUEST",
  "OTHER",
] as const;

// Níveis de urgência válidos
const URGENCIAS_VALIDAS = ["LOW", "MEDIUM", "HIGH"] as const;

// Função que verifica se a resposta da Claude tem o formato correcto
// A Claude às vezes devolve texto extra antes ou depois do JSON — esta função protege-nos disso
function validarRespostaClaude(texto: string): ClaudeEmailAnalysis {
  // Tentamos encontrar um bloco JSON dentro do texto, mesmo que haja palavras à volta
  const correspondencia = texto.match(/\{[\s\S]*\}/);
  if (!correspondencia) {
    // Isto pode acontecer se a Claude ignorar as instruções e responder em texto livre
    throw new Error(
      "A Claude não devolveu JSON válido. Texto recebido: " + texto.slice(0, 200)
    );
  }

  // Convertemos o texto JSON num objecto JavaScript
  let dados: unknown;
  try {
    dados = JSON.parse(correspondencia[0]);
  } catch {
    // Isto pode acontecer se o JSON estiver mal formado (ex: vírgula a mais)
    throw new Error("O JSON devolvido pela Claude está mal formado.");
  }

  // Verificamos que o objecto tem exactamente os campos que esperamos
  if (
    typeof dados !== "object" ||
    dados === null ||
    !("category" in dados) ||
    !("response" in dados) ||
    !("urgency" in dados)
  ) {
    throw new Error(
      "O JSON da Claude não tem todos os campos obrigatórios (category, response, urgency)."
    );
  }

  const obj = dados as Record<string, unknown>;

  // Verificamos que a categoria é uma das opções válidas que definimos no system prompt
  if (!CATEGORIAS_VALIDAS.includes(obj.category as never)) {
    throw new Error(
      `Categoria inválida devolvida pela Claude: "${obj.category}". Esperava uma de: ${CATEGORIAS_VALIDAS.join(", ")}`
    );
  }

  // Verificamos que a urgência é uma das três opções válidas
  if (!URGENCIAS_VALIDAS.includes(obj.urgency as never)) {
    throw new Error(
      `Urgência inválida devolvida pela Claude: "${obj.urgency}". Esperava LOW, MEDIUM ou HIGH.`
    );
  }

  // Verificamos que a resposta é texto e não está vazia
  if (typeof obj.response !== "string" || obj.response.trim() === "") {
    throw new Error("A Claude devolveu uma resposta vazia.");
  }

  // Tudo certo — devolvemos o objecto já com os tipos correctos
  return {
    category: obj.category as ClaudeEmailAnalysis["category"],
    response: obj.response,
    urgency: obj.urgency as ClaudeEmailAnalysis["urgency"],
  };
}

// Handler principal do endpoint POST /api/process-email
// É chamado sempre que o frontend envia um emailId para processar
export async function POST(pedido: NextRequest) {
  // --- PASSO 1: Ler e validar o que o frontend enviou ---
  let emailId: number;
  try {
    const corpo = await pedido.json() as { emailId?: unknown };

    // Verificamos que o emailId foi enviado e é um número válido
    if (!corpo.emailId || isNaN(Number(corpo.emailId))) {
      return NextResponse.json(
        { erro: "O campo emailId é obrigatório e tem de ser um número." },
        { status: 400 }
      );
    }

    emailId = Number(corpo.emailId);
  } catch {
    // Isto acontece se o frontend enviou um body que não é JSON de todo
    return NextResponse.json(
      { erro: "O corpo do pedido não é JSON válido." },
      { status: 400 }
    );
  }

  // --- PASSO 2: Ir à base de dados buscar o email ---
  let email;
  try {
    email = await prisma.email.findUnique({
      where: { id: emailId },
    });
  } catch {
    // Isto pode acontecer se a base de dados estiver em baixo ou mal configurada
    return NextResponse.json(
      { erro: "Não foi possível ligar à base de dados. Verifique a DATABASE_URL." },
      { status: 500 }
    );
  }

  // Se o email não existir na base de dados, avisamos o frontend
  if (!email) {
    return NextResponse.json(
      { erro: `Email com id ${emailId} não encontrado na base de dados.` },
      { status: 404 }
    );
  }

  // --- PASSO 3: Enviar o email à Claude para análise ---
  // Construímos a mensagem que vamos enviar — incluímos o assunto e o corpo do email
  const mensagemParaClaude = `De: ${email.from}
Objet: ${email.subject}

${email.body}`;

  let analise: ClaudeEmailAnalysis;
  try {
    const resposta = await anthropic.messages.create({
      model: "claude-sonnet-4-5",    // Modelo escolhido por custo-eficiência
      max_tokens: 512,               // 150 palavras de resposta + JSON cabe bem em 512 tokens
      system: SYSTEM_PROMPT,         // As instruções que definem como a Claude deve agir
      messages: [
        {
          role: "user",
          content: mensagemParaClaude,
        },
      ],
    });

    // A Claude pode devolver vários blocos de conteúdo — pegamos apenas no texto
    const blocoTexto = resposta.content.find((bloco) => bloco.type === "text");
    if (!blocoTexto || blocoTexto.type !== "text") {
      throw new Error("A Claude não devolveu nenhum bloco de texto.");
    }

    // Validamos e convertemos a resposta para o formato que esperamos
    analise = validarRespostaClaude(blocoTexto.text);
  } catch (erro) {
    // Isto pode acontecer se: a ANTHROPIC_API_KEY está errada, sem créditos,
    // a rede falhou, ou a Claude devolveu uma resposta inesperada
    const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
    return NextResponse.json(
      { erro: "Falha na chamada à Claude API: " + mensagem },
      { status: 500 }
    );
  }

  // --- PASSO 4: Guardar os resultados na base de dados ---
  // Fazemos as duas escritas ao mesmo tempo com uma transacção — assim ou correm as duas ou nenhuma
  try {
    const [emailAtualizado, resposta] = await prisma.$transaction([
      // Actualizar a categoria do email com o que a Claude decidiu
      prisma.email.update({
        where: { id: emailId },
        data: {
          category: analise.category,
          status: "respondido",
        },
      }),

      // Criar um novo registo de resposta com o rascunho gerado pela Claude
      prisma.response.create({
        data: {
          emailId: emailId,
          draft: analise.response,
          approved: false,   // O utilizador ainda não aprovou — começa sempre como false
          sentAt: null,      // Ainda não foi enviado
        },
      }),
    ]);

    // --- PASSO 5: Devolver o resultado ao frontend ---
    // Enviamos tudo o que o frontend precisa para mostrar ao utilizador
    return NextResponse.json({
      sucesso: true,
      email: {
        id: emailAtualizado.id,
        from: emailAtualizado.from,
        subject: emailAtualizado.subject,
        category: emailAtualizado.category,
        status: emailAtualizado.status,
      },
      resposta: {
        id: resposta.id,
        draft: resposta.draft,
        approved: resposta.approved,
      },
      urgency: analise.urgency,
    });
  } catch {
    // Isto pode acontecer se a base de dados ficou sem espaço ou houve um conflito de dados
    return NextResponse.json(
      { erro: "Falha ao guardar os resultados na base de dados." },
      { status: 500 }
    );
  }
}
