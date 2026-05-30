// Ficheiro: lib/types.ts
// Finalidade: Define os tipos TypeScript partilhados pela aplicação.
// Centralizar tipos aqui garante consistência entre componentes e API routes.

// Categorias possíveis que o agente pode atribuir a um email
export type EmailCategory = "suporte" | "vendas" | "spam" | "outro";

// Estados possíveis do ciclo de vida de um email
export type EmailStatus = "pendente" | "respondido" | "ignorado";

// Representação de um email com as suas respostas associadas
export interface EmailWithResponses {
  id: number;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  category: EmailCategory | null;
  status: EmailStatus;
  responses: ResponseItem[];
}

// Representação de uma resposta gerada pelo agente
export interface ResponseItem {
  id: number;
  emailId: number;
  draft: string;
  approved: boolean;
  sentAt: Date | null;
}
