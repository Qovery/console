# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder

# Add a work directory
WORKDIR /app

# Define all build arguments and environment variables
ARG NODE_ENV
ARG NX_PUBLIC_QOVERY_API
ARG NX_PUBLIC_QOVERY_WS
ARG NX_PUBLIC_OAUTH_DOMAIN
ARG NX_PUBLIC_OAUTH_KEY
ARG NX_PUBLIC_OAUTH_AUDIENCE
ARG NX_PUBLIC_INTERCOM
ARG NX_PUBLIC_POSTHOG
ARG NX_PUBLIC_POSTHOG_APIHOST
ARG NX_PUBLIC_GTM
ARG NX_PUBLIC_ONBOARDING
ARG NX_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY
ARG NX_PUBLIC_DEVOPS_COPILOT_API_BASE_URL
ARG NX_PUBLIC_MINTLIFY_API_KEY

ENV NODE_ENV=$NODE_ENV \
    NX_PUBLIC_QOVERY_API=$NX_PUBLIC_QOVERY_API \
    NX_PUBLIC_QOVERY_WS=$NX_PUBLIC_QOVERY_WS \
    NX_PUBLIC_OAUTH_DOMAIN=$NX_PUBLIC_OAUTH_DOMAIN \
    NX_PUBLIC_OAUTH_KEY=$NX_PUBLIC_OAUTH_KEY \
    NX_PUBLIC_OAUTH_AUDIENCE=$NX_PUBLIC_OAUTH_AUDIENCE \
    NX_PUBLIC_INTERCOM=$NX_PUBLIC_INTERCOM \
    NX_PUBLIC_POSTHOG=$NX_PUBLIC_POSTHOG \
    NX_PUBLIC_POSTHOG_APIHOST=$NX_PUBLIC_POSTHOG_APIHOST \
    NX_PUBLIC_GTM=$NX_PUBLIC_GTM \
    NX_PUBLIC_ONBOARDING=$NX_PUBLIC_ONBOARDING \
    NX_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY=$NX_PUBLIC_CHARGEBEE_PUBLISHABLE_KEY \
    NX_PUBLIC_DEVOPS_COPILOT_API_BASE_URL=$NX_PUBLIC_DEVOPS_COPILOT_API_BASE_URL \
    NX_PUBLIC_MINTLIFY_API_KEY=$NX_PUBLIC_MINTLIFY_API_KEY

# Install dependencies with cache mount for faster rebuilds
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --immutable

# Copy source files (use .dockerignore to exclude unnecessary files)
COPY . .

# Build with NX cache mount for faster rebuilds
RUN --mount=type=cache,target=/app/node_modules/.cache/nx \
    yarn build

# Bundle static assets with nginx
FROM nginx:1.25-alpine
# Copy built assets from builder
COPY --from=builder /app/dist/apps/* /usr/share/nginx/html
# Add your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
