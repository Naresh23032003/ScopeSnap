# ScopeSnap Viral Launch Playbook

This playbook contains ready-to-publish launch copy for **ScopeSnap** across Reddit (`r/freelance` and `r/SideProject`), LinkedIn, and short-form video platforms (Instagram Reels, YouTube Shorts, TikTok) using the built-in **Reel Studio Mode (`Cmd/Ctrl + K`)**.

---

## 1. Reddit Launch Drafts

### Post A: `r/freelance` (Value-First / Anti-Scope-Creep Angle)

**Title:** I built a free tool that scans messy client notes for "scope creep traps" and turns them into an ironclad SOW + milestone quote in 0.3 seconds

**Body:**
Almost every bad freelance project I have ever worked on started the exact same way:

The client sends a chaotic Slack message or 10-minute voice note full of phrases like:
- *"It is a super simple dashboard"*
- *"Just hook up Stripe and team permissions, should only take a few hours"*
- *"Something similar to Uber/Airbnb"*
- *"We need unlimited revisions until the board is happy"*

If you spend 3 hours writing a detailed Statement of Work (SOW), half the time they ghost on price. If you send a quick ballpark number without explicit exclusions, they hold you hostage to every vague feature they hinted at on the discovery call.

So I built **ScopeSnap** to automate the defensive part of scoping:

1. **Real-Time Vague Phrase Scanner**: As you paste the client's email or call transcript, it immediately flags 10 categories of scope-creep trigger words (`"simple"`, `"ASAP"`, `"etc."`, `"unlimited"`, `"maybe later"`) so you see the landmines before quoting.
2. **Instant Phased Milestone Matrix**: Uses Groq's LPU (`llama-3.3-70b-versatile`) to break the chaos into 3 structured engineering phases (Architecture, Core Build, QA/Launch) with hour steppers and complexity tags in ~0.34 seconds.
3. **Ironclad Out-of-Scope Shield**: Automatically writes 5-6 explicit exclusions based on the ambiguities in the client's notes (e.g., *"Native iOS/Android apps excluded; responsive web only"*, *"Max 2 consolidated revision rounds included"*).
4. **Live Rate & Risk Buffer Dials**: Slide your hourly rate (`$25-$250/hr` or `₹1,500-₹15,000/hr`), add a `+15%` or `+35%` rush buffer, and pick `50/50` or `40/30/30` splits with zero-latency recalculation.
5. **180-Degree Flip to Printable Swiss Contract**: Flip the dark studio view over into a clean `#FAF9F6` editorial contract ready to save as a PDF, or copy a pre-written client reply email with discovery questions.

It works 100% out of the box in Demo Mode (with 4 realistic client chaos presets you can click to test), and you can drop in your own free Groq API key in the top bar (stored only in your browser `localStorage`).

Repo & Live Source: `https://github.com/Naresh23032003/ScopeSnap`

Would love feedback from other freelancers and agency folks: what are the most dangerous phrases clients have used to sneak unpaid work into your projects? I will add them to the regex scanner catalog.

---

### Post B: `r/SideProject` (Technical Architecture & Spatial UI Angle)

**Title:** Built a 60fps Spatial 3D Statement-of-Work generator in Next.js 15 + Groq LPU (0.34s inference, zero WebGL dependencies)

**Body:**
Hey `r/SideProject`,

I wanted to build a B2B micro-SaaS for freelancers and dev agencies that did not look like another generic purple-gradient AI template wrapper.

Meet **ScopeSnap**: an app-first spatial command studio that converts messy client Slack dumps and call notes into a structured Statement of Work (SOW), interactive pricing matrix, out-of-scope shield, and printable PDF contract in ~340ms.

**What is under the hood:**
- **Tactile Obsidian Surface System**: 4-layer carbon depth palette (`#07080A`, `#0D0F14`, `#13161E`) paired with `Space Grotesk`, `Plus Jakarta Sans`, and `JetBrains Mono` (`tabular-nums` on every price and hour counter so numbers never jitter when dragging sliders).
- **Zero-Dependency `<LpuCore3D />` Canvas Gyroscope**: Instead of shipping a 3MB Three.js/Spline bundle, I wrote a <3KB HTML5 2D `<canvas>` wireframe icosahedron (12 vertices, 30 edges) using 3D Euler rotation matrix math and perspective projection. It idles at 60fps in emerald, pulses amber when you type vague client words, and accelerates 8x into a cyan hyper-spin with a 3D shockwave ring when Groq streams back the JSON.
- **`<SpatialCard3D />` & 180-Degree Tablet Flip**: Built with `framer-motion` spring physics (`stiffness: 260, damping: 22`), cursor-tracking specular glare, and `translateZ(20px)` floating KPI metrics. Clicking **Client Paper SOW Preview** executes a 3D Y-axis tablet flip (`perspective: 1600px`) to reveal a Swiss-editorial printable contract on the back.
- **Built-in "Reel Studio Mode" (`Cmd + K`)**: Collapses the workspace into a 9:16 vertical frame with automatic 3D camera sweep and simulated live typing so builders can record product demos straight from the browser.
- **Groq `llama-3.3-70b-versatile` + Zod Validation**: Strict JSON schema validation with a resilient 320ms offline fallback so anyone cloning the repo can test every feature before adding an API key.

