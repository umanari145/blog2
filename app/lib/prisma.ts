import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/src/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL が設定されていません（.env を確認してください）。");
  }
  return new PrismaClient({
    adapter: new PrismaMariaDb(url),
  });
}

/** Prisma 7 + MySQL: アダプター付きクライアント（開発時のホットリロード対策で global に保持） */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
