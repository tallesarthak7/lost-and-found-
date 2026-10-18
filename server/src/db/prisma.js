const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

let prismaInstance = null;
let poolInstance = null;

function getPrisma() {
  if (prismaInstance) return prismaInstance;

  const rawUrl = (process.env.DATABASE_URL || "").trim();
  if (!rawUrl || rawUrl.includes("YOUR-PASSWORD") || rawUrl.includes("[password]")) {
    return null;
  }

  try {
    const isSupabase = rawUrl.includes("supabase.co") || rawUrl.includes("pooler.supabase.com");

    poolInstance = new Pool({
      connectionString: rawUrl,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    const adapter = new PrismaPg(poolInstance);
    const rawPrisma = new PrismaClient({ adapter });

    // Client extension to automatically compute `_id` matching `id`
    // Ensures 100% backward compatibility with React client components expecting `_id`
    prismaInstance = rawPrisma.$extends({
      result: {
        user: {
          _id: {
            needs: { id: true },
            compute(user) {
              return user.id;
            },
          },
        },
        item: {
          _id: {
            needs: { id: true },
            compute(item) {
              return item.id;
            },
          },
        },
        match: {
          _id: {
            needs: { id: true },
            compute(match) {
              return match.id;
            },
          },
        },
        claim: {
          _id: {
            needs: { id: true },
            compute(claim) {
              return claim.id;
            },
          },
        },
      },
    });

    return prismaInstance;
  } catch (err) {
    console.error("Failed to initialize Prisma Client:", err.message);
    return null;
  }
}

async function testConnection() {
  const prisma = getPrisma();
  if (!prisma) {
    return {
      connected: false,
      error: "DATABASE_URL is not set or contains placeholder credentials.",
    };
  }

  try {
    // Quick test query
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, error: null };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect().catch(() => {});
    prismaInstance = null;
  }
  if (poolInstance) {
    await poolInstance.end().catch(() => {});
    poolInstance = null;
  }
}

module.exports = {
  getPrisma,
  testConnection,
  disconnectPrisma,
};
