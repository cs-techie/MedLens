# Security Policy & HIPAA Compliance Posture

## Supported Versions
| Version | Supported |
| :--- | :--- |
| 1.4.x | :white_check_mark: |
| < 1.4 | :x: |

## Security & HIPAA Directives
1. **Zero Data Retention**: MedLens runs processing strictly within volatile memory. No patient diagnostic documents, images, or extracted clinical reports are permanently persisted to local storage, cookies, or remote databases.
2. **Client-Side PHI De-Identification**: All direct Patient Health Information (PHI)—including Patient Name, Medical Record Number (MRN), Social Security Number (SSN), contact details, and dates—is redacted before text tokens are processed by AI models.
3. **Verification Agent Boundary**: The post-generation safety checker blocks definitive diagnostic statements and medication prescription commands to preserve clinical oversight and patient safety.
4. **Audit Controls (HIPAA § 164.312(b))**: All document sessions maintain an immutable in-memory audit log recording timestamps, redaction events, field changes, and provenance coordinates.

## Reporting a Vulnerability
To report potential security vulnerabilities or data isolation flaws, email `security@medlens.health` or open a confidential security advisory on GitHub. We adhere to a 48-hour disclosure response SLA.
