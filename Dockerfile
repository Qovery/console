FROM node:14-alpine AS builder
ENV NODE_ENV production

# Add a work directory
WORKDIR /app

ARG NX_QOVERY_API
ENV NX_QOVERY_API $NX_QOVERY_API

ARG NX_OAUTH_DOMAIN
ENV NX_OAUTH_DOMAIN $NX_OAUTH_DOMAIN

ARG NX_OAUTH_KEY
ENV NX_OAUTH_KEY $NX_OAUTH_KEY

ARG NX_OAUTH_AUDIENCE
ENV NX_OAUTH_AUDIENCE $NX_OAUTH_AUDIENCE

# Cache and Install dependencies
COPY yarn.lock .
RUN yarn add @nrwl/cli
RUN yarn install
# Copy app files
COPY . .
# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:latest
# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]