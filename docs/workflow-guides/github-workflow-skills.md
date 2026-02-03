# ตัวอย่าง Claude Code Skills สำหรับ GitHub Dev Workflow

> ชุด skills สำหรับทีม dev เล็กๆ ครอบคลุม: Issue → Branch → Code → Commit → Push → PR

---

## 📁 โครงสร้างไฟล์ทั้งหมด

```
~/.claude/skills/
└── git-workflow/
    ├── SKILL.md                  ← Skill หลัก (routing + conventions)
    ├── workflows/
    │   ├── fix-issue.md          ← Command: /fix-issue #123
    │   ├── commit.md             ← Command: /commit
    │   ├── push-pr.md            ← Command: /push-pr
    │   └── commit-push-pr.md    ← Command: /commit-push-pr (รวมทุกอย่าง)
    └── context/
        ├── branch-naming.md      ← กฎตั้งชื่อ branch
        └── commit-convention.md  ← กฎเขียน commit message
```

---

## 1️⃣ SKILL.md — Skill หลัก (Reference + Router)

**ไฟล์:** `~/.claude/skills/git-workflow/SKILL.md`

```yaml
---
name: git-workflow
description: >
  Git workflow conventions and GitHub integration.
  Use when working with git branches, commits, issues, or pull requests.
  Provides branch naming, commit message format, and PR standards.
---
```

```markdown
# Git Workflow Conventions

## Branch Naming
See `context/branch-naming.md` for full rules.
Quick reference:
- `feat/<issue-number>-<short-description>`
- `fix/<issue-number>-<short-description>`
- `chore/<short-description>`

## Commit Messages
See `context/commit-convention.md` for full rules.
Format: `<type>(scope): <description>`
Types: feat, fix, docs, style, refactor, test, chore

## Available Workflows
- `/fix-issue <number>` — Pick up a GitHub issue and start working
- `/commit` — Stage and commit with conventional format
- `/push-pr` — Push branch and create PR
- `/commit-push-pr` — Do everything in one shot

## Tools Required
All workflows assume `gh` CLI is installed and authenticated.
```

**หน้าที่ของ SKILL.md:**
- Claude จะ auto-load ไฟล์นี้เมื่อเห็นบริบทเกี่ยวกับ git/GitHub
- ทำหน้าที่เป็น "สารบัญ" ชี้ไปยัง workflows และ context ต่างๆ
- ตัว description ใน frontmatter คือกุญแจที่ Claude ใช้ตัดสินใจว่าจะโหลด skill นี้หรือไม่

---

## 2️⃣ Workflow Commands (เรียกด้วย /command)

### `/fix-issue` — รับ issue มาทำ

**ไฟล์:** `~/.claude/skills/git-workflow/workflows/fix-issue.md`

```yaml
---
name: fix-issue
description: Pick up a GitHub issue, create a branch, and start working on a fix
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Read, Write, Grep, Glob
---
```

```markdown
Fix GitHub issue $ARGUMENTS following our workflow:

1. **Fetch issue details**
   Run `gh issue view $ARGUMENTS` to understand the problem

2. **Create a branch**
   Branch name format: `fix/$ARGUMENTS-<short-description>`
   Run `git checkout -b <branch-name>`

3. **Analyze the codebase**
   Search for relevant files related to the issue

4. **Implement the fix**
   - Follow existing code patterns
   - Keep changes minimal and focused

5. **Write or update tests**
   Ensure the fix is covered by tests

6. **Verify**
   Run the project's test suite and linter

Do NOT commit or push yet — let the developer review first.
```

**ใช้งาน:**
```
> /fix-issue 42
```
Claude จะ: อ่าน issue #42 → สร้าง branch `fix/42-broken-login` → เขียนโค้ดแก้ → รัน test

---

### `/commit` — Commit ตาม convention

**ไฟล์:** `~/.claude/skills/git-workflow/workflows/commit.md`

```yaml
---
name: commit
description: Stage changes and create a conventional commit
disable-model-invocation: true
allowed-tools: Bash(git *)
---
```

