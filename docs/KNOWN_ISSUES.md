# FarmConnect – Known Issues & Gap Log

## Initial Audit Findings (Phase 0 – 2026-11-05)

### Issue 1: Discrepancy Between Legacy Assertion and Code Reality
- **Severity:** High (Integrity / Baseline)
- **Description:** The legacy file `docs/PROJECT_BASELINE.md` contained the assertion: `"All 32 phases verified."` However, physical code inspection of the provided repository archive (`FarmConnect-source.zip`) revealed only a 12-line placeholder in `mobile-android/App.js` and no backend or database code.
- **Root Cause:** As noted by the user, prior generation attempts in Gemini experienced context drift and memory truncation, producing hollow placeholder statements without persisting actual implementation files.
- **Resolution:** Re-established reality-based Phase 0 baseline in `docs/PROJECT_BASELINE.md` and `docs/FARMCONNECT_PROGRESS.md`. All future phase claims will strictly reflect executable, verified code.

### Issue 2: Backend Architecture & Server Missing
- **Severity:** Critical
- **Description:** There is currently no backend directory, no Express server, no API route handlers, and no API documentation.
- **Resolution:** Backend architecture is fully specified in `docs/ARCHITECTURE.md` and will be incrementally established starting with foundational API layers and database models.

### Issue 3: Database & ORM Missing
- **Severity:** Critical
- **Description:** None of the 25 required relational entities (Users, Roles, FarmerProfiles, Products, Crops, Orders, Payments, MandiPrices, WeatherCache, etc.) exist in code.
- **Resolution:** The complete database architecture and schema definitions are documented in `docs/ARCHITECTURE.md`. Models and migrations will be implemented systematically.

### Issue 4: Mobile Application Navigation & Components Missing
- **Severity:** High
- **Description:** `mobile-android/App.js` is an unrouted single View. No React Navigation stack or tab navigators are configured.
- **Resolution:** Phase 1 will install the navigation infrastructure, design system, theme tokens, and reusable components.

### Issue 5: No Authentication or Role Guards
- **Severity:** High
- **Description:** Zero authentication logic exists. No registration, login, token storage, or role enforcement (Farmer, Buyer, Seller, Admin) is implemented.
- **Resolution:** Scheduled for Phase 2.

### Issue 6: Zero Real Integrations
- **Severity:** Medium
- **Description:** External dependencies (Mandi prices, Weather, AI assistance, Payment gateways) are not connected.
- **Resolution:** In adherence to **STRICT ANTIGRAVITY RULE 9 (REAL INTEGRATIONS ONLY)**, all external capabilities will be connected via verifiable services, explicitly distinguishing live APIs from test sandbox environments, and never pretending a mock is a live service.
