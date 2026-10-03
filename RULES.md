
# Consent Builder - Business Rules & Specification

## 1. Template Status Rules

*   **Draft (`X.Y` where Y > 0)**
    *   This is the editable working state for future releases.
    *   **Version Rule:** Must have a minor version number greater than 0 (e.g., `0.1`, `1.1`, `2.4`).
    *   **Coexistence:** A Draft **can and often does** exist simultaneously while a previous major version (e.g., `1.0`) is `Published` or `Rolling Out`.
    *   **Constraint:** A Draft **cannot** be deployed to sites.
    *   **Transition:** Can be promoted to `Rolling Out` or `Published` (which triggers a version bump to the next `X.0`).

*   **Published (`X.0`)**
    *   The stable, live version available to all sites.
    *   **Version Rule:** Must be a major integer (e.g., `1.0`, `2.0`).
    *   **Constraint:** Read-only. To start work on the next release, a new Draft (`X.1`) is created or an existing one is accessed.

*   **Rolling Out (`X.0`)**
    *   An intermediate state where a finalized version (`X.0`) is being incrementally pushed to sites.
    *   **Version Rule:** Same as Published (`X.0`).
    *   **Behavior:** Allows the user to push the update to specific sites incrementally. Once all sites are updated, it automatically transitions to `Published`.

*   **Archived (`X.0` or `X.Y`)**
    *   Previous stable versions or discarded snapshots.
    *   **Constraint:** Read-only reference.

---

## 2. Versioning Logic

*   **Release vs. Working Versions:**
    *   `X.0` (e.g., `1.0`, `2.0`) are reserved for stable releases used by sites.
    *   `X.Y` (e.g., `1.1`, `1.2`) are reserved for working drafts and history.
*   **Version Propagation:**
    *   When a **Block** is edited inside a Draft Template (v1.1), the Block version increments (e.g., `1.0` -> `1.1`).
    *   When a **Template** is Published, the working draft version jumps to the next whole number release (e.g., Draft `1.1` -> Published `2.0`).

---

## 3. Block Structure & Relationships

*   **Mandatory Blocks (Parent)**
    *   Defined by the Skeleton or added manually as universal components.
    *   **Rule:** Mandatory blocks **should ideally not have restrictive logic rules** (they are the baseline).

*   **Derived Blocks (Child)**
    *   Clones of Mandatory blocks created to handle specific state, site, or legal exceptions.
    *   **Rule:** Derived blocks **must have logic rules** to prevent them from colliding with the parent.
    *   **Syncing:** If a Parent block is updated in the current draft (e.g., v1.1), any Derived blocks still referencing the old parent version (e.g., v1.0) are flagged as "Source Updated" in the UI.

---

## 4. Logic Rules

### A. System Logic
*   **Definition:** Safety/Capability rules typically based on **Site** properties.
    *   *Example:* `IF Site == 'Regional Hub' -> Exclude Antibody Therapy`.
*   **UI Behavior:** Marked as "System," read-only for study designers.

### B. Normal (User) Logic
*   **Definition:** Rules defined for protocol flow (Recipient, Intervention, etc.).
    *   *Example:* `IF Situation == 'consent to continue' -> Include Block`.

---

## 5. Site Management

*   **Site Pinning:** Sites are pinned to a specific release version (e.g., `Royal Melbourne` is on v1.0).
*   **Update Flow:**
    1.  Draft v1.1 is finalized -> becomes v2.0.
    2.  Template status becomes `Rolling Out`.
    3.  Admin selects sites to move from v1.0 to v2.0.
    4.  Sites are updated incrementally.
    5.  A new Draft v2.1 can be started immediately while v2.0 is still Rolling Out.
