# NPM dependency audit inventory — 28/11/2026

Baseline: FE main be31769, SonarCloud #137 job 140854493649: 25/25 Node tests, 19 affected npm packages (10 high, 9 moderate). Browser #8 passed existing WaterBench and role contracts; not a new RAS-specific browser test. Sonar scan skipped. The 19 counts alone do not identify distinct CVEs, reachability, or safe upgrades.

The new NPM Dependency Audit workflow inventories the committed lockfile twice (all dependencies and --omit=dev), reports direct/transitive packages, actual versions, advisories, paths and suggested fixes, and publishes raw JSON plus summary with exact lock SHA-256. It does not install packages or run audit fix, and fails on invalid reports/registry errors rather than reporting zero. Valid findings emit a warning; this inventory is intentionally non-blocking for vulnerability counts while remediation is planned. It is not a security clearance or a release gate. Packages in dependencies include build tools, so omit-dev is not proof of deployed browser reachability. No dependency versions changed.

Next: compare actual inventory, inspect affected paths and upgrades, choose compatible fixes, regenerate lockfile, verify npm ci, Node tests, Chromium and Pages build. No --force. Keep unresolved findings documented and establish a separate severity gate once baseline is understood.
