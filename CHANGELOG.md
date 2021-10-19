# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Append different files
## [0.4.2] - 2021-10-18

### Added

- Add support for multiple checkout-ui apps, required for clients who have heavily edited the checkout flow 

## [0.4.1] - 2021-07-15

### Fixed
- Error when there's no files published to the workspace
## [0.4.0] - 2021-07-01

### Changed
- When using `checkout-ui-custom`, it will first look for files on **VBase**, **Masterdata** is now a fallback
## [0.3.1] - 2020-08-18

### Changed
- Declarer from`vtex.checkout-custom` to `vtex.checkout-ui-custom`

## [0.3.0] - 2020-08-17

### Added
- Added a new layer to the current implementation to make it compatible with the app `vtex.checkout-custom`

## [0.2.1] - 2020-05-12
### Fixed
- Content type in assets

## [0.2.0] - 2020-03-09
### Added
- Enabled route

## [0.1.0] - 2020-02-19
### Changed
- Delete unused code
  - Enabled middleware
  - Tests from template

### Added
- Create project initial version
