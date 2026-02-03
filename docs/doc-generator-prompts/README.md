# 🤖 AI Project Documentation Prompts Collection

ชุด Prompt 3 ตัว สำหรับให้ AI สร้างเอกสารโปรเจกต์ให้อัตโนมัติ

---

## 📋 สารบัญ

| # | ไฟล์ | ใช้เมื่อไหร่ | Input | Output |
|---|------|-------------|-------|--------|
| 1 | `01-conversation-to-docs-prompt.md` | เริ่มโปรเจกต์ใหม่ ยังไม่มีโค้ด | คุยถาม-ตอบกับ AI | เอกสาร 17 ไฟล์ |
| 2 | `02-codebase-to-docs-prompt.md` | มี codebase แล้ว ต้องการเอกสาร | AI อ่าน codebase | เอกสาร 17 ไฟล์ |
| 3 | `03-codebase-to-project-prompt.md` | มี codebase แล้ว ต้องการ prompt สรุปโปรเจกต์ | AI อ่าน codebase | PROJECT_PROMPT.md 1 ไฟล์ |

---

## 🚀 วิธีใช้งาน

### Prompt 1: คุยถาม-ตอบ → เอกสาร
เหมาะกับโปรเจกต์ใหม่ AI จะถามข้อมูลทีละรอบ แล้วสร้างเอกสารให้ทีละไฟล์

```
1. Copy เนื้อหาจาก 01-conversation-to-docs-prompt.md
2. วางใน System Prompt หรือ Chat ของ AI
3. AI จะเริ่มถามคำถาม → ตอบไปเรื่อยๆ
4. พอข้อมูลครบ AI จะสร้างเอกสารทีละไฟล์ให้ download
```

### Prompt 2: Codebase → เอกสาร
เหมาะกับโปรเจกต์ที่มีโค้ดแล้วแต่ไม่มีเอกสาร

```
1. Copy เนื้อหาจาก 02-codebase-to-docs-prompt.md
2. วางใน System Prompt แล้วชี้ไปที่ codebase
3. AI จะวิเคราะห์โค้ดทั้งหมด → สรุปให้ confirm
4. สร้างเอกสาร 17 ไฟล์ พร้อม ZIP ให้ download
```

### Prompt 3: Codebase → Project Prompt
เหมาะกับการสร้าง prompt ที่สรุปโปรเจกต์ เอาไปวางให้ AI ตัวอื่นเข้าใจทันที

```
1. Copy เนื้อหาจาก 03-codebase-to-project-prompt.md
2. วางใน System Prompt แล้วชี้ไปที่ codebase
3. AI จะวิเคราะห์โค้ด → สร้าง PROJECT_PROMPT.md
4. เอา PROJECT_PROMPT.md ไปวางใน AI ตัวไหนก็ได้
```

---

## 📁 เอกสารที่จะได้ (Prompt 1 & 2)

```
project-name/
├── README.md
└── docs/
    ├── 01-PROJECT_BRIEF.md
    ├── 02-PRD.md
    ├── 03-REQUIREMENTS.md
    ├── 04-SYSTEM_ARCHITECTURE.md
    ├── 05-SOFTWARE_ARCHITECTURE.md
    ├── 06-TECH_STACK.md
    ├── 07-DATABASE_SCHEMA.md
    ├── 08-API_SPECIFICATION.md
    ├── 09-FLOWCHARTS.md
    ├── 10-SETUP_AND_INSTALLATION.md
    ├── 11-ENVIRONMENT_VARIABLES.md
    ├── 12-CODING_STANDARDS.md
    ├── 13-TESTING_PLAN.md
    ├── 14-DEPLOYMENT_GUIDE.md
    ├── 15-SECURITY.md
    └── 16-CHANGELOG.md
```

---

## 🛠️ ใช้ได้กับ AI ตัวไหนบ้าง

- ✅ Claude (claude.ai / Claude Code / Claude API)
- ✅ ChatGPT (System Prompt / Custom Instructions)
- ✅ Cursor / Windsurf / Cline (Rules / System Prompt)
- ✅ GitHub Copilot Chat
- ✅ AI อื่นๆ ที่รับ System Prompt ได้

---

## 💡 Tips

- ใช้ **Prompt 3** ก่อน เพื่อสร้าง project prompt
  แล้วเอา output ไปวางใน Rules ของ IDE เช่น Cursor, Windsurf
  จากนั้น AI จะเข้าใจโปรเจกต์เราตลอดทุกครั้งที่เปิด chat ใหม่

- ใช้ **Prompt 2** เมื่อต้องการ onboard คนใหม่เข้าทีม
  สร้างเอกสารครบชุดแล้วเก็บไว้ใน repo

- ใช้ **Prompt 1** ตอนเริ่มโปรเจกต์ใหม่
  ให้ AI ช่วยคิดและวางแผนก่อนเขียนโค้ด
