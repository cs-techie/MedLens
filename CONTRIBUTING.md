# Contributing to MedLens

Thank you for contributing to MedLens! We welcome contributions that improve medical extraction accuracy, test coverage, and clinical explainability.

## Development Workflow
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the test suite**:
   ```bash
   npm test
   ```
4. **Run benchmark verification**:
   ```bash
   npm run benchmark
   ```
5. **Run AI evaluation harness**:
   ```bash
   npm run eval
   ```

## Code Quality Standards
- **Zod Schemas**: Every medical analyte must parse through `LabItemSchema`.
- **Zero-Diagnosis**: Never output definitive diagnostic assertions or unauthorized medication prescriptions.
- **Medical DSL**: Any new assay rule must be added to `src/lib/medicalRules.ts` with explicit reference range policy.
- **Tests**: Every new feature or fix must include unit tests under `tests/unit/` and regression tests if altering extraction logic.
