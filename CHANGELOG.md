# Changelog

All notable changes to ProctorIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-28
### Added
- **Marketplace Ready**: Initial premium release structure for marketplaces.
- **Docker Support**: Full `Dockerfile` and `docker-compose.yml` for 1-click deployments.
- **Dark Mode**: Complete Dark Mode implementation and persistent theme toggling.
- **Improved UX**: Replaced blocking browser alerts with modern `react-hot-toast` notifications and custom Modals.
- **Strict Configuration**: Centralized environment variable validation on the backend.
- **Documentation**: Comprehensive installation and configuration guides.

### Security
- Hardened environment variable management.
- Ensured JWT secrets and database URIs are correctly abstracted from the source code.
- Removed stack traces from production API responses.