Check out the code or spin it up locally (`npm install && npm run dev`):
GitHub: `https://github.com/Naresh23032003/ScopeSnap`

Let me know what you think of the spatial 3D physics and print-to-PDF workflow!

---

## 2. LinkedIn Founder Carousel Outline (8 Slides)

- **Slide 1 (Cover Hook)**:
  - *Headline*: How to turn 3 messy client voice notes into an $18,500 Statement of Work in 0.34 seconds.
  - *Subhead*: Stop losing agency margin to "quick tweaks" and unpaid scope creep.
  - *Visual*: High-contrast screenshot of ScopeSnap Studio Dark View with the emerald `<LpuCore3D />` orb.
- **Slide 2 (The Problem)**:
  - *Headline*: The $10,000 Word: "Simple"
  - *Copy*: When a client says *"We just need a simple dashboard, etc."*, that single *"etc."* hides 40 hours of unbilled RBAC, edge cases, and revisions.
- **Slide 3 (Step 1: Automatic Trap Detection)**:
  - *Headline*: Scan Client Notes for Landmines Before You Quote
  - *Copy*: ScopeSnap runs a real-time regex scanner across raw call notes, highlighting vague triggers (`"ASAP"`, `"similar to Uber"`, `"unlimited revisions"`) as floating 3D warning chips.
- **Slide 4 (Step 2: 0.34s Structured Decomposition via Groq LPU)**:
  - *Headline*: Raw Chaos In -> 3-Phase Engineering Matrix Out
  - *Copy*: Powered by `llama-3.3-70b-versatile` on Groq LPU, ScopeSnap generates itemized deliverables across Architecture, Core Build, and QA in 340ms.
- **Slide 5 (Step 3: Live Calibration Without Re-Running AI)**:
  - *Headline*: Dial In Your Margin in Real Time
  - *Copy*: Drag your hourly rate slider, switch between Lean (`1.0x`), Guarded (`+15%`), or Rush (`+35%`) buffers, and toggle individual deliverables on or off.
- **Slide 6 (Step 4: The Ironclad Out-of-Scope Shield)**:
  - *Headline*: Protect Your Weekends With Explicit Exclusions
  - *Copy*: Every proposal includes a red-accented Out-of-Scope Shield that explicitly defines what is *not* included, plus pre-kickoff discovery questions.
- **Slide 7 (Step 5: 3D Flip to Swiss Paper SOW)**:
  - *Headline*: From Dark Engineering Studio to Executive PDF Contract
  - *Copy*: Flip the workspace 180 degrees in 3D space to reveal a clean `#FAF9F6` Swiss-editorial contract with payment tranches and dual signature blocks.
- **Slide 8 (CTA)**:
  - *Headline*: Open-Source & Ready to Deploy
  - *Copy*: Clone the repo, bring your free Groq API key, and lock down your next client quote in under 60 seconds. Link in the first comment (`github.com/Naresh23032003/ScopeSnap`).

---

## 3. Five Short-Form Video Scripts (Instagram Reels / YouTube Shorts / TikTok)

> **How to Record**: Press `Cmd + K` (or `Ctrl + K`) inside ScopeSnap to open **Reel Studio Mode**. Edit the top hook banner, toggle **3D Camera Sweep ON**, and click **Simulate Live Typing**.

### Script 1: "The $2,000 AI Wrapper Founder" (30 Seconds)
- **Top Hook Banner**: `Founder asked for a "simple AI SaaS + mobile app" for $2k. Watch this:`
- **0:00 - 0:05 (Visual)**: In Reel Studio Mode, click **AI SaaS MVP** preset and trigger **Simulate Live Typing**.
- **Voiceover**: "A founder just DM'd me asking for a 'quick AI SaaS with Pinecone, Stripe, and maybe mobile apps later' on a tiny budget."
- **0:05 - 0:12 (Visual)**: Zoom in on the floating crimson/amber **Scope Creep Trap Chips** (`"quick"`, `"just hook up"`, `"unlimited"`, `"maybe later"`).
- **Voiceover**: "Watch ScopeSnap flag 4 scope creep traps in real time before I even write a quote."
- **0:12 - 0:20 (Visual)**: Press `Cmd + Enter` (`Snap Scope`). The `<LpuCore3D />` gyroscope spins 8x in cyan and snaps the 3-Phase Milestone Matrix into place in `0.34s`.
- **Voiceover**: "I hit Command-Enter. In 0.34 seconds on Groq LPU, it breaks the build into 3 phases, 178 engineering hours, and an Out-of-Scope Shield excluding native mobile apps."
- **0:20 - 0:30 (Visual)**: Click **Client Paper SOW Preview** to trigger the 180-degree 3D tablet flip into the `#FAF9F6` Swiss contract.
- **Voiceover**: "Flip the slate 180 degrees, export the Swiss PDF contract, and send the reply email. Link in bio."

