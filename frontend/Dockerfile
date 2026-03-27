# frontend/Dockerfile

# ETAP 1: Budowanie (Build)
FROM node:20-alpine as build

WORKDIR /app

# Kopiujemy package.json i package-lock.json
COPY package*.json ./

# Instalujemy zależności
RUN npm install

# Kopiujemy resztę kodu źródłowego
COPY . .

# Budujemy aplikację (Vite tworzy folder /dist)
RUN npm run build

# ETAP 2: Serwowanie (Nginx)
FROM nginx:alpine

# Kopiujemy zbudowane pliki z etapu build do katalogu Nginxa
# UWAGA: Vite buduje do 'dist', a nie 'build'
COPY --from=build /app/dist /usr/share/nginx/html

# Kopiujemy konfigurację Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Otwieramy port 80 wewnątrz kontenera
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]