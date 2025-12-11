# Studio+233 Operations Console: UI/UX Specification

## 1. Product Vision: "The Media Factory"
**Philosophy:** This is not a generic diagram editor. It is a **High-Volume Media Operations Console**. The user is a **Production Lead** managing the flow of thousands of assets. The aesthetic is **Analog-Industrial** (Dieter Rams' Braun x Precision Instrument).

**Core Experience Pillars:**
1.  **Unified Ingestion:** A "Docking Station" for all media sources.
2.  **Visual Assembly Line:** Seeing the *flow* of assets, not just static nodes.
3.  **Exception Management:** A dedicated "Side-Line" for fixing rejects without stopping the factory.
4.  **Industrial Precision:** High data density, tactile controls, matte finishes.

---

## 2. Visual Language (Braun Industrial)

### 2.1 Color System
*   **Surface:**
    *   *Light (Primary):* Braun Paper (`#F4F4F0`) / Matte Grey Panels (`#E5E5E5`).
    *   *Dark (Secondary):* Matte Black (`#111111`) / Deep Slate (`#1A1A1A`).
*   **Accents (Strict Functionality):**
    *   **Power/Action:** `Braun Orange (#FF4D00)` - Used sparingly for primary "Start" actions.
    *   **Signal/Safe:** `Signal Green (#00C040)` - Active nodes, success states.
    *   **Warning/Loop:** `Industrial Yellow (#FFB800)` - Retrying, Looping.
    *   **Error/Reject:** `Safety Red (#E03C31)` - Failed generation.
*   **Grid:** Subtle, precise technical grid (10px spacing).

### 2.2 Typography
*   **Labels:** `Helvetica Neue` or `Calibri` (Bold, Tight Tracking) - Objective and clean.
*   **Data:** `JetBrains Mono` or `SF Mono` (Uppercase, Spaced).
*   *Example:* `BATCH_ID: 4920` (No decorative elements).

---

## 3. The Layout: "The Factory Floor"

The screen is divided into three distinct zones representing the lifecycle of a batch.

### Zone 1: The Ingestion Bay (Left Panel)
*Replaces the standard file uploader.*
*   **Visual Metaphor:** A physical "Hopper" or "Tray".
*   **UX:**
    *   **Drag & Drop Zone:** Matte, textured area with precise borders.
    *   **Connectors:** Minimalist icons for "Google Drive", "Pinterest", "Dropbox".
    *   **Triggers:** A mechanical toggle switch to change sources.
    *   **Live Queue:** A clean, ordered list of incoming files.
        *   *States:* `PENDING` (Grey), `UPLOADING` (Blinking Indicator), `READY` (Green Dot).

### Zone 2: The Refinery (Center Canvas)
*The Workflow Graph, but optimized for Batch Flow.*
*   **Visual Metaphor:** A Modular Synthesizer or Control Panel.
*   **UX:**
    *   **Nodes:** Physical "Modules". Sharp corners (2px radius). Matte finish.
    *   **Wires:** Thick, distinct cables. Not glowing, but solid lines.
    *   **"Live View" Overlay:**
        *   When a node is selected, a "Filmstrip" slides up (like a physical drawer).
        *   It shows the last 5 images processed by *that specific node*.
        *   Allows instant "Spot Checking" (e.g., verifying the 'Remove BG' node).

### Zone 3: The Asset Warehouse (Right Panel)
*Replaces a simple gallery.*
*   **Visual Metaphor:** A Filing Cabinet / Sorting Tray.
*   **UX:**
    *   **Tabs:** `APPROVED` (Green Indicator), `REJECTS` (Red Indicator), `ARCHIVE`.
    *   **Grid:** Dense thumbnail grid with minimal chrome.
    *   **Stats:** Analog-style counters or simple numeric displays.

---

## 4. Key UX Flows

### 4.1 Adding & Configuring Nodes (The "Tool Chest")
*   **The Parts Bin (Library):**
    *   **Location:** A collapsible drawer on the Left (below Ingestion).
    *   **Visual:** A strict, categorized list (text-only, Helvetica).
    *   **Action:** Drag-and-drop a module onto the canvas. It "clicks" into place on the grid.
*   **The Faceplate (Configuration):**
    *   **Simple Controls:** Toggle switches and status LEDs live *directly on the node*.
    *   **Deep Tuning:** Double-clicking a node opens a **"Faceplate Modal"**.
        *   **Visual:** Looks like a physical device panel (Matte Grey).
        *   **Controls:** Rotational knobs for values (0-100), Toggle switches, Monospace text inputs.
        *   **No Scrolling:** The panel is fixed size, organizing controls logically.
*   **The "Single Shot" (Validation):**
    *   **Problem:** Configuring a blind batch is dangerous.
    *   **Solution:** Every node has a small, physical **"Test" button**.
    *   **Action:** Pressing it pushes *one* sample asset through that specific node.
    *   **Result:** The output immediately appears in the node's "Filmstrip" drawer.

### 4.2 The "Blueprint" vs. "Run" Mode
*   **Blueprint Mode (Edit):**
    *   User connects nodes (`Input` -> `Resize` -> `Flux Gen` -> `Output`).
    *   **Patching:** Drag from Port A to Port B. Cables have slight weight/drape.
    *   **Disconnect:** "Unplug" gesture (drag cable end away from port).
    *   Canvas background is **Neutral Paper**.
*   **Run Mode (Live):**
    *   User hits large, physical **"RUN BATCH"** button (Orange).
    *   Canvas locks (Input disabled).
    *   Nodes show active status with small LEDs.
    *   **Progress Bars:** Slim, horizontal bars on nodes showing local queue.

### 4.3 The "Quality Gate" Interaction (Crucial)
*   **Scenario:** A `Quality Gate` node checks for "Blurriness".
*   **Logic:**
    *   *Pass:* Continues to next node.
    *   *Fail:* Drops into the **"Exception Queue"**.
*   **Visual:** The node has a secondary output port labeled `REJECT`.

### 4.4 The "Exception Handler" (The Side-Line)
*   **Trigger:** A subtle notification: `5 Items for Review`.
*   **Interaction:**
    *   User clicks the notification.
    *   A **"Lightbox"** overlay appears.
    *   **Interface:** Split screen (Clean, white background).
        *   *Left:* The Failed Image.
        *   *Right:* Physical sliders/knobs for that node.
    *   **Action:** User tweaks parameters -> Sees preview -> Clicks **"Approve"**.
    *   The item re-enters the pipeline.

### 4.5 The "Visual Diff" Slider
*   **Use Case:** verifying a "Style Transfer".
*   **Interaction:**
    *   In the "Warehouse", user hovers over a finished asset.
    *   Holding `Spacebar` reveals a "Before/After" wipe.
    *   Simple, direct comparison.

### 4.6 Temporal & Event Triggers (Scheduling)
*   **The "Cron" Node (Timer):**
    *   **Visual:** A node with a simple analog clock icon.
    *   **UI:** Human-readable scheduler: *"Every Friday at 02:00"*.
    *   **Feedback:** Simple countdown text.
*   **The "Event" Node (Sensor):**
    *   **Visual:** A discrete "Input" module.
    *   **Logic:** `On File Created`, `On Webhook`.
    *   **Interaction:** Acts as the start of the assembly line.
*   **Job Dashboard:**
    *   A simple table view of "Upcoming" and "Past" runs.
    *   Text-heavy, high clarity.

---

## 5. UI Component Catalog (For Engineering)

### 5.1 Nodes (Modules)
*   **Standard Node:** Input/Output ports, LED Status, Label.
*   **Router Node:** 1 Input -> Multiple Outputs (Physical Switch visual).
*   **Loop Node:** Distinct "Feedback" cable path.
*   **Gate Node:** "Pass/Fail" ports.
*   **Trigger Node:** (Cron/Event) Distinct "Source" shape.

### 5.2 Indicators
*   **Batch Progress:** Global bar at top.
*   **Node Load:** Numeric counter or simple bar.
*   **Signal Trace:** Solid colored lines (Green for active).

### 5.3 Overlays
*   **Review Station:** Clean modal for manual fixes.
*   **Filmstrip:** Bottom drawer for spot-checks.

---

## 6. Global Navigation & Architecture

### 6.1 The "Operator Header" (Top Bar)
*   **Visual:** Slim, fixed header (`h-14`). Matte finish.
*   **Left:**
    *   **Exit:** `< Dashboard` (Subtle, text-only).
    *   **Context:** `Project Name / Workflow Title`.
*   **Center:** **The Mode Switch (Physical Toggle)**
    *   `BUILD`: Edit the graph. (Neutral Grid Background).
    *   `RUN`: Monitor batch progress. (Dimmed Background).
    *   `DATA`: Manage the Asset Warehouse. (List/Grid View).
*   **Right:**
    *   **Versioning:** `DRAFT / LIVE` Toggle. Prevents accidental edits to production pipelines.
    *   **Cost Meter:** `EST. COST: 450 Credits` (Visible before run).
    *   **User:** Profile / Team Switcher.

### 6.2 The Floating Command Bar (HUD)
*   **Location:** Bottom Center (z-index: 50).
*   **Visual:** Glass-morphism (Blur) or Solid Pill.
*   **Actions:** `+ Node`, `Fit to Screen`, `Undo`, `Test Run`.
*   **Why:** keeps focus on the center of the screen, reducing mouse travel.

---

## 7. Onboarding & The "Zero State"

### 7.1 Creating a Workflow
*   **Trigger:** "New Workflow" from Dashboard.
*   **The Blueprint Modal:** A high-fidelity dialog offering:
    1.  **Blank Blueprint:** Start from scratch.
    2.  **AI Architect:** "Describe your goal..." (Chat-to-Graph).
    3.  **Recipes:** "E-commerce Clean", "Social Vibe", "Watermark Removal".

### 7.2 The AI Architect (Co-Pilot)
*   **Location:** Right Panel (Collapsible).
*   **Interaction:**
    *   User: "I need to process 500 images, crop them to 4:5, and add a logo."
    *   AI: *Animates nodes appearing on the canvas.*
    *   **Ghost Nodes:** Nodes appear as dashed outlines first, then "solidify" as they are configured.

### 7.3 The Empty Canvas State
*   **Visual (Theme Aware):**
    *   **Reuse Component:** `<BackgroundGrid />` (from Dashboard).
    *   *Light Mode:* `#F4F4F0` Paper with subtle `neutral-300` dots.
    *   *Dark Mode:* `#111111` Black with subtle `neutral-800` dots.
*   **The "Ghost Module":**
    *   A central, dashed-outline box pulsing slowly.
    *   **Label:** "Drop Trigger Here" or "Ask AI to Build".
    *   **Interaction:** Dragging a node near it snaps it into this slot.

---

## 8. Advanced Mechanics (The Pro Layer)

### 8.1 Graph Hygiene (Grouping)
*   **Feature:** **"Frames"** (Physical Trays).
*   **Action:** Select multiple nodes -> Right Click -> "Group".
*   **Visual:** A labeled container (border only) wraps the nodes. Moves as one unit.

### 8.2 Connector Authentication (The Auth Card)
*   **Scenario:** Adding a "Google Drive" node.
*   **State:**
    *   *Unconnected:* Red LED. "Connect Account" button on faceplate.
    *   *Action:* Opens standard OAuth popup.
    *   *Connected:* Green LED. Shows "Account: marketing@studio.com".

### 8.3 The "Flight Recorder" (Logs)
*   **Access:** "History" tab in the Right Panel.
*   **Visual:** Not just text logs. A **Timeline**.
*   **Interaction:** Clicking a past run "Replays" the state on the canvas (nodes light up in sequence). Allows debugging "Why did Batch #402 fail last Tuesday?".

### 8.4 Templates & Recipes
*   **Save as Recipe:** Select nodes -> "Save to Library".
*   **Visual:** These appear as "Composite Nodes" (Black Boxes) in the Parts Bin.

