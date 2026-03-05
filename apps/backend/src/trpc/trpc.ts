import { initTRPC } from '@trpc/server';

export const createContext = async () => ({});

const t = initTRPC.context<typeof createContext>().create();
export const router = t.router;
export const publicProcedure = t.procedure;
