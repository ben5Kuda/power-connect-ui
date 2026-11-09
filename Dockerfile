# PowerConnect web app: Expo turns the React Native app into a website, nginx serves it.

# ---------- Step 1: build the website ----------
FROM node:22-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# The website calls the API on the same address, under /api (nginx forwards it - see nginx.conf)
ENV EXPO_PUBLIC_API_URL=/api
RUN npx expo export --platform web --output-dir dist

# ---------- Step 2: serve it with nginx ----------
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html
EXPOSE 80
