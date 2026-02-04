import { useState } from "react";

const PHASES = [
  {
    id: "collect",
    num: "01",
    title: "รวบรวม & จัดเก็บ",
    subtitle: "Collect → GitHub",
    color: "#E8F5E9",
    accent: "#2E7D32",
    icon: "📥",
    items: [
      "งานที่อยากทำ (Ideas backlog)",
      "โค้ดที่เคยทำ (Existing code)",
      "แปลงเป็น Prompt (.md)",
      "จัดหมวดหมู่ใน repo",
    ],
    structure: [
      "work-library/",
      "├── ideas/",
      "│   ├── chatbot-line.md",
      "│   └── inventory-system.md",
      "├── existing-code/",
      "│   ├── pos-system.md",
      "│   └── crm-api.md",
      "└── templates/",
      "    ├── prompt-template.md",
      "    └── project-brief.md",
    ],
  },
  {
    id: "transform",
    num: "02",
    title: "AI แปลง Prompt",
    subtitle: "AI → Project Prompts",
    color: "#E3F2FD",
    accent: "#1565C0",
    icon: "🤖",
    items: [
      "POC — ทดสอบแนวคิด",
      "MVP — ใช้งานได้จริง",
      "Test — ชุดทดสอบ",
      "Docs — เอกสารครบ",
    ],
    structure: [
      "prompts/",
      "├── chatbot-line/",
      "│   ├── poc.md    → PoC prompt",
      "│   ├── mvp.md    → MVP prompt",
      "│   ├── test.md   → Test prompt",
      "│   └── docs.md   → Docs prompt",
      "└── pos-system/",
      "    ├── poc.md",
      "    ├── mvp.md",
      "    ├── test.md",
      "    └── docs.md",
    ],
  },
  {
    id: "evolve",
    num: "03",
    title: "Fork & ต่อยอด",
    subtitle: "Fork → Improve → PR",
    color: "#FFF3E0",
    accent: "#E65100",
    icon: "🔀",
    items: [
      "Fork ไปทดลอง/ปรับแต่ง",
      "AI เก่งขึ้น → อัพเกรด Prompt",
      "อันไหนดี PR กลับ main",
      "Library โตขึ้นเรื่อยๆ",
    ],
    structure: [
      "main ──┬── fork/client-A",
      "       │   └── custom features",
      "       ├── fork/experiment-v2",
      "       │   └── upgraded prompts",
      "       └── fork/new-ai-model",
      "           └── re-optimized",
      "",
      "✅ Good fork → PR back to main",
      "🔒 ลูกค้า stays on their version",
    ],
  },
];

const BUSINESS_MODEL = [
  {
    icon: "💰",
    title: "ใช้เครดิต Claude ให้คุ้ม",
    desc: "Automate การสร้างงาน ไม่ต้องนั่งพิมพ์ prompt ใหม่ทุกครั้ง",
  },
  {
    icon: "📈",
    title: "Library โตตาม AI",
    desc: "AI เก่งขึ้นทุกเดือน → อัพเกรดงานใน library ได้ตลอด",
  },
  {
    icon: "🔐",
    title: "ควบคุม Version ลูกค้า",
    desc: "อัพเกรดได้เอง แต่ไม่จำเป็นต้องอัพเดตให้ลูกค้า",
  },
  {
    icon: "⚡",
    title: "Prompt = Asset",
    desc: "ยิ่งสะสมมาก ยิ่งทำงานเร็ว — สร้าง POC/MVP ได้ในนาที",
  },
];

