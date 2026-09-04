# [1.1.0](https://github.com/WYRE-AI/node-halopsa/compare/v1.0.13...v1.1.0) (2026-09-04)


### Bug Fixes

* **http:** stop labeling resource-endpoint 400s as credential errors ([#79](https://github.com/WYRE-AI/node-halopsa/issues/79)) ([43a123f](https://github.com/WYRE-AI/node-halopsa/commit/43a123f550852e685cedac26a5a965ee654da9fb)), closes [#78](https://github.com/WYRE-AI/node-halopsa/issues/78)


### Features

* **release:** use extracted CHANGELOG notes instead of --generate-notes ([#76](https://github.com/WYRE-AI/node-halopsa/issues/76)) ([e5b8e97](https://github.com/WYRE-AI/node-halopsa/commit/e5b8e970757c4fb1e8b452c323ddf8a10c5d74b3)), closes [node-datto-rmm#77](https://github.com/node-datto-rmm/issues/77)


## [1.0.13](https://github.com/WYRE-AI/node-halopsa/compare/v1.0.12...v1.0.13) (2026-09-04)


### Bug Fixes

* **security:** resolve dependabot alerts via npm audit fix ([#73](https://github.com/WYRE-AI/node-halopsa/issues/73)) ([ee1d119](https://github.com/WYRE-AI/node-halopsa/commit/ee1d119da4ff6f85f001f9bcd3f98ce5ee344573))


## [1.0.12](https://github.com/WYRE-AI/node-halopsa/compare/v1.0.11...v1.0.12) (2026-08-26)


### Bug Fixes

* **appointments:** startdate_start/startdate_end silently ignored ([#70](https://github.com/WYRE-AI/node-halopsa/issues/70)) ([c3e2be2](https://github.com/WYRE-AI/node-halopsa/commit/c3e2be276528e806487826e1f78d758001990bca)), closes [#63](https://github.com/WYRE-AI/node-halopsa/issues/63) [wyre-technology/node-halopsa#63](https://github.com/wyre-technology/node-halopsa/issues/63)

## [1.0.11](https://github.com/WYRE-AI/node-halopsa/compare/v1.0.10...v1.0.11) (2026-08-25)


### Bug Fixes

* **deps:** ignore the unreachable npm-bundled undici alert ([#67](https://github.com/WYRE-AI/node-halopsa/issues/67)) ([287711c](https://github.com/WYRE-AI/node-halopsa/commit/287711c651ed90ef0a59ab54369f6255f2ff730d))
* migrate to WYRE-AI org (npm scope, ghcr namespace, registry) ([#69](https://github.com/WYRE-AI/node-halopsa/issues/69)) ([7c944fe](https://github.com/WYRE-AI/node-halopsa/commit/7c944fe7e81296044743a85c723ca330cd9ab750))

## [1.0.10](https://github.com/wyre-technology/node-halopsa/compare/v1.0.9...v1.0.10) (2026-08-21)


### Bug Fixes

* **tickets:** page_size ignored on first page, dateoccurred_start/end silently ignored ([#63](https://github.com/wyre-technology/node-halopsa/issues/63)) ([c662f30](https://github.com/wyre-technology/node-halopsa/commit/c662f30cd1e747e4bdedd33960542803500dac27))

## [1.0.9](https://github.com/wyre-technology/node-halopsa/compare/v1.0.8...v1.0.9) (2026-08-11)


### Bug Fixes

* **resources:** accept bare object/array responses on create/update paths ([#59](https://github.com/wyre-technology/node-halopsa/issues/59)) ([41e30fc](https://github.com/wyre-technology/node-halopsa/commit/41e30fc365fa7a976159d0499dcc6421b9e3c4f4)), closes [wyre-technology/halopsa-mcp#76](https://github.com/wyre-technology/halopsa-mcp/issues/76)

## [1.0.8](https://github.com/wyre-technology/node-halopsa/compare/v1.0.7...v1.0.8) (2026-08-06)


### Bug Fixes

* **deps:** ignore unreachable ip-address advisory in dependabot config ([#57](https://github.com/wyre-technology/node-halopsa/issues/57)) ([b6c653f](https://github.com/wyre-technology/node-halopsa/commit/b6c653fad2fcdaff6f236514eb96e869bdfdbdce))

## [1.0.7](https://github.com/wyre-technology/node-halopsa/compare/v1.0.6...v1.0.7) (2026-07-21)


### Bug Fixes

* **auth:** surface token-fetch cause and normalize tenant ([#46](https://github.com/wyre-technology/node-halopsa/issues/46)) ([b6ef1d9](https://github.com/wyre-technology/node-halopsa/commit/b6ef1d99c5a68b4380fb6817eb8a794ab5dc76d2))

## [1.0.6](https://github.com/wyre-technology/node-halopsa/compare/v1.0.5...v1.0.6) (2026-07-18)


### Bug Fixes

* read HTTP response bodies exactly once ([#43](https://github.com/wyre-technology/node-halopsa/issues/43)) ([2333366](https://github.com/wyre-technology/node-halopsa/commit/2333366a7a322312bd8520d8ecb0c7e40897d0e8)), closes [connectwise-automate-mcp#54](https://github.com/connectwise-automate-mcp/issues/54)

## [1.0.5](https://github.com/wyre-technology/node-halopsa/compare/v1.0.4...v1.0.5) (2026-06-22)


### Bug Fixes

* **tsconfig:** restore include/exclude globs ([#31](https://github.com/wyre-technology/node-halopsa/issues/31)) ([c16c119](https://github.com/wyre-technology/node-halopsa/commit/c16c1195f9145002b7dfbe588a7445785ab0b6fe))

## [1.0.4](https://github.com/wyre-technology/node-halopsa/compare/v1.0.3...v1.0.4) (2026-05-20)


### Bug Fixes

* **security:** enforce HTTPS baseUrl, update deps, address npm audit ([#4](https://github.com/wyre-technology/node-halopsa/issues/4)) ([6a1cb8c](https://github.com/wyre-technology/node-halopsa/commit/6a1cb8c8e8773798b6f04a3770314e38bb3b6df9))

## [1.0.3](https://github.com/wyre-technology/node-halopsa/compare/v1.0.2...v1.0.3) (2026-05-07)


### Bug Fixes

* **resources:** apply bare-response and pageinate fixes to all resources ([#3](https://github.com/wyre-technology/node-halopsa/issues/3)) ([46af9cb](https://github.com/wyre-technology/node-halopsa/commit/46af9cb05f6b1676797ac5d371f09ec0b7571422))

## [1.0.2](https://github.com/wyre-technology/node-halopsa/compare/v1.0.1...v1.0.2) (2026-05-06)


### Bug Fixes

* **tickets:** handle bare object response and enable pagination ([#2](https://github.com/wyre-technology/node-halopsa/issues/2)) ([c822233](https://github.com/wyre-technology/node-halopsa/commit/c82223398cf3de8a848dd65a2631b9384f574cbe))

## [1.0.1](https://github.com/wyre-technology/node-halopsa/compare/v1.0.0...v1.0.1) (2026-02-18)


### Bug Fixes

* require Node 22+ (semantic-release@25 compatibility) ([3066bd3](https://github.com/wyre-technology/node-halopsa/commit/3066bd32ddaea07a9cf253745f145d047cb54fe6))
* require Node 22+ (semantic-release@25 compatibility) ([eb9dcc6](https://github.com/wyre-technology/node-halopsa/commit/eb9dcc610a11a56af46f906d1fe88c9304778ee3))
* trigger initial npm package publish ([e82601c](https://github.com/wyre-technology/node-halopsa/commit/e82601c37fd441587d5ab0638f8c090a8e09d268))

# 1.0.0 (2026-02-05)


### Bug Fixes

* Add semantic-release configuration for GitHub Packages publishing ([19d242a](https://github.com/asachs01/node-halopsa/commit/19d242a023e501d62d4e1ea45e23d7aa714c7449))


### Features

* Initial implementation of node-halopsa TypeScript library ([f16341d](https://github.com/asachs01/node-halopsa/commit/f16341dfd19dff3dc3f316d4853ac99cef5e6338))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-04

### Added

- Initial release
- OAuth 2.0 Client Credentials authentication with automatic token refresh
- Multi-tenant URL support (tenant subdomains)
- Rate limiting with proactive throttling (500 req/3min rolling window)
- Automatic pagination with async iterators
- Complete error handling with typed error classes
- Full TypeScript type definitions

### Resources

- Tickets (CRUD, actions, attachments)
- Actions (CRUD)
- Clients/Companies (CRUD)
- Sites (CRUD)
- Assets/Configuration Items (CRUD)
- Asset Types (list, get)
- Contacts/Users (CRUD)
- Items/Products/Services (CRUD)
- Contracts (CRUD)
- Invoices (CRUD, send)
- Quotes (CRUD, send, convert to invoice)
- Projects (CRUD, tasks)
- Appointments (CRUD)
- Opportunities/Sales (CRUD)
- Suppliers (CRUD)
- Agents/Technicians (CRUD, me)
- Teams (CRUD)
- Software Licences (CRUD)
- Knowledge Base (CRUD)
- Recurring Invoices (CRUD)
- Reports (list, get, run)
- Reference Data (ticket types, statuses, priorities, categories, SLAs, custom fields, user roles)

[unreleased]: https://github.com/asachs01/node-halopsa/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/asachs01/node-halopsa/releases/tag/v0.1.0
