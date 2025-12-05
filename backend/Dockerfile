# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# ---------- Production Image ----------
FROM node:20-alpine AS prod
WORKDIR /usr/src/app

# Copy node_modules from build stage (includes @prisma/client)
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copy build output
COPY --from=build /usr/src/app/dist ./dist

# Copy Prisma schema (needed for runtime)
COPY --from=build /usr/src/app/prisma ./prisma

EXPOSE 3000

# Run production server
CMD ["node", "dist/src/main.js"]
