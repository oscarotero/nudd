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
- Are more commands: `update`, `add`, `duplicates`.

## Install

```sh
deno install --allow-run --allow-read --allow-write --allow-net --name nudd --force --global https://deno.land/x/nudd/cli.ts
```

To update:

```sh
nudd --upgrade
```

## Update imports

Update the imports of the current import map file:

```sh
nudd update
```

Update the modules imported from `deps.ts` file:

```sh
nudd update deps.ts
```

To update all the ts files in your directory:

```sh
nudd update *.ts
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

Search and add new dependencies to your import map file:

```sh
nudd add lume @std/path react
```

It will search the this package in `deno.land`, `jsdelivr`, `jsr` and `npm`.
