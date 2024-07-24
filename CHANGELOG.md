# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.8] - 2024-07-24
### Fixed
- Update multiple imports of the same specifier in the same file.

## [0.2.7] - 2024-07-18
### Added
- New `Package.create(name)` static function.
- New `pkg.latestVersion()` function to return the latest version of a package.
- New `pkg.toLatestVersion()` function to change the version of a package to the latest version.

## [0.2.6] - 2024-07-04
### Added
- New `packageUrl` property to get the package landing page.

## [0.2.5] - 2024-06-23
### Added
- Support for NPM packages loaded from JsDelivr.

### Changed
- Use JsDelivr API to get versions (instead of GitHub API).

## [0.2.4] - 2024-05-25
### Added
- New `-g, --global` flag to update scripts installed globally by Deno.

### Fixed
- Parse JSR imports with `/` before the scope (for example `jsr:/@scope/name`).

## [0.2.3] - 2024-05-09
### Fixed
- Duplicates with HTTP packages.

## [0.2.2] - 2024-05-06
### Added
- New command `nudd add [packages...]`.
- When running `nudd update` without passing files, the exiting import map file is used instead of returning an error.

## [0.2.1] - 2024-05-05
### Added
- Support for http specifiers of JSR.

## [0.2.0] - 2024-05-01
### Added
- Allow to change the file path in `Registry.at()`.
- Update specifiers inside `tasks` in deno.json files.
- Support for `https://jspm.dev/` urls.
- Support for `https://jsr.io/` urls.
- Support for `https://deno.re/` urls.
- Added `duplicates` command (experimental).

### Changed
- Breaking: Removed default command. Use `nudd update [files...]` to update dependencies.

### Fixed
- Updated dependencies

## [0.1.2] - 2024-04-15
### Added
- Support for import maps. Any file with `.json` extension is handled as an import map.
- Support for jsr.io

## [0.1.1] - 2024-04-14
### Fixed
- `npm:` specifiers with file path.

## [0.1.0] - 2024-04-14
First version

[0.2.8]: https://github.com/oscarotero/nudd/compare/v0.2.7...v0.2.8
[0.2.7]: https://github.com/oscarotero/nudd/compare/v0.2.6...v0.2.7
[0.2.6]: https://github.com/oscarotero/nudd/compare/v0.2.5...v0.2.6
[0.2.5]: https://github.com/oscarotero/nudd/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/oscarotero/nudd/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/oscarotero/nudd/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oscarotero/nudd/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oscarotero/nudd/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oscarotero/nudd/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/oscarotero/nudd/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/oscarotero/nudd/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/oscarotero/nudd/releases/tag/v0.1.0
