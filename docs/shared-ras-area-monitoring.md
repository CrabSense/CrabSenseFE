# Farm Admin — shared RAS water (28/11/2026)

One area has a shared RAS loop; boxes and rows inherit the representative measurements, without copying records or assuming sensor position. Monitoring now uses explicit selected area and qualified /iot/live instead of areaWater and box.water. Each sensor displays its own source, receipt/measurement time, actual unit and configured threshold. All Areas does not show combined water numbers; box table references area water. Chemical results remain in WaterBench, sample location not fixed. No BE/database or role changes.

Dedicated bearer read without retry/redirect/cache, strict success and area, foreground/network/session gate, 5s polling, 10s timeout, 15s lease. Four Node regressions added to existing mandatory suite. No production JWT/browser/device validation yet. Other dashboard health scores and legacy helpers still require audit. Dependency audit separate.

## Dashboard containment
Backend DashboardService waterQualityScore measures active sensor last-seen coverage (2h) minus alert penalties, not validated water quality. The overall score can also omit missing components. Farm Admin Dashboard now displays the existing qualified per-sensor RAS cards, only for an explicitly selected verified area; no All Areas aggregation. Legacy combined health score/breakdown and metrics request are removed from this route. Preserve overview and business KPIs; do not infer missing device counts in the reused card grid. One source-wiring regression plus existing four model regressions; browser lifecycle/production JWT and other KPI semantics remain open. No BE or schema change.

## Chromium lifecycle regression
Mandatory browser workflow now also runs rasWater.mjs with isolated synthetic APIs and real Chromium UI. Covers separate sensors/zero, invalid scope and chemistry, delayed previous-area response, All Areas no query, offline/reconnect, token rotation/403 and Monitoring parity. No production JWT, physical sensor, or native lifecycle claims. No package or application logic changes.
