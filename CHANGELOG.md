# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.4] - Unreleased
### Added
- New `-g, --global` flag to update scripts installed globally by Deno.

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

[Unreleased]: https://github.com/oscarotero/nudd/compare/v0.2.3...HEAD
[0.2.4]: https://github.com/oscarotero/nudd/compare/v0.2.3...HEAD
[0.2.3]: https://github.com/oscarotero/nudd/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oscarotero/nudd/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oscarotero/nudd/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oscarotero/nudd/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/oscarotero/nudd/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/oscarotero/nudd/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/oscarotero/nudd/releases/tag/v0.1.0
