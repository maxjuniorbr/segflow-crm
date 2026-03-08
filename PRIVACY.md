# Privacy Policy

`SegFlow CRM` is a management system for insurance brokerages. The repository does not enable analytics or trackers by default, but the application processes operational data inside the infrastructure where you deploy it.

## Summary

- CRM data is stored in the database configured for the project instance
- authentication uses `httpOnly` cookies and rotating refresh tokens
- the frontend calls BrasilAPI to fill address data from zip codes
- whoever operates the instance is responsible for the data processed in production

## Data Processed by the Application

- registration data for brokerages, users, and clients
- proposal and policy data
- credentials and authentication artifacts required to keep sessions active
- technical logs and environment error messages

## External Services

- `BrasilAPI`: zip code lookup used to fill address fields

The repository does not enable analytics, marketing pixels, or third-party usage tracking in the main app.

## Storage and Security

- data is persisted in the PostgreSQL database configured for the instance
- authentication uses JWT and rotating refresh tokens
- the backend applies `helmet`, `cors`, input validation, and rate limiting

## Operator Responsibility

If you deploy `SegFlow CRM`, you are responsible for retention, access, backup, and legal compliance for the data processed in your instance.

## Contact

For general support, see [SUPPORT.md](SUPPORT.md). To report vulnerabilities, see [SECURITY.md](SECURITY.md).
