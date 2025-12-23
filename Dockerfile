# Dockerfile multi-stage para Next.js 16

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copia dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente para build (se necessário)
ENV NEXT_TELEMETRY_DISABLED=1

# ARG para variáveis de ambiente que serão passadas no build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

# Define como ENV para que estejam disponíveis durante o build
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

# Build da aplicação
RUN npm run build

# Stage 3: Runner (produção)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas arquivos necessários do modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

