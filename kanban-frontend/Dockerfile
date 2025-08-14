# Step 1: Use Node to build the React app
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install --network-timeout=300000 --prefer-offline --no-audit --progress=false && \
    npm cache clean --force
COPY . .
RUN npm run build

# Step 2: Use NGINX to serve the build
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY public/env.js /usr/share/nginx/html/env.js
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]