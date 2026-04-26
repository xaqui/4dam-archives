# 4dam (4dam)

Static archive of the 4dam imageboard timeline

## Rebuild the static archive

The public archive JSON is generated from all SQL dumps in `../db/dumps`.

```bash
npm run build:archive
```

This rebuilds `public/archive.json` by merging the full dump history, preserving
all observed posts, computing final scores, and freezing best-effort historical
author snapshots into each post.

The generated `public/archive.json` is committed and consumed by the frontend at
runtime as the app's only data source.

## Install quasar CLI

```bash
npm i -g @quasar/cli
```

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

### Build the app for production

```bash
npm run build:archive
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
