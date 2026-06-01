// Ficheiro: lib/types.ts
// Tipos partilhados por toda a aplicação — a route da API e os componentes usam estes mesmos tipos.

// Categorias que a Claude pode atribuir a um email (têm de coincidir com o que está no system prompt)
export type EmailCategory =
  | "VISITE_REQUEST"
  | "PRICE_INQUIRY"
  | "COMPLAINT"
  | "INFO_REQUEST"
  | "OTHER";

// Nível de urgência que a Claude atribui ao email
export type Urgency = "LOW" | "MEDIUM" | "HIGH";

// Estados possíveis do ciclo de vida de um email
export type EmailStatus = "pendente" | "respondido" | "ignorado";

// Formato exacto do JSON que a Claude devolve — se não tiver estes três campos, algo correu mal
export interface ClaudeEmailAnalysis {
  category: EmailCategory;
  response: string;
  urgency: Urgency;
}

// Um email completo com a lista de respostas geradas pelo agente
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

// Uma resposta gerada pelo agente para um email específico
export interface ResponseItem {
  id: number;
  emailId: number;
  draft: string;
  approved: boolean;
  sentAt: Date | null;
}
