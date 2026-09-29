FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json

RUN npm ci --workspace=server --include-workspace-root=false --omit=dev

COPY server server

EXPOSE 5000

CMD ["npm", "start", "--workspace=server"]
