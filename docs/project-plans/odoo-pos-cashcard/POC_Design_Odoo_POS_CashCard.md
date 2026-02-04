# 📋 POC: ระบบ Odoo POS + Cash Card สำหรับโรงอาหารโรงพยาบาล

| รายการ | รายละเอียด |
|---|---|
| **โครงการ** | POC ระบบ Cash Card สำหรับโรงอาหารโรงพยาบาล |
| **ระบบ** | Odoo 17/18 + POS + Custom Cash Card Module |
| **เวอร์ชันเอกสาร** | 1.0 |
| **วันที่** | 2026-02-04 |

---

## สารบัญ

1. [ภาพรวมของระบบ](#1-ภาพรวมของระบบ)
2. [องค์ประกอบหลัก](#2-องค์ประกอบหลัก)
3. [Odoo Module ที่เกี่ยวข้อง](#3-odoo-module-ที่เกี่ยวข้อง)
4. [Data Model](#4-data-model)
5. [Flow หลัก](#5-flow-หลัก)
6. [การตั้งค่า POS สำหรับหลายร้านค้า](#6-การตั้งค่า-pos-สำหรับหลายร้านค้า)
7. [สิ่งที่ต้อง Customize](#7-สิ่งที่ต้อง-customize)
8. [Accounting Flow](#8-accounting-flow)
9. [Hardware ที่แนะนำสำหรับ POC](#9-hardware-ที่แนะนำสำหรับ-poc)
10. [ขั้นตอนทำ POC](#10-ขั้นตอนทำ-poc)
11. [ตัวอย่าง Prompt สำหรับพัฒนา Module](#11-ตัวอย่าง-prompt-สำหรับพัฒนา-module)

---

## 1. ภาพรวมของระบบ

ระบบนี้ต้องการให้ **พนักงาน/ผู้ใช้บริการโรงพยาบาล** สามารถใช้ **บัตร Cash Card** (บัตรเติมเงิน) ชำระค่าอาหารที่ **ร้านค้าหลายร้าน** ภายในโรงอาหารของโรงพยาบาล โดยใช้ Odoo POS เป็น backend หลัก

```
┌─────────────────────────────────────────────────────┐
│                  โรงอาหารโรงพยาบาล                    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ร้านก๋วยเตี๋ยว│  │ร้านข้าวแกง │  │ร้านเครื่องดื่ม│           │
│  │  [POS]   │  │  [POS]   │  │  [POS]   │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │              │              │                │
│       └──────────────┼──────────────┘                │
│                      │                               │
│              ┌───────▼───────┐                       │
│              │  Odoo Server  │                       │
│              │  Cash Card DB │                       │
│              └───────┬───────┘                       │
│                      │                               │
│              ┌───────▼───────┐                       │
│              │ จุดเติมเงิน     │                       │
│              │  (Top-up)     │                       │
│              └───────────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## 2. องค์ประกอบหลัก

### 2.1 Cash Card System

- บัตรเติมเงินแบบ prepaid (RFID / NFC / Barcode / QR)
- มีระบบ **เติมเงิน (Top-up)** ที่จุดบริการกลาง
- มี **ยอดคงเหลือ (Balance)** เก็บใน Odoo (ไม่เก็บในบัตร เพื่อความปลอดภัย)
- ผูกกับ **Partner (Contact)** ใน Odoo เช่น พนักงาน, แพทย์, ผู้มาติดต่อ

### 2.2 POS (Point of Sale) — แต่ละร้านค้า

- แต่ละร้านค้าในโรงอาหารมี **POS Session** ของตัวเอง
- ร้านค้าแต่ละร้านมี **เมนูสินค้า/อาหาร** ของตัวเอง
- รองรับการ **สแกนบัตร → ตัดยอด → ออกใบเสร็จ**

### 2.3 ระบบรายงาน

- รายงานยอดขายแยกตามร้านค้า
- รายงานการเติมเงินและการใช้จ่ายของแต่ละบัตร
- รายงานยอดคงเหลือรวมของระบบ

---

## 3. Odoo Module ที่เกี่ยวข้อง

| Module | หน้าที่ |
|---|---|
| **Point of Sale (POS)** | หน้าร้านขายอาหารแต่ละร้าน |
| **Contacts** | เก็บข้อมูลผู้ถือบัตร |
| **Accounting** | บัญชี, Journal สำหรับ Cash Card |
| **Custom Module: Cash Card** | จัดการบัตร, ยอดเงิน, เติมเงิน, ตัดเงิน |

---

## 4. Data Model

### 4.1 cashcard.card — ข้อมูลบัตร

```
cashcard.card
├── card_number    (Char)              — รหัสบัตร / RFID UID
├── partner_id     (Many2one → res.partner) — เจ้าของบัตร
├── balance        (Float)             — ยอดเงินคงเหลือ
├── state          (Selection)         — [draft, active, blocked, expired]
├── issue_date     (Date)              — วันที่ออกบัตร
└── expiry_date    (Date)              — วันหมดอายุ
```

### 4.2 cashcard.topup — การเติมเงิน

```
cashcard.topup
├── card_id        (Many2one → cashcard.card)
├── amount         (Float)             — จำนวนเงินที่เติม
├── payment_method (Selection)         — [cash, transfer, qr]
├── topup_date     (Datetime)          — วันเวลาที่เติม
└── user_id        (Many2one → res.users) — พนักงานเติมเงิน
```

### 4.3 cashcard.transaction — ประวัติธุรกรรม

```
cashcard.transaction
├── card_id           (Many2one → cashcard.card)
├── pos_order_id      (Many2one → pos.order)
├── amount            (Float)          — จำนวนเงิน
├── transaction_type  (Selection)      — [topup, payment, refund]
└── transaction_date  (Datetime)       — วันเวลาธุรกรรม
```

### 4.4 ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│ res.partner  │1     *│  cashcard.card   │1     *│cashcard.topup│
│──────────────│───────│──────────────────│───────│──────────────│
│ name         │       │ card_number      │       │ amount       │
│ phone        │       │ balance          │       │ payment_method│
│ email        │       │ state            │       │ topup_date   │
└──────────────┘       │ issue_date       │       │ user_id      │
                       │ expiry_date      │       └──────────────┘
                       └────────┬─────────┘
                                │ 1
                                │
                                │ *
                       ┌────────┴─────────┐       ┌──────────────┐
                       │cashcard.transaction│      │  pos.order   │
                       │──────────────────│1     *│──────────────│
                       │ amount           │───────│ name         │
                       │ transaction_type │       │ amount_total │
                       │ transaction_date │       │ session_id   │
                       └──────────────────┘       └──────────────┘
```

---

## 5. Flow หลัก

### 5.1 การเติมเงิน (Top-up Flow)

```
ผู้ใช้มาที่จุดเติมเงิน
  │
  ▼
พนักงานสแกนบัตร
  │
  ▼
ระบบแสดงข้อมูลบัตร + ยอดคงเหลือ
  │
  ▼
พนักงานกรอกจำนวนเงินที่จะเติม
  │
  ▼
รับเงินสด / โอน
  │
  ▼
ยืนยัน → Balance เพิ่ม
  │
  ▼
บันทึก cashcard.topup + cashcard.transaction
  │
  ▼
สร้าง Journal Entry (Dr. เงินสด / Cr. Cash Card Liability)
```

### 5.2 การชำระเงินที่ร้านค้า (Payment Flow)

```
ลูกค้าสั่งอาหารที่ร้าน
  │
  ▼
พนักงานร้านกดรายการใน POS
  │
  ▼
ลูกค้าสแกนบัตร Cash Card
  │
  ▼
POS ตรวจสอบยอดคงเหลือ
  │
  ├─── ยอดเพียงพอ ──────────────────┐
  │                                  ▼
  │                        ตัดเงินจากบัตร
  │                                  │
  │                                  ▼
  │                        สร้าง POS Order
  │                                  │
  │                                  ▼
  │                        พิมพ์ใบเสร็จ
  │                        (แสดงยอดคงเหลือหลังหัก)
  │
  └─── ยอดไม่เพียงพอ ───────────────┐
                                     ▼
                           แจ้งเตือน "ยอดเงินไม่เพียงพอ"
                                     │
                                     ▼
                           ทางเลือก: เติมเงิน / ชำระส่วนต่างด้วยเงินสด
```

---

## 6. การตั้งค่า POS สำหรับหลายร้านค้า

แต่ละร้านค้าในโรงอาหารควรตั้งค่าดังนี้:

### 6.1 POS Config แยกแต่ละร้าน

| POS Config | ชื่อร้าน | Product Category |
|---|---|---|
| POS-SHOP-01 | ร้านก๋วยเตี๋ยว | Noodles |
| POS-SHOP-02 | ร้านข้าวแกง | Rice & Curry |
| POS-SHOP-03 | ร้านเครื่องดื่ม | Beverages |

### 6.2 การตั้งค่าร่วม

- ทุกร้านใช้ **Payment Method: Cash Card** ร่วมกัน (custom payment method)
- ทุกร้านเชื่อมกับ **Accounting Journal** (แยกหรือรวมก็ได้ตามต้องการ)
- แต่ละร้านมี **POS Category** ของตัวเอง เพื่อแสดงเฉพาะเมนูของร้านนั้น

---

## 7. สิ่งที่ต้อง Customize

### 7.1 POS Frontend (JavaScript / OWL)

| รายการ | รายละเอียด |
|---|---|
| ปุ่ม Cash Card | เพิ่มปุ่ม "ชำระด้วย Cash Card" ใน Payment Screen |
| Popup สแกนบัตร | รับค่าจาก barcode scanner / RFID reader |
| แสดงยอดคงเหลือ | แสดงยอดก่อนยืนยันชำระ |
| ใบเสร็จ | แสดงยอดคงเหลือหลังชำระบนใบเสร็จ |

### 7.2 POS Backend (Python)

| รายการ | รายละเอียด |
|---|---|
| Payment Method | สร้าง Payment Method ชนิดใหม่ type = `cashcard` |
| Override pos.order | ตัดยอดจากบัตรเมื่อ validate order |
| API Endpoints | ตรวจสอบยอด (`check_balance`) และตัดเงิน (`deduct_balance`) |

### 7.3 Cash Card Management (Backend)

| รายการ | รายละเอียด |
|---|---|
| จัดการบัตร | ออกบัตร, ระงับบัตร, ต่ออายุ |
| เติมเงิน | หน้าจอเติมเงิน พร้อมเลือกวิธีชำระ |
| รายงาน | รายงานยอดขาย, ประวัติบัตร, สรุปการเติมเงิน |

---

## 8. Accounting Flow

### 8.1 เติมเงิน Cash Card

```
Dr. เงินสด / ธนาคาร        xxx
  Cr. Cash Card Liability     xxx
```

### 8.2 ชำระค่าอาหาร

```
Dr. Cash Card Liability      xxx
  Cr. รายได้ร้านค้า (POS)       xxx
```

### 8.3 คืนเงิน (Refund)

```
Dr. รายได้ร้านค้า (POS)       xxx
  Cr. Cash Card Liability     xxx
```

### 8.4 หมายเหตุ

Cash Card Balance ทำหน้าที่เป็น **Liability** ของโรงพยาบาล (เงินที่รับมาแล้วแต่ยังไม่ได้ให้บริการ) ดังนั้น:

- เมื่อเติมเงิน → Liability เพิ่ม (โรงพยาบาลมีภาระต้องให้บริการ)
- เมื่อใช้จ่าย → Liability ลด, Revenue เพิ่ม (ให้บริการแล้ว)
- **ยอดรวม Balance ทุกบัตร ต้องเท่ากับ ยอด Liability Account เสมอ**

---

## 9. Hardware ที่แนะนำสำหรับ POC

| อุปกรณ์ | ใช้ทำอะไร | ราคาประมาณ |
|---|---|---|
| Barcode Scanner (USB) | สแกนบัตร (ถ้าใช้ barcode) | 500 - 1,500 บาท |
| RFID Reader (USB HID) | สแกนบัตร (ถ้าใช้ RFID) | 800 - 2,000 บาท |
| Thermal Printer | พิมพ์ใบเสร็จ | 2,000 - 5,000 บาท |
| Tablet / PC | หน้าจอ POS แต่ละร้าน | 5,000 - 15,000 บาท |
| Barcode / RFID Card | บัตรเติมเงิน | 5 - 30 บาท/ใบ |

### คำแนะนำสำหรับ POC

สำหรับ POC แนะนำใช้ **Barcode** ก่อนเพราะง่ายที่สุด:

- บัตรพิมพ์ barcode ได้เลย (ต้นทุนต่ำ)
- Scanner USB ทำงานเหมือนคีย์บอร์ด (ไม่ต้องเขียน driver)
- เปลี่ยนเป็น RFID ทีหลังได้ง่าย (แค่เปลี่ยน hardware + input method)

---

## 10. ขั้นตอนทำ POC

### Phase 1 — Setup พื้นฐาน (1-2 วัน)

| งาน | รายละเอียด |
|---|---|
| ติดตั้ง Odoo | Odoo 17/18 Community หรือ Enterprise |
| ตั้งค่า POS | สร้าง 2-3 ร้านค้าจำลอง |
| สร้างสินค้า | เมนูอาหารตัวอย่าง แต่ละร้าน 5-10 รายการ |
| สร้าง Contacts | ผู้ถือบัตรตัวอย่าง 5-10 คน |

### Phase 2 — Cash Card Module (3-5 วัน)

| งาน | รายละเอียด |
|---|---|
| สร้าง Module | Custom module `hospital_cashcard` |
| Data Models | cashcard.card, cashcard.topup, cashcard.transaction |
| Backend Views | Form view, Tree view สำหรับจัดการบัตรและเติมเงิน |
| Business Logic | Validation, State management, Balance computation |
| Accounting | Journal entries สำหรับ top-up |

### Phase 3 — POS Integration (3-5 วัน)

| งาน | รายละเอียด |
|---|---|
| Payment Method | เพิ่ม "Cash Card" ใน POS |
| POS Frontend | Customize UI สำหรับสแกนบัตร, แสดงยอด |
| Payment Logic | ตัดยอดจากบัตร, สร้าง transaction |
| Receipt | แสดงข้อมูล Cash Card บนใบเสร็จ |
| End-to-end Test | ทดสอบ flow ทั้งหมดจากสแกนจนออกใบเสร็จ |

### Phase 4 — รายงานและทดสอบ (2-3 วัน)

| งาน | รายละเอียด |
|---|---|
| รายงาน | สร้างรายงานพื้นฐาน (ยอดขาย, ประวัติบัตร, สรุปเติมเงิน) |
| Hardware Test | ทดสอบกับ barcode scanner / thermal printer จริง |
| UAT | ทดสอบกับผู้ใช้จริง (พนักงานร้าน, เจ้าหน้าที่เติมเงิน) |
| Demo | นำเสนอให้ stakeholders |

### Timeline รวม

```
สัปดาห์ที่ 1: Phase 1 + Phase 2 (เริ่มต้น)
สัปดาห์ที่ 2: Phase 2 (ต่อ) + Phase 3
สัปดาห์ที่ 3: Phase 3 (ต่อ) + Phase 4
─────────────────────────────────────────
รวม: ประมาณ 2-3 สัปดาห์
```

---

## 11. ตัวอย่าง Prompt สำหรับพัฒนา Module

ถ้าจะใช้ AI ช่วยเขียน code สามารถใช้ prompt แบบนี้ได้:

### Prompt 1: สร้าง Backend Module

> สร้าง Odoo 17 custom module ชื่อ `hospital_cashcard` สำหรับระบบ Cash Card ในโรงอาหารโรงพยาบาล ประกอบด้วย:
>
> - model `cashcard.card` ที่มี field: card_number, partner_id, balance, state (draft/active/blocked/expired), issue_date, expiry_date
> - model `cashcard.topup` สำหรับเติมเงิน มี field: card_id, amount, payment_method, topup_date, user_id
> - model `cashcard.transaction` สำหรับเก็บ log ทุกธุรกรรม
> - form view และ tree view สำหรับทุก model
> - menu item ภายใต้เมนูหลัก 'Cash Card'
> - validation: card_number unique, amount > 0, ไม่เติมเงินบัตร blocked/expired

### Prompt 2: สร้าง POS Integration

> เขียน JavaScript (OWL) สำหรับ Odoo 17 POS เพิ่ม payment method แบบ custom ชื่อ 'Cash Card' ที่:
>
> - เมื่อกดแล้วจะ popup ให้สแกน barcode ของบัตร
> - เรียก RPC ไปตรวจสอบยอดเงินคงเหลือจาก model cashcard.card
> - แสดงยอดคงเหลือก่อนยืนยัน
> - ถ้ายอดพอให้ validate payment และตัดเงิน
> - ถ้าไม่พอให้แจ้งเตือน "ยอดเงินไม่เพียงพอ"
> - แสดงยอดคงเหลือหลังชำระบนใบเสร็จ

### Prompt 3: สร้าง Accounting Integration

> เพิ่ม accounting integration ให้ module `hospital_cashcard` ใน Odoo 17:
>
> - สร้าง Journal "Cash Card" สำหรับบันทึกธุรกรรม
> - เมื่อเติมเงิน: Dr. Cash / Cr. Cash Card Liability
> - เมื่อชำระที่ POS: Dr. Cash Card Liability / Cr. POS Revenue
> - เมื่อ refund: Dr. POS Revenue / Cr. Cash Card Liability
> - ยอดรวม balance ทุกบัตร ต้องเท่ากับยอด Liability Account

---

## เอกสารที่เกี่ยวข้อง

| เอกสาร | รายละเอียด |
|---|---|
| POC_Test_Script_Odoo_POS_CashCard.md | เอกสาร Test Script สำหรับทดสอบระบบให้ครบ Loop (41 Test Cases) |
