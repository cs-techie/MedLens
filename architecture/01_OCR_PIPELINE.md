# 01 - OCR & Document Normalization Pipeline

```mermaid
flowchart TD
    A[Raw PDF / Image Upload] --> B[Client-Side Canvas Rasterizer]
    B --> C[Contrast & Deskew Filter]
    C --> D[Tesseract.js Multi-Threaded Engine]
    D --> E[Spatial Line & Column Matrix Extraction]
    E --> F[Tabular Grid Alignment]
    F --> G[Normalized Text Stream with Coordinate Bounding Boxes]
    G --> H[SHA-256 Fingerprint Cache Binding]
```

## Engineering Principles
1. **Coordinate Bounding**: Every recognized character sequence retains its `{ page, line, boundingBox: { x, y, width, height } }` coordinate matrix.
2. **Tabular Column Detection**: Blood panels present tabular headers (Test Name, Result, Units, Reference Interval, Status). MedLens uses adaptive horizontal whitespace thresholding to avoid column merging.
3. **Fidelity Scoring**: The engine extracts raw character confidence probabilities (0-100) feeding into the downstream Consensus Engine as a 40% weighted signal.
