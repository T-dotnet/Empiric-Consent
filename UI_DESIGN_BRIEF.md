# UI Design Brief: Consent Template Builder (Compliance MVP#2)

## 1. Project Introduction
The Consent Template Builder is an enterprise-grade platform that transforms static legal/clinical documents (Participant Information Sheets) into dynamic, rule-based systems. It addresses the complexity of clinical trials where a single consent form must adapt to hundreds of variations based on surgical intervention, medical domain, jurisdiction, and site-specific needs. The move from static Word documents to this dynamic system is intended to reduce human error, ensure legal compliance across diverse regions, and increase the speed of trial set-up.

## 2. Personas

### Persona A: "Sarah", the Clinical Trial Manager (CTM)
- **Goal:** Get the consent process live at 50+ hospital sites quickly, without compliance gaps.
- **Pain Points:** Tracking which sites are using outdated consent versions; slow sign-offs from legal.
- **Key App Usage:** Dashboard (Site Rollout status), Version Comparison (checking what changed), Site Management.

### Persona B: "David", the Compliance Officer
- **Goal:** Ensure every consent variation, even site-specific ones, satisfies legal requirements.
- **Pain Points:** Auditing complex logic branches; ensuring no "orphaned/unauthorised" language is used.
- **Key App Usage:** Logic Builder (auditing rules), Audit Log, History/Diff Viewer, Notes Panel.

### Persona C: "Dr. Elena", the Principal Investigator (PI)
- **Goal:** Quickly preview how a consent form presents to patients at her specific site.
- **Pain Points:** Disliking complex/irrelevant terminology; wanting to verify the form looks correct locally.
- **Key App Usage:** Preview functionality, Template Builder (for her site's derived blocks).

## 3. User Journey
1.  **Drafting:** CTM initiates a new draft from an existing active version.
2.  **Logic Construction:** CTM and Compliance work together to define which blocks appear under which conditions (e.g., SITE=Melbourne -> Include Block X).
3.  **Simulated Validation:** User runs the "Test Logic" simulation to ensure all site-specific branching renders correctly against different patient profiles.
4.  **Publishing & Rollout:** Draft is published. The system promotes it to "Rolling Out" status.
5.  **Site Distribution:** CTM triggers the rollout for clinical sites; sites receive notification and move to "Under Review".
6.  **Audit:** Compliance logs into the Audit section to verify the changes made during the drafting phase.

## 4. User Flow
1.  **Dashboard (`TemplateList`):** Review template status -> Trigger new Draft.
2.  **Builder (`BlockList`):** Reorder content -> Edit content/logic per block.
3.  **Simulation (`TestLogicModal`):** Verify logic branches on test entities.
4.  **Distribution (`SiteDetailsModal`):** Trigger site-level updates.
5.  **Review (`AuditLogModal`):** Final compliance verification.

## 5. Page Architecture
- `/` Template Dashboard
  - `/builder/:templateId` Template Builder Workspace
    - `/block/:blockId` (via `BlockModal`)
    - `/logic/:blockId` (via `LogicModal` / `BlockModal` logic tab)
  - `/rollout/:templateId` (via `SiteDetailsModal`)
  - `/history/:templateId` (via `HistoryModal`)

## 6. Screen Breakdowns (Layout & Interaction)

### A. Template Dashboard (`TemplateList`)
- **Layout:** Header + Version Table.
- **UX Goal:** Immediate status awareness.
- **Interaction:** Row click for navigation. "Rollout Progress" indicates health of site adoption.

### B. Template Builder Workspace (`BlockList`)
- **Layout:** Sticky Header + Split-Pane (List left, Notes right).
- **UX Goal:** Focus on modular content flow.
- **Interaction:** Drag-and-Drop blocks. Hover-based action menu to minimize visual noise. Expanding block cards for deep-dive logic editing.

### C. Editor Modals (`BlockModal`, `LogicModal`)
- **Layout:** Tabbed modal (Block/Logic) OR Sequential Wizard (`LogicModal`).
- **UX Goal:** Reduce cognitive load during complex rule authoring.
- **Interaction:** Split-pane Markdown editor (live preview). Wizard-style logic constructor (`Constraint` -> `Operator` -> `Values`).

## 7. Data Models
- **Block Types:** Universal, Domain, Intervention, Recipient, Site, Appendix, Consent, Signature.
- **Logic Attributes:** Site, Jurisdiction, Intervention, Recipient, Domain, Situation.
- **Operator Logic:** EQUAL TO, NOT EQUAL TO, CONTAINS, ANY (Multi-select).

## 8. Critical UX/Interaction Requirements
- **Versioning:** Every change must have a snapshotable history.
- **Diffing:** Inline and Split-pane comparisons must be mandatory for reviewers. 
- **Inheritance:** Derived blocks must clearly refer back to their origin with a visual "fork" icon.
- **Markdown:** The editor must support smart variable insertion (`{{...}}`) and dynamic list generation.
