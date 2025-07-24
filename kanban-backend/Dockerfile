# Step 1: Builder stage
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Step 2: Final image
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 5000
CMD ["node", "server.js"]
