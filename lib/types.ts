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

// Versão do email com datas em texto — necessário para passar dados do Server para Client Components
// (o React não consegue passar objectos Date directamente entre servidor e cliente)
export interface EmailSerializado {
  id: number;
  from: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO string em vez de Date
  category: EmailCategory | null;
  status: EmailStatus;
}

// O que a API /api/process-email devolve quando corre com sucesso
export interface RespostaProcessEmail {
  sucesso: boolean;
  email: {
    id: number;
    category: string;
    status: string;
  };
  resposta: {
    id: number;
    draft: string;
    approved: boolean;
  };
  urgency: Urgency;
}

// Dados que a modal precisa para mostrar o rascunho ao utilizador
export interface DadosModal {
  responseId: number;
  emailId: number;
  draft: string;
  urgency: Urgency;
  category: EmailCategory;
}
