import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const ensureTaskTrashTtlIndex = async (): Promise<void> => {
  await prisma.$runCommandRaw({
    createIndexes: 'tasks',
    indexes: [{ key: { deletedAt: 1 }, name: 'tasks_deletedAt_ttl', expireAfterSeconds: 1209600 }],
  });
};
