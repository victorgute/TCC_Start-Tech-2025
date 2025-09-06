# --- Estágio 1: Build ---
# Usa uma imagem oficial do Node.js como base
FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# --- Estágio 2: Produção ---
# Usa uma imagem menor e mais segura para a execução final
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia as dependências já instaladas do estágio de build
COPY --from=build /usr/src/app/node_modules ./node_modules

# Copia o código-fonte da sua aplicação
COPY . .

# Expõe a porta em que seu servidor está rodando (conforme seu server.js)
EXPOSE 3001

# Comando para iniciar a aplicação quando o contêiner rodar
CMD [ "node", "server.js" ]