```markdown
Create a git commit for the current changes:

1. Run `git status` and `git diff --stat` to see what changed
2. Run `git add -A` to stage all changes
3. Analyze the changes to determine:
   - **type**: feat | fix | docs | style | refactor | test | chore
   - **scope**: the module or area affected (e.g., auth, api, ui)
   - **description**: concise summary in imperative mood, lowercase
4. Run `git commit -m "<type>(<scope>): <description>"`

Rules:
- Description must be under 72 characters
- Use imperative mood: "add feature" not "added feature"
- If changes span multiple areas, pick the most significant one for scope
- Do NOT push — only commit locally

Example output:
  feat(auth): add password reset email flow
  fix(api): handle null response from payment gateway
```

**ใช้งาน:**
```
> /commit
```
Claude จะ: ดู diff → วิเคราะห์ → สร้าง commit message → commit

---

### `/push-pr` — Push แล้วสร้าง PR

**ไฟล์:** `~/.claude/skills/git-workflow/workflows/push-pr.md`

```yaml
---
name: push-pr
description: Push current branch and create a GitHub pull request
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh *)
---
```

```markdown
Push the current branch and create a pull request:

1. **Get branch info**
   Run `git branch --show-current` to get branch name
   Run `git log --oneline main..HEAD` to see all commits

2. **Push the branch**
   Run `git push -u origin <branch-name>`

3. **Determine PR details from branch and commits**
   - Title: derived from branch name, capitalized properly
   - If branch contains an issue number (e.g., fix/42-xxx), link it

4. **Create the PR**
   ```
   gh pr create \
     --title "<title>" \
     --body "<body>" \
     --base main
   ```

5. **PR body template:**
   ```
   ## What
   <one-line summary of changes>

   ## Why
   <context or link to issue: Closes #XX>

   ## How
   <brief technical approach>

   ## Testing
   <how this was tested>
   ```

6. Print the PR URL when done
```

**ใช้งาน:**
```
> /push-pr
```
Claude จะ: push branch → สร้าง PR พร้อม description ครบถ้วน → แสดง URL

---

### `/commit-push-pr` — ทำทุกอย่างรวด

**ไฟล์:** `~/.claude/skills/git-workflow/workflows/commit-push-pr.md`

```yaml
---
name: commit-push-pr
description: Commit all changes, push, and create a PR in one shot
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh *)
---
```

```markdown
Do everything in sequence — commit, push, and create a PR:

1. Run `git status` to check for changes
2. Run `git add -A`
3. Analyze changes and create a conventional commit
   (follow rules in context/commit-convention.md)
4. Run `git push -u origin $(git branch --show-current)`
5. Create a PR with `gh pr create` using the template format
   (see /push-pr workflow for PR body template)

You MUST do all steps in a single response.
Do not stop to ask for confirmation between steps.

If there are no changes to commit, inform the user and stop.
```

**ใช้งาน:**
```
> /commit-push-pr
```
ครบจบในคำสั่งเดียว — เหมาะกับ quick fixes

---

## 3️⃣ Context Files (ไฟล์อ้างอิง ไม่ใช่ command)

### Branch Naming Rules

**ไฟล์:** `~/.claude/skills/git-workflow/context/branch-naming.md`

```markdown
# Branch Naming Convention

Format: `<type>/<issue-number>-<short-description>`

| Type     | Use when...                      | Example                        |
|----------|----------------------------------|--------------------------------|
| feat     | Adding new functionality         | feat/15-user-avatar            |
| fix      | Fixing a bug                     | fix/42-login-redirect          |
| chore    | Maintenance, deps, config        | chore/update-eslint            |
| docs     | Documentation only               | docs/23-api-readme             |
| refactor | Restructuring without new feature| refactor/12-split-auth-module  |

Rules:
- Always lowercase
- Use hyphens, not underscores
- Keep description to 3-4 words max
- Include issue number when one exists
```

### Commit Convention

**ไฟล์:** `~/.claude/skills/git-workflow/context/commit-convention.md`

```markdown
# Commit Message Convention (Conventional Commits)

Format: `<type>(<scope>): <description>`

## Types
- feat     → new feature (triggers minor version bump)
- fix      → bug fix (triggers patch version bump)
- docs     → documentation only
- style    → formatting, no code change
- refactor → code restructuring, no behavior change
- test     → adding or fixing tests
- chore    → build, CI, deps, config

## Scope
The module or area: auth, api, ui, db, config, ci

## Rules
- Imperative mood: "add" not "added" or "adds"
- Lowercase everything
- No period at the end
- Under 72 characters total
- One commit = one logical change

## Examples
  feat(auth): add google oauth login
  fix(api): return 404 instead of 500 for missing user
  docs(readme): add local development setup guide
  test(cart): add edge case for empty cart checkout
  chore(deps): bump express from 4.18 to 4.21
```

---

## 🔑 สรุปความสัมพันธ์

```
┌─────────────────────────────────────────────────────┐
│  SKILL.md (git-workflow)                            │
│  ├─ Role: Reference + Router                        │
│  ├─ Claude auto-loads: ✅ (เมื่อเจอบริบท git/GitHub)│
│  ├─ User invokes /git-workflow: ✅                   │
│  │                                                   │
│  ├─ workflows/ (Commands = leaf nodes)               │
│  │   ├─ /fix-issue    → ผู้ใช้เรียกเอง              │
│  │   ├─ /commit       → ผู้ใช้เรียกเอง              │
│  │   ├─ /push-pr      → ผู้ใช้เรียกเอง              │
│  │   └─ /commit-push-pr → ผู้ใช้เรียกเอง            │
│  │                                                   │
│  └─ context/ (ไม่ใช่ command, เป็นความรู้ประกอบ)     │
│      ├─ branch-naming.md    → Claude อ่านเมื่อต้องใช้│
│      └─ commit-convention.md → Claude อ่านเมื่อต้องใช้│
└─────────────────────────────────────────────────────┘
```

### Command vs Skill ในตัวอย่างนี้

| | Skill (SKILL.md) | Command (workflows/*.md) | Context (context/*.md) |
|---|---|---|---|
| **เรียกด้วย /** | ได้ (`/git-workflow`) | ได้ (`/commit`, `/fix-issue`) | ไม่ได้ |
| **Claude เรียกเอง** | ✅ ตาม description | ❌ (`disable-model-invocation`) | ถูกอ้างอิงจาก SKILL.md |
| **มี side effects** | ไม่ (แค่ให้ข้อมูล) | ใช่ (commit, push, create PR) | ไม่ |
| **หน้าที่** | สารบัญ + conventions | ขั้นตอนปฏิบัติ | ความรู้ประกอบ |

---

## 💡 เคล็ดลับ

1. **ใส่ `disable-model-invocation: true`** กับ command ที่มี side effect (commit, push, deploy)
   ไม่งั้น Claude อาจตัดสินใจ commit/push ให้เองโดยไม่ได้ถาม

2. **ใช้ `$ARGUMENTS`** เพื่อรับ parameter — เช่น `/fix-issue 42`

3. **ใช้ `!command` syntax** เพื่อ inject ข้อมูลจริงเข้า prompt ก่อนส่งให้ Claude:
   ```yaml
   PR diff: !`gh pr diff`
   ```
   Claude จะเห็น diff จริง ไม่ใช่คำสั่ง

4. **`context/` เป็นโฟลเดอร์สำคัญ** — เก็บ "ความรู้" ที่ไม่ใช่ command
   Claude จะอ่านเมื่อ SKILL.md อ้างอิงถึง ช่วยให้ context window ไม่บวม

5. **เริ่มจากน้อย** — ทีมเล็กอาจใช้แค่ `/commit` กับ `/push-pr` ก็พอ
   เพิ่มเมื่อรู้สึกว่าทำอะไรซ้ำๆ บ่อย
