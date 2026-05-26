FROM node:20-alpine AS build
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV BACKEND_URL=http://backend:8080

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV BACKEND_URL=http://backend:8080

RUN apk add --no-cache libc6-compat

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 80

CMD ["npm", "run", "start"]