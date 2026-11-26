#!/bin/sh
set -eu

if [ -z "${QOVERY_NPM_READ_TOKEN:-}" ]; then
  exit 0
fi

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$root"
yarn="$root/.yarn/releases/yarn-berry.cjs"
registry=$(node "$yarn" config get npmRegistryServer)
cache=$(node "$yarn" config get cacheFolder)
mirror=$(node "$yarn" config get enableMirror)
if [ "$(node "$yarn" config get enableGlobalCache)" = true ]; then
  mirror=false
fi
if [ "$registry" != 'https://npm-registry.qovery.com' ]; then
  echo 'The Billing SDK token requires the Qovery npm registry.' >&2
  exit 1
fi
version=$(node -p 'require("./package.json").dependencies["qovery-pricing-typescript-axios"]')
set -- "$cache"/qovery-pricing-typescript-axios-npm-"$version"-*.zip
if [ -s "$1" ]; then
  exit 0
fi

scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT

node -e 'console.log(JSON.stringify({ private: true, dependencies: { "qovery-pricing-typescript-axios": process.argv[1] } }))' "$version" > "$scratch/package.json"
touch "$scratch/yarn.lock"
cd "$scratch"

# Keep the authenticated fetch separate from the full install.
YARN_NPM_REGISTRY_SERVER="$registry" \
  YARN_NPM_AUTH_TOKEN="$QOVERY_NPM_READ_TOKEN" \
  YARN_NPM_ALWAYS_AUTH=true \
  YARN_CACHE_FOLDER="$scratch/cache" \
  YARN_GLOBAL_FOLDER="$scratch/global" \
  YARN_ENABLE_GLOBAL_CACHE=false \
  YARN_ENABLE_MIRROR="$mirror" \
  YARN_ENABLE_IMMUTABLE_INSTALLS=false \
  node "$yarn" install --mode=skip-build

mkdir -p "$cache"
cp "$scratch"/cache/qovery-pricing-typescript-axios-npm-"$version"-*.zip "$cache/"
