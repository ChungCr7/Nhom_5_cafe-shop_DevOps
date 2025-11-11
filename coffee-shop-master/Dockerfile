# --- Build stage ---
FROM node:18-alpine AS builder
WORKDIR /app

# nhận biến build từ Jenkins
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --mode production


# --- Serve stage ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
