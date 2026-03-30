FROM node:20-alpine

WORKDIR /app

# Copy package files strictly first for layer caching
COPY package*.json ./

RUN npm install

# Copy source code
COPY . .

EXPOSE 5000

# Use the dev command for hot reloading
CMD ["npm", "run", "dev"]
