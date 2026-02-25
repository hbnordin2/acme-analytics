FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev && npm install tsx

COPY tsconfig.json ./
COPY src/ ./src/

EXPOSE 4010 4011 4012

CMD ["npx", "tsx", "src/index.ts"]
