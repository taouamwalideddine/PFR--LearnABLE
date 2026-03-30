FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

# Vite requires the host flag, which we just configured in vite.config.js
CMD ["npm", "run", "dev"]
