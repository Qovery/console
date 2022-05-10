FROM node:14-alpine AS builder

# Add a work directory
WORKDIR /app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ARG NX_QOVERY_API
ENV NX_QOVERY_API $NX_QOVERY_API

ARG NX_OAUTH_DOMAIN
ENV NX_OAUTH_DOMAIN $NX_OAUTH_DOMAIN

ARG NX_OAUTH_KEY
ENV NX_OAUTH_KEY $NX_OAUTH_KEY

ARG NX_OAUTH_AUDIENCE
ENV NX_OAUTH_AUDIENCE $NX_OAUTH_AUDIENCE

ARG NX_INTERCOM
ENV NX_INTERCOM $NX_INTERCOM

ARG NX_POSTHOG
ENV NX_POSTHOG $NX_POSTHOG

ARG NX_POSTHOG_APIHOST
ENV NX_POSTHOG_APIHOST $NX_POSTHOG_APIHOST

ARG NX_LOGROCKET
ENV NX_LOGROCKET $NX_LOGROCKET

ARG NX_GTM
ENV NX_GTM $NX_GTM

ARG NX_ONBOARDING
ENV NX_ONBOARDING $NX_ONBOARDING

# Cache and Install dependencies
COPY package.json .
COPY yarn.lock .
RUN yarn global add @nrwl/cli
RUN yarn install --production

# Copy app files
COPY . .
# Build the app
RUN yarn build

# Bundle static assets with nginx
FROM nginx:latest
# Copy built assets from builder
COPY --from=builder /app/dist/apps/* /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
