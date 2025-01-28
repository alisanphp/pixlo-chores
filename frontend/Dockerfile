# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Environment variables will be injected at build time
RUN npm run build

ENV PORT=5555

EXPOSE 5555
CMD ["npm", "run", "preview", "--", "--port", "5555", "--host"]