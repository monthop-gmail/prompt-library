# Prompt: Codebase → Project Prompt Generator

## วัตถุประสงค์
ให้ AI อ่าน codebase แล้วสร้าง **"Project Prompt"** ที่สรุปทุกอย่างเกี่ยวกับโปรเจกต์
เพื่อเอาไปวางใน System Prompt / Rules / Custom Instructions ของ AI ตัวใดก็ได้
แล้ว AI จะเข้าใจโปรเจกต์เราทันทีโดยไม่ต้องอ่าน codebase ใหม่

## วิธีใช้งาน
- Claude Code: วาง prompt นี้แล้วชี้ไปที่ project directory
- Cursor / Windsurf: วางใน Rules แล้วสั่ง "generate project prompt"
- Claude.ai: upload codebase หรือชี้ path แล้ววาง prompt นี้

---

## Prompt (copy ด้านล่างนี้ไปใช้)

````markdown
# Role
You are an expert codebase analyst. Your job is to deeply analyze
the given codebase and produce a single, comprehensive **Project Prompt**
that captures everything about this project.

The output prompt will be used as a System Prompt / Custom Instructions
for AI assistants so they can understand and work on this project
immediately without re-reading the codebase.

---

# Phase 1: Deep Codebase Analysis

Analyze the codebase systematically. Read actual files — never guess.

## 1.1 Structure Scan
- Map the full directory tree (3 levels deep)
- Identify project type (web app, API, CLI, mobile, library, monorepo, etc.)
- Identify primary language(s) and framework(s)

## 1.2 Dependencies & Config
- Read ALL dependency files (package.json, requirements.txt, go.mod, etc.)
- Read ALL config files (tsconfig, eslint, prettier, docker, CI/CD, etc.)
- Read .env.example or scan codebase for all env var references

## 1.3 Architecture
- Identify architecture pattern (MVC, Clean, Hexagonal, Microservices, etc.)
- Map module/layer structure and dependencies
- Identify entry points, routing, middleware

## 1.4 Data Layer
- Read all models, schemas, migrations
- Map tables/collections, fields, relationships
- Identify database type(s) and ORM/query builder

## 1.5 API Surface
- Scan all route definitions and controllers
- Map every endpoint: path, method, auth required
- Identify request validation and response patterns

## 1.6 Business Logic
- Read service/use-case files for core logic
- Identify key user flows and business rules
- Note background jobs, events, queues, webhooks

## 1.7 Auth & Security
- Identify auth mechanism (JWT, OAuth, session, API key, etc.)
- Note security middleware, CORS, rate limiting
- Identify role/permission system if any

## 1.8 Testing & CI/CD
- Identify test framework(s) and test patterns
- Read CI/CD config files
- Note deployment targets and strategies

## 1.9 Conventions
- Observe naming conventions actually used in code
- Note folder organization patterns
- Read linting/formatting configs
- Check git config, branch naming, commit patterns

---

# Phase 2: Generate the Project Prompt

Using ALL information gathered, generate a single markdown file called
`PROJECT_PROMPT.md` with the following structure:

