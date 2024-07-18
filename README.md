# Nudd

Run this script to update your Deno dependencies to their latest published
versions. This package is a fork of the original
[deno-udd](https://github.com/hayd/deno-udd) package created from
[Andy Hayden](https://github.com/hayd) with significant changes and renamed to
`nudd` (New Udd).

The biggest differences from the original package are:

- Updated dependencies and Deno API. Most code has been refactored.
- Speed improved by updating dependencies concurrently.
- Nudd only updates to stable versions.
- Nudd only updates to the latest version (removed fragment feature).
- Removed `--test` feature.
- Added support for `.json` files (import maps).
- Added support for jsr.io modules.
- Added more commands: `update`, `add`, `duplicates`.

## Install

```sh
deno install --allow-run --allow-read --allow-write --allow-net --name nudd --force --global https://deno.land/x/nudd/cli.ts
```

To update:

```sh
nudd --upgrade
```

## API

```js
import { Npm } from "nudd/registry/npm.ts";

const ventojs = Npm.parse("npm:ventojs@0.12.8");

ventojs.name; // ventojs
ventojs.version; // 0.12.8
ventojs.type; // npm
ventojs.url; // npm:ventojs@0.12.8

await ventojs.versions(); // Array with all available versions
await ventojs.latestVersion(); // Returns the latest stable version of the package
ventojs.at("0.12.7"); // npm:ventojs@0.12.7
ventojs.packageUrl; // https://www.npmjs.com/package/ventojs
```

## Update dependencies

Update the imports of the current import map file:

```sh
nudd update
```

Update the imports of the `deps.ts` file:

```sh
nudd update deps.ts
```

Update all TS files in your directory:

```sh
nudd update *.ts
```

Update the imports of your scripts installed globally with Deno:

```sh
nudd update --global
```

Use the `--dry-run` argument to only show outdated dependencies without update
them:

```sh
nudd update --dry-run
```

## Detect duplicated dependencies

Detect and fix multiple versions of the same package:

```sh
nudd duplicates main.ts
```

Use the `--dry-run` argument to only show duplicated dependencies without fix
them:

```sh
nudd duplicates main.ts --dry-run
```

## Add new dependencies

Search and add a new dependency to your import map file:

```sh
nudd add react
```

Search and add several dependencies at the same time:

```sh
nudd add react @std/path lume lumeland/cms
```

- Single name dependencies, (like `react` or `lume`) are searched in
  `deno.land/x` and `npm`.
- Scoped dependencies starting with `@` (like `@std/path`) are searched in
  `jsr`and `npm`.
- Scoped dependencies without `@` (like `lumeland/cms`) are searched in GitHub
  and imported from `jsdelivr`.