export default function WorkLibrarySystem() {
  const [activePhase, setActivePhase] = useState(0);
  const [showStructure, setShowStructure] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F5",
        fontFamily: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
        padding: "2rem",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #7C3AED, #2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            W
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                margin: 0,
                background: "linear-gradient(90deg, #7C3AED, #2563EB, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em",
              }}
            >
              AI Work Library System
            </h1>
            <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>
              Prompt-driven development workflow on GitHub
            </p>
          </div>
        </div>

        {/* Business Value Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "0.75rem",
            margin: "1.5rem 0",
          }}
        >
          {BUSINESS_MODEL.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#161616",
                border: "1px solid #2A2A2A",
                borderRadius: 10,
                padding: "1rem",
                transition: "all 0.3s ease",
              }}
            >
              <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>
                {item.icon}
              </div>
              <div
                style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.25rem" }}
              >
                {item.title}
              </div>
              <div style={{ color: "#888", fontSize: "0.7rem", lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Pipeline Visual */}
        <div
          style={{
            background: "#111",
            border: "1px solid #2A2A2A",
            borderRadius: 14,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Workflow Pipeline
            </span>
            <button
              onClick={() => setShowStructure(!showStructure)}
              style={{
                background: showStructure ? "#7C3AED" : "#222",
                border: "1px solid #444",
                color: "#fff",
                padding: "0.3rem 0.75rem",
                borderRadius: 6,
                fontSize: "0.7rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showStructure ? "◉ File Structure" : "○ File Structure"}
            </button>
          </div>

          {/* Phase Selector */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}
          >
            {PHASES.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(i)}
                style={{
                  background: activePhase === i ? phase.accent + "22" : "#1A1A1A",
                  border: `2px solid ${activePhase === i ? phase.accent : "#2A2A2A"}`,
                  borderRadius: 10,
                  padding: "1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#F5F5F5",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 10,
                    fontSize: "2.5rem",
                    opacity: 0.08,
                    fontWeight: 900,
                  }}
                >
                  {phase.num}
                </div>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>
                  {phase.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                  {phase.title}
                </div>
                <div style={{ color: "#888", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                  {phase.subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Arrow Flow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.7rem",
              color: "#555",
            }}
          >
            <span style={{ color: PHASES[0].accent }}>●</span>
            <span>Collect</span>
            <span style={{ color: "#444" }}>→→→</span>
            <span style={{ color: PHASES[1].accent }}>●</span>
            <span>Transform</span>
            <span style={{ color: "#444" }}>→→→</span>
            <span style={{ color: PHASES[2].accent }}>●</span>
            <span>Evolve</span>
            <span style={{ color: "#444" }}>→→→</span>
            <span style={{ color: "#7C3AED" }}>●</span>
            <span>Repeat</span>
          </div>

          {/* Active Phase Detail */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: showStructure ? "1fr 1fr" : "1fr",
              gap: "1rem",
            }}
          >
            {/* Items */}
            <div
              style={{
                background: "#0D0D0D",
                border: `1px solid ${PHASES[activePhase].accent}44`,
                borderRadius: 10,
                padding: "1rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.65rem",
                  color: PHASES[activePhase].accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {PHASES[activePhase].title} — สิ่งที่ต้องทำ
              </div>
              {PHASES[activePhase].items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.5rem 0",
                    borderBottom:
                      i < PHASES[activePhase].items.length - 1
                        ? "1px solid #1A1A1A"
                        : "none",
                    fontSize: "0.8rem",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: PHASES[activePhase].accent + "33",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: PHASES[activePhase].accent,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* File Structure */}
            {showStructure && (
              <div
                style={{
                  background: "#0D0D0D",
                  border: "1px solid #2A2A2A",
                  borderRadius: 10,
                  padding: "1rem",
                  fontFamily: '"SF Mono", "Fira Code", monospace',
                }}
              >
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  File Structure
                </div>
                {PHASES[activePhase].structure.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.75rem",
                      color: line.includes("→") || line.includes("✅") || line.includes("🔒")
                        ? "#888"
                        : line.includes("/")
                        ? PHASES[activePhase].accent
                        : "#666",
                      lineHeight: 1.8,
                      whiteSpace: "pre",
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prompt Template Example */}
        <div
          style={{
            background: "#111",
            border: "1px solid #2A2A2A",
            borderRadius: 14,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            ตัวอย่าง Prompt Template
          </div>

          <div
            style={{
              background: "#0A0A0A",
              border: "1px solid #2A2A2A",
              borderRadius: 8,
              padding: "1rem",
              fontSize: "0.75rem",
              lineHeight: 1.8,
              color: "#CCC",
              whiteSpace: "pre-wrap",
              fontFamily: '"SF Mono", "Fira Code", monospace',
            }}
          >
            {`# 📋 Project: LINE Chatbot สำหรับร้านอาหาร
## Meta
- category: chatbot
- status: idea → poc → mvp
- ai-model: claude-sonnet-4-5

## Context
ร้านอาหารต้องการ chatbot บน LINE ที่รับออเดอร์ได้

## Requirements
- รับออเดอร์จากเมนู
- แจ้งราคารวม
- ส่งข้อมูลเข้า POS

## Prompt (POC)
สร้าง LINE chatbot prototype ที่...
[detailed prompt for AI to generate code]

## Prompt (MVP)
ต่อยอดจาก POC เพิ่ม...
[production-ready prompt]

## Output History
- v1.0: POC generated 2025-12-01
- v1.1: MVP generated 2025-12-15`}
          </div>
        </div>

        {/* Key Insight */}
        <div
          style={{
            background: "linear-gradient(135deg, #7C3AED11, #2563EB11)",
            border: "1px solid #7C3AED44",
            borderRadius: 14,
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>🧠</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              marginBottom: "0.4rem",
              background: "linear-gradient(90deg, #7C3AED, #2563EB)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Core Principle
          </div>
          <div style={{ color: "#AAA", fontSize: "0.8rem", lineHeight: 1.7, maxWidth: 600, margin: "0 auto" }}>
            Prompt เป็นทรัพย์สิน (Asset) ที่สะสมได้ —{" "}
            ยิ่ง AI เก่งขึ้น Prompt เดิมก็ให้ผลลัพธ์ดีขึ้น{" "}
            แค่เปลี่ยน model ก็อัพเกรดงานทั้ง library ได้ทันที
          </div>
        </div>

        <div style={{ textAlign: "center", color: "#333", fontSize: "0.65rem", marginTop: "1.5rem" }}>
          AI Work Library System v1.0 — built for prompt-driven development
        </div>
      </div>
    </div>
  );
}