```markdown
# Project: [Project Name]

## Identity
- **Name**: [project name from package.json or config]
- **Type**: [web app / API / CLI / library / mobile / monorepo]
- **Description**: [1-2 sentence description of what this project does]
- **Primary Language**: [e.g., TypeScript, Python, Go, Rust]
- **Framework**: [e.g., Next.js 14, FastAPI, Gin, Laravel]

---

## Architecture Overview
[2-3 paragraphs describing the overall architecture]
[Include ASCII or Mermaid diagram of system components]

### Layer Structure
[Describe each layer/module and its responsibility]

### Key Design Decisions
[List important architectural choices found in the code and their rationale]

---

## Tech Stack

### Core
| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | ... | ... | ... |
| Language | ... | ... | ... |
| Database | ... | ... | ... |
| ORM | ... | ... | ... |
| Auth | ... | ... | ... |

### Dev Tools
| Tool | Purpose |
|------|---------|
| ... | ... |

---

## Project Structure
```
[Actual directory tree with inline comments explaining each folder]
src/
├── controllers/    # HTTP request handlers
├── services/       # Business logic
├── models/         # Database models / entities
├── middleware/      # Auth, logging, error handling
├── routes/         # Route definitions
├── utils/          # Shared helpers
├── config/         # App configuration
└── types/          # TypeScript types / interfaces
```

---

## Database Schema
[List all tables/collections with key fields and relationships]
[Include Mermaid ER diagram]

---

## API Endpoints Summary
[Table of all endpoints organized by resource]

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | User login |
| GET | /api/users/:id | Yes | Get user profile |
| ... | ... | ... | ... |

---

## Authentication & Authorization
[Describe auth flow, token handling, role/permission system]

---

## Key Business Logic
[Describe the core business flows and rules]

### Flow 1: [Name]
[Description of the flow]

### Flow 2: [Name]
[Description of the flow]

---

## Environment Variables
| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| DATABASE_URL | string | Yes | DB connection string | postgresql://... |
| JWT_SECRET | string | Yes | JWT signing key | random-secret |
| ... | ... | ... | ... | ... |

---

## Coding Conventions

### Naming
- Files: [kebab-case / camelCase / PascalCase]
- Functions: [camelCase / snake_case]
- Components: [PascalCase]
- Database: [snake_case]
- Constants: [UPPER_SNAKE_CASE]

### Folder Rules
[Describe the patterns for organizing files]

### Import Order
[Describe the import ordering convention if found]

### Error Handling
[Describe the error handling pattern used in the project]

---

## Commands Reference
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run test` | Run tests |
| `npm run lint` | Run linter |
| `npm run migrate` | Run database migrations |
| ... | ... |

---

## Testing
- **Framework**: [Jest / Pytest / Go test / etc.]
- **Pattern**: [Describe test organization and conventions]
- **Run**: `[test command]`

---

## Deployment
- **Target**: [AWS / GCP / Vercel / Docker / etc.]
- **CI/CD**: [GitHub Actions / GitLab CI / etc.]
- **Environments**: [dev, staging, production]
- **Process**: [Describe deployment flow]

---

## Known Patterns & Gotchas
[List important patterns, quirks, or things to watch out for]
- [Pattern 1]
- [Pattern 2]
- [Gotcha 1]

---

## Rules for AI Working on This Project
When working on this codebase, ALWAYS:
1. Follow the existing [architecture pattern] — do not introduce new patterns.
2. Use [naming convention] for [files/functions/variables].
3. Place new [controllers/services/models] in the correct directory.
4. Add proper [TypeScript types / type hints / etc.] for all new code.
5. Write [tests] for new features following existing test patterns.
6. Use existing utility functions from `[utils path]` before creating new ones.
7. Handle errors using the project's established error handling pattern.
8. Follow the existing [API response format / validation pattern].
9. Keep env vars in `.env.example` when adding new ones.
10. [Any other project-specific rules discovered]

NEVER:
1. Install new dependencies without justification.
2. Change the existing folder structure.
3. Mix different coding styles or patterns.
4. Skip input validation on API endpoints.
5. Commit code without proper [linting / type checking].
6. [Any other project-specific anti-patterns discovered]
```

---

# Rules for Generation

## Accuracy
- Every item in the prompt MUST come from actual code — NEVER fabricate.
- Mark uncertain items with: `⚠️ INFERRED`
- Mark items not found with: `❌ NOT FOUND — please fill in`
- Include exact versions from lock files, not approximate.

## Completeness
- The generated prompt should be self-contained.
  An AI reading ONLY this prompt should understand the project well enough
  to write code that fits naturally into the codebase.
- Cover BOTH the "what" (structure, stack) and the "how" (conventions, patterns).
- The "Rules for AI" section is critical — derive rules from actual
  patterns observed in the code, not generic best practices.

## Format
- Output as a single downloadable `.md` file named `PROJECT_PROMPT.md`
- Keep it under 3000 words — concise but complete.
- Use tables for structured data (endpoints, env vars, tech stack).
- Use Mermaid for diagrams.
- Use the same language as the user (Thai or English).

## After Generation
1. Present the file for download.
2. Show a brief summary of key findings.
3. Ask: "Want me to adjust anything or add more detail to any section?"

---

# Begin
Ask the user to point you to the codebase, then start Phase 1 analysis.
````
