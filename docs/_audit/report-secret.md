# Documentation Audit

## consistency: PASS  (PASS 10 / WARN 0 / UNKNOWN 0 / NA 0 / FAIL 0)

## diagram: PASS  (PASS 2 / WARN 0 / UNKNOWN 0 / NA 0 / FAIL 0)

## security: FAIL  (PASS 0 / WARN 0 / UNKNOWN 0 / NA 0 / FAIL 7)
- [FAIL] secret-scan — 6 hit(s): AWS access key, GitHub token, OpenAI-style sk key — remove/refer to env vars instead
- [FAIL] docs/markdown/overview.md:26 — AWS access key conf…7890
- [FAIL] docs/markdown/overview.md:26 — GitHub token conf…7890
- [FAIL] docs/markdown/overview.md:27 — OpenAI-style sk key sk-p…aaaa
- [FAIL] docs/markdown/overview.md:26 — AWS access key conf…7890
- [FAIL] docs/markdown/overview.md:26 — GitHub token conf…7890
- [FAIL] docs/markdown/overview.md:27 — OpenAI-style sk key sk-p…aaaa

## integrity: PASS  (PASS 16 / WARN 0 / UNKNOWN 0 / NA 0 / FAIL 0)

## Overall
Overall: **FAIL**

- consistency: PASS
- diagram: PASS
- security: FAIL
- integrity: PASS