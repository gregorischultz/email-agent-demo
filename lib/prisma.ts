// Ficheiro: lib/prisma.ts
// Finalidade: Cria e exporta uma instância singleton do PrismaClient.
// Reutilizar a mesma instância evita abrir demasiadas conexões em desenvolvimento
// (o Next.js faz hot-reload e recriaria o cliente a cada alteração sem este padrão).

import { PrismaClient } from "@prisma/client";

// Declaração global para manter o cliente entre hot-reloads em dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reutiliza a instância existente em dev, cria uma nova em produção
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Loga queries SQL no terminal em desenvolvimento
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
