# Prompt Library

รวม AI Prompts, Guides และ References สำหรับงาน Development

---

## โครงสร้าง

```
prompt-library/
├── docs/                          # เอกสารหลัก
│   ├── doc-generator-prompts/     # Prompt สร้างเอกสารโปรเจกต์
│   ├── open-data-guides/          # คู่มือ Open Data ภาครัฐ
│   ├── project-plans/             # แผนปรับปรุงโปรเจกต์
│   ├── rag-guides/                # คู่มือ RAG Pipeline
│   └── workflow-guides/           # คู่มือ Git Workflow
│
└── references/                    # บันทึกอ้างอิง
    ├── chatgpt-chats/             # บทสนทนาจาก ChatGPT
    └── deepseek-chats/            # บทสนทนาจาก DeepSeek
```

---

## เอกสารหลัก (docs/)

### doc-generator-prompts/
Prompt สำหรับให้ AI สร้างเอกสารโปรเจกต์อัตโนมัติ

| ไฟล์ | ใช้เมื่อ | Output |
|------|----------|--------|
| `01-conversation-to-docs-prompt.md` | เริ่มโปรเจกต์ใหม่ ยังไม่มีโค้ด | เอกสาร 17 ไฟล์ |
| `02-codebase-to-docs-prompt.md` | มี codebase แล้ว ต้องการเอกสาร | เอกสาร 17 ไฟล์ |
| `03-codebase-to-project-prompt.md` | สรุปโปรเจกต์สำหรับ AI | PROJECT_PROMPT.md |

### open-data-guides/
คู่มือรวบรวมข้อมูลจากแหล่ง Open Data

| ไฟล์ | เนื้อหา |
|------|---------|
| `gov-data-collector-guide.md` | รวบรวมข้อมูลภาครัฐไทย (data.go.th, BOT, SEC, DBD) |
| `dede-energy-data-guide.md` | ข้อมูลพลังงานจาก พพ. (DEDE) |
| `willpower-open-data-guide.md` | Open Data Platform สำหรับสถาบันพลังจิตตานุภาพ |

### rag-guides/
คู่มือสร้างระบบ RAG (Retrieval-Augmented Generation)

| ไฟล์ | เนื้อหา |
|------|---------|
| `meeting-agent-rag-guide.md` | ระบบบันทึกการประชุม + RAG Pipeline |
| `survey-importer-rag-prompt.md` | Import Survey CSV เข้า RAG System |

### workflow-guides/
คู่มือ Workflow สำหรับ Development

| ไฟล์ | เนื้อหา |
|------|---------|
| `github-workflow-skills.md` | Claude Code Skills สำหรับ Git Workflow |

### project-plans/
แผนปรับปรุงโปรเจกต์

| ไฟล์ | เนื้อหา |
|------|---------|
| `MPT-IMPROVEMENTS.md` | แผนปรับปรุง MediaMTX Patrol Tracking |

---

## References

บันทึกบทสนทนาจาก AI ต่างๆ เก็บไว้เป็น reference

- **chatgpt-chats/** — Survey Analysis, Data Engineering Framework
- **deepseek-chats/** — Open Data, AI-Ready Government Data

---

## การใช้งาน

1. เลือก prompt/guide ที่ต้องการจากโฟลเดอร์ที่เหมาะสม
2. Copy เนื้อหาไปใช้กับ AI ที่ต้องการ (Claude, ChatGPT, Cursor, etc.)
3. ปรับแต่งตามความต้องการของโปรเจกต์

---

## License

MIT
