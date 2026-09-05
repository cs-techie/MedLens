# MedLens Production Performance & Benchmark Suite

## Overview
High-reliability medical intelligence demands millisecond execution on safety checks and predictable latency under high concurrency. The `benchmarks/` directory documents micro-benchmarks and macro pipeline throughput for MedLens.

## Micro-Benchmark Latency Profile (500 Iterations)
| Subsystem | Latency (ms/op) | Throughput (ops/sec) | Complexity |
| :--- | :--- | :--- | :--- |
| **SHA-256 Content Hashing & Cache** | `0.042 ms` | 23,800/s | $O(N)$ bytes |
| **Medical DSL Biological Validator** | `0.018 ms` | 55,500/s | $O(1)$ |
| **Multi-Signal Consensus Engine** | `0.012 ms` | 83,300/s | $O(1)$ |
| **Safety Verification Agent** | `0.024 ms` | 41,600/s | $O(M)$ tokens |

## Macro Pipeline SLA Breakdown
```
[User File Upload]
       ↓ (42ms) - Client SHA-256 Checksum & Zero-Retention Memory Stage
[Tesseract OCR & Tabular Layout Alignment]
       ↓ (1,240ms) - Bounding Coordinate Matrix Generation
[Gemini Structured AI Extraction]
       ↓ (890ms) - JSON Extraction & Anchor Matching
[Medical DSL & Consensus Engine]
       ↓ (0.03ms) - Multi-Signal Weighted Synthesis (OCR 40%, Schema 30%, Pattern 30%)
[Safety Verification Gate]
       ↓ (0.02ms) - Zero-Diagnosis & Grounding Assertion Pass
[Clinical Dashboard Presentation]
──────────────────────────────────────────────────────────
Total E2E Pipeline P50: 2.17 seconds
```

## Running Benchmarks
```bash
npm run benchmark
```
or via Vitest performance suite:
```bash
npm test tests/performance/
```
