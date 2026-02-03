# AI Survey Steward Framework

> A practical framework and starter repository for running survey analysis with AI **under human data stewardship, auditability, and governance**.

This framework is designed for workflows like:
- Google Form → Google Sheet → CSV
- Post-event / post-field / post-exam surveys
- Using LLMs (Claude, GPT, Local) **without losing control of data, metrics, or meaning**

---

## 🎯 Core Idea (TL;DR)

> **AI is allowed to analyze, but not allowed to decide what the data means.**

Humans define:
- what the data is
- what questions are valid
- what metrics exist

AI:
- executes analysis
- explains its own actions
- renders outputs for different audiences

---

## 🧩 What This Repo Gives You

- A repeatable **framework** (not just prompts)
- Clear separation of roles:
  - Data Steward (human)
  - AI Analyst (LLM)
- Built-in AI self-audit
- Persona-based reporting (Executive / Ops / Public)
- Vendor-agnostic (Claude, GPT, Local LLMs)

---

## 📁 Repository Structure

```
ai-survey-steward/
│
├─ data/
│   ├─ raw/                  # Original CSV exports (read-only)
│   ├─ processed/            # Aggregated / cleaned outputs
│   └─ README.md             # Data version & notes
│
├─ data_steward/             # Human-owned truth
│   ├─ dataset_profile.md    # What this data is / is not
│   ├─ metrics.yaml          # Allowed metrics only
│   └─ data_quality.md       # Known issues & caveats
│
├─ prompts/                  # AI instructions
│   ├─ analysis.prompt.md    # Analysis constraints
│   ├─ audit.prompt.md       # AI self-audit prompt
│   ├─ persona_exec.md       # Executive view
│   ├─ persona_ops.md        # Operations view
│   └─ persona_public.md     # Participant-facing view
│
├─ reports/
│   ├─ draft/
│   ├─ final/
│   └─ ai_data_audit.md      # Generated every run
│
├─ governance/
│   ├─ assumptions_log.md    # Human & AI assumptions
│   └─ decision_log.md       # What was decided & why
│
└─ README.md
```

---

## 🧠 Roles & Responsibilities

### 👤 Human: Data Steward
Responsible for:
- Writing `dataset_profile.md`
- Defining `metrics.yaml`
- Deciding what questions are legitimate
- Approving final reports

The Data Steward **never asks AI to "figure it out"**.

---

### 🤖 AI: Analyst & Renderer
Allowed to:
- Analyze only approved data
- Use only approved metrics
- Explain every transformation
- Render reports by persona

Required to:
- Generate `ai_data_audit.md`
- Explicitly state assumptions and blind spots

---

## 🧱 Framework Pillars

### 1. Stewarded Data
All meaning is declared **before** AI analysis.

Artifacts:
- `dataset_profile.md`
- `metrics.yaml`

---

### 2. Governed AI
AI is constrained by prompts + artifacts, not trust.

Key rule:
> If it’s not defined, AI must say "not available".

---

### 3. Persona-aware Outputs

The same insight is rendered differently:
- Executives → decisions & risks
- Operations → process improvements
- Participants → transparency & trust

No new analysis per persona.

---

### 4. Auditability

Every AI run produces:
- what it did
- what it did NOT do
- where confidence is low

Stored as:
- `reports/ai_data_audit.md`

---

## 🔄 Standard Workflow

```
1. Export CSV from Google Form
2. Place CSV in data/raw/
3. Update dataset_profile.md
4. Define metrics.yaml
5. Run AI analysis prompt
6. Generate ai_data_audit.md
7. Render persona reports
8. Review & publish
```

---

## 🚦What This Framework Prevents

- ❌ AI inventing metrics
- ❌ Prompt-overloaded analysis
- ❌ Different "truths" per audience
- ❌ Untraceable AI reasoning

---

## 🧪 How to Start (10-minute setup)

1. Clone this repo
2. Drop one CSV into `data/raw/`
3. Fill out `dataset_profile.md`
4. Pick **max 5 metrics**
5. Run your LLM using the provided prompts

That’s it.

---

## 🧭 When to Extend This

- Add MCP tools → turn into **AI Survey Brain**
- Add dbt / SQL → scale beyond CSV
- Add dashboards → consume processed data

---

## 🏷️ Philosophy

> "AI should be powerful, but never mysterious."

This repo helps teams move from:
- *using AI* → *governing AI*

---

## 📜 License & Usage

Use freely for:
- internal surveys
- research
- public sector reporting

Attribution appreciated, but not required.
