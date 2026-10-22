#!/bin/sh
# Builds the console without going through Nx (used by the Dockerfile, where Nx adds ~9 min of
# cold project graph/executor overhead). Keep in sync with the `build` target in apps/console/project.json:
# sync-changelog first, then the vite build in production mode.
set -e

QOVERY_CHANGELOG_SYNC_STRICT=true node scripts/sync-changelog.mjs
yarn vite build --config apps/console/vite.config.ts --mode production