### Script 2: "Never Let a Client Write 'etc.' in a Contract" (25 Seconds)
- **Top Hook Banner**: `Why the word "etc." costs freelancers $5,000+ per project:`
- **0:00 - 0:06 (Visual)**: Select **E-Commerce Rebuild Dump** preset. Hover over the `"etc."` and `"similar to Uber/Airbnb"` 3D warning chips.
- **Voiceover**: "If a client writes 'etc.' in their project brief and you don't counter it, they own your weekends."
- **0:06 - 0:16 (Visual)**: Trigger `Snap Scope` and scroll to the red **Ironclad Out-of-Scope Shield**. Add a custom guardrail and toggle exclusions.
- **Voiceover**: "ScopeSnap scans messy Slack dumps and automatically generates an Ironclad Out-of-Scope Shield that caps revisions at 2 rounds and excludes unbilled ERP work."
- **0:16 - 0:25 (Visual)**: Toggle the **3D Stack Overview** pill so the 3 milestone phases fan out in isometric 3D space.
- **Voiceover**: "Every phase is itemized in 3D space and ready to print to PDF in under half a second."

### Script 3: "How to Handle the 'Can We Just Squeeze This In?' Email" (30 Seconds)
- **Top Hook Banner**: `Client tried to sneak 4 free features into Phase 1:`
- **0:00 - 0:07 (Visual)**: Click Preset 4 (**Scope Creep Follow-up Email**).
- **Voiceover**: "We've all gotten this email: 'Hey, before we sign, can we quickly squeeze in social logins, RBAC, 2FA, and CSV audit logs? Should be trivial!'"
- **0:07 - 0:18 (Visual)**: Hit `Snap Scope`, then drag the **Risk Buffer** segmented control from `1.0x` to `+35% Ironclad` and watch Total Investment jump live with tabular-nums precision.
- **Voiceover**: "Instead of arguing, I run their email through ScopeSnap, apply a 35% rush buffer, and let them check or uncheck each feature themselves."
- **0:18 - 0:30 (Visual)**: Click **Copy Client Reply Email** on the Amber Red Flags card.
- **Voiceover**: "One click copies a polite, high-status reply email with the updated quote. Zero drama."

### Script 4: "Zero-Dependency 3D UI in Next.js (No Three.js Bloating)" (28 Seconds)
- **Top Hook Banner**: `Building a 60fps Spatial 3D UI in Next.js without Three.js:`
- **0:00 - 0:08 (Visual)**: Move cursor across the 4 **Executive KPI Ribbon** `<SpatialCard3D />` cards, showing the specular emerald glare and `translateZ(20px)` floating numbers.
- **Voiceover**: "Most 3D web apps ship 3 megabytes of WebGL that tank page speed. Here is how ScopeSnap runs at 60fps with zero 3D libraries."
- **0:08 - 0:18 (Visual)**: Click through the `idle`, `typing`, and `streaming` states on the `<LpuCore3D />` gyroscope panel.
- **Voiceover**: "The LPU gyroscope is pure HTML5 2D canvas math projecting a 12-vertex icosahedron with Euler rotation matrices in under 3 kilobytes."
- **0:18 - 0:28 (Visual)**: Toggle the 180-degree **Client Paper SOW Preview** flip back and forth.
- **Voiceover**: "Combine that with Framer Motion spring physics and a 1600-pixel perspective stage, and you get hardware-grade tactility."

### Script 5: "Quote in USD, INR, EUR, or GBP in 1 Click" (22 Seconds)
- **Top Hook Banner**: `Client asked for a quote in 5 mins. Watch this:`
- **0:00 - 0:07 (Visual)**: Click Preset 3 (**Urgent Landing Page + Branding**) and hit `Cmd + Enter`.
- **Voiceover**: "Agency rush request: 'Need a new landing page, Spline 3D assets, and brand refresh by Friday ASAP.'"
- **0:07 - 0:15 (Visual)**: Switch currency in the top bar from `$ USD` to `₹ INR` to `€ EUR` to `£ GBP` while dragging the Base Hourly Rate slider and unchecking an optional deliverable.
- **Voiceover**: "Switch between USD, INR, EUR, and GBP, slide your hourly rate, uncheck optional deliverables, and watch the 40/30/30 payment tranches update with zero penny drift."
- **0:15 - 0:22 (Visual)**: Flip to Paper SOW and click **Download / Print PDF**.
- **Voiceover**: "Print to a clean Swiss PDF contract and close the deal before your coffee cools."

