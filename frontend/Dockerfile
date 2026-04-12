# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Pass build-time environment variable if needed, or default it.
# In a real environment, you might pass it as build arg: ARG REACT_APP_API_URL
RUN npm run build

# Serve stage
FROM nginx:alpine
# Copy the built app to nginx docroot
COPY --from=build /app/build /usr/share/nginx/html
# Expose port (Nginx default is 80)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
