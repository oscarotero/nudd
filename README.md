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

## Install

```sh
deno install --allow-run --allow-read --allow-write --allow-net --name nudd --force --global https://deno.land/x/nudd/cli.ts
```

To update:

```sh
nudd --upgrade
```

## Usage

For example, to update url imports inside `deps.ts` run:

```sh
nudd deps.ts
```

To update all the ts files in your directory:

```sh
nudd *.ts
```
