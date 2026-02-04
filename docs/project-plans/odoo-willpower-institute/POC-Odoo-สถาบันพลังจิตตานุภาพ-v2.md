# POC Prompt: ระบบ Odoo บริหารสาขาสถาบันพลังจิตตานุภาพ (Multi-Tenant)

> **เอกสารนี้ใช้เป็น Prompt สำหรับทีมพัฒนา** ในการทำ Proof of Concept ระบบ Odoo  
> เพื่อบริหารจัดการสาขาของสถาบันพลังจิตตานุภาพ แบบ Multi-Tenant  
> อ้างอิงข้อมูลจาก samathi101.com และ business rules จากผู้ดูแลระบบ  
> **ฉบับปรับปรุง v2** — เพิ่มโครงสร้างหลักสูตรครูสมาธิ 100 หัวข้อ + เช็คชื่อรายหัวข้อ

---

## 1. บริบทองค์กร

### 1.1 เกี่ยวกับสถาบัน

สถาบันพลังจิตตานุภาพ ก่อตั้งเมื่อ 24 กรกฎาคม 2540 ณ นครธรรม พระมหาเจดีย์ วัดธรรมมงคลเถาบุญญนนท์วิหาร สุขุมวิท 101 กรุงเทพมหานคร โดยสมเด็จพระญาณวชิโรดม (หลวงพ่อวิริยังค์ สิรินฺธโร) มีจุดประสงค์เผยแผ่สมาธิสายหลวงปู่มั่น ภูริทัตโต แก่ประชาชนทุกเพศ ทุกวัย ทุกอาชีพ

### 1.2 ขนาดองค์กร

- **สาขา:** มากกว่า 300 สาขาทั่วประเทศไทย + สาขาต่างประเทศ (แคนาดา, สหรัฐอเมริกา)
- **สำนักงานใหญ่:** วัดธรรมมงคล กรุงเทพฯ
- **ประธานกรรมการ:** นายมีชัย ฤชุพันธุ์
- **มูลนิธิ:** มูลนิธิสถาบันพลังจิตตานุภาพ หลวงพ่อวิริยังค์ สิรินฺธโร
- **เว็บไซต์หลัก:** samathi101.com

### 1.3 ลักษณะสาขา

สาขาส่วนใหญ่ตั้งอยู่ในวัด, มหาวิทยาลัย หรือสถานที่ของผู้อุปถัมภ์ เช่น:
- สาขา 5 วัดดอนรัก จ.สงขลา
- สาขา 40 วัดตรีรัตนาราม จ.ระยอง
- สาขา 117 วัดโสภาราม จ.ปทุมธานี
- สาขา 173 วัดหนามแดง
- สาขา 193 วัดคุณหญิงส้มจีน จ.ปทุมธานี
- สาขา 226 วัดพุทธปัญญา จ.นนทบุรี
- สาขา 296 วัดศรีเกิด จ.เชียงใหม่
- สาขา 306 วัดไผ่เหลือง บางบัวทอง

**สาขาจะมีหมายเลขประจำ** (เช่น สาขา 5, สาขา 40, สาขา 117) เป็นรหัสหลักในการอ้างอิง

---

## 2. Multi-Tenant Architecture

### 2.1 แนวทางที่เลือก: Multi-Company บน Odoo Instance เดียว

| รายการ | รายละเอียด |
|--------|-----------|
| **Odoo Instance** | 1 Instance |
| **Company (บริษัท)** | 1 Parent Company (สำนักงานใหญ่ / มูลนิธิ) + N Child Companies (แต่ละสาขา) |
| **Database** | 1 Database แชร์ master data |
| **Data Isolation** | ใช้ Record Rules แยกข้อมูลรายสาขา |
| **Consolidation** | HQ มองเห็นข้อมูลรวมทุกสาขา ผ่าน inter-company rules |

### 2.2 การแมป Company

```
มูลนิธิสถาบันพลังจิตตานุภาพ (Parent Company)
├── สาขา 5 วัดดอนรัก (Child Company)
├── สาขา 40 วัดตรีรัตนาราม (Child Company)
├── สาขา 117 วัดโสภาราม (Child Company)
├── สาขา 173 วัดหนามแดง (Child Company)
├── ...
└── สาขา 306 วัดไผ่เหลือง (Child Company)
```

### 2.3 Data Sync จาก samathi101.com

| ข้อมูล | แหล่งที่มา | ทิศทาง | วิธีการ |
|--------|-----------|--------|--------|
| รายชื่อสาขา + ที่อยู่ + เบอร์โทร | samathi101.com/branch | samathi101 → Odoo | API / Web Scraping → Import |
| กิจกรรม / คอร์สที่เปิดสอน | samathi101.com/events | samathi101 → Odoo | API / Web Scraping → Import |
| นักศึกษาลงทะเบียน | samathi101.com (ถ้ามี API) | samathi101 ↔ Odoo | Two-way sync (ถ้าเป็นไปได้) |
| ข่าวสาร | samathi101.com/news | samathi101 → Odoo | Read-only reference |

> **หมายเหตุ POC:** เริ่มจาก one-time import ก่อน แล้วค่อยทำ scheduled sync ใน phase ถัดไป

---

## 3. หลักสูตร (Course Master Data)

หลักสูตรเป็น **master data ที่ส่วนกลางกำหนด** สาขาเลือกเปิดสอนตามที่ได้รับอนุญาต

### 3.1 หลักสูตรทั้งหมด

| รหัส | ชื่อหลักสูตร | ระยะเวลา | ค่าใช้จ่าย | การจัดการรุ่น | หมายเหตุ |
|------|-------------|----------|-----------|-------------|---------|
| **KRU** | หลักสูตรครูสมาธิ (Hi-Tech Meditation) | 6 เดือน (200 ชม.) 3 เทอม × 40 วัน | ฟรี | ⭐ **เลขรุ่นเดียวกันทั่วประเทศ** สาขาต้องขออนุมัติส่วนกลาง | หลักสูตรหลัก มี **100 หัวข้อ** ดูรายละเอียดในหมวด 3.2 |
| **CHIN1** | ชินนสาสมาธิ 1 | 1 วัน (2/3/6 ชม.) | ฟรี | สาขาเปิดเอง เลขรุ่นแยกตามสาขา | หลักสูตรระยะสั้นเผยแผ่ |
| **WITUN** | วิทันตสาสมาธิ | ~6 เดือน | ฟรี | สาขาเปิดเอง | การฝึกฝนตนเองที่วิเศษ |
| **WITHI** | วิทิสาสมาธิ | 1 เดือน | ฟรี | สาขาเปิดเอง | หลักสูตรเสริม |
| **YAAN** | ญาณสาสมาธิ | ~5 สัปดาห์ (ออนไลน์) | ฟรี | สาขาเปิดเอง | สอนจากเทปบันทึกหลวงพ่อ |
| **UTTAMA** | อุตมสาสมาธิ | (ออนไลน์) | ฟรี | สาขาเปิดเอง | หลักสูตรขั้นสูง |
| **AJARIYA** | อาจาริยสาสมาธิ | 3 วัน (อบรมเข้ม) | - | **ส่วนกลางจัดเท่านั้น** | สำหรับผลิตอาจารย์สมาธิ |

### 3.2 ⭐ หลักสูตรครูสมาธิ (KRU) — โครงสร้างพิเศษ (สำคัญมาก)

หลักสูตรครูสมาธิ (KRU) มีความพิเศษแตกต่างจากหลักสูตรอื่นอย่างมาก:

#### 3.2.1 ความแตกต่างจากหลักสูตรทั่วไป

| ด้าน | หลักสูตรทั่วไป (CHIN1, WITUN ฯลฯ) | หลักสูตรครูสมาธิ (KRU) ⭐ |
|------|-----------------------------------|--------------------------|
| **เลขรุ่น** | แต่ละสาขากำหนดเอง | **เลขรุ่นเดียวกันทุกสาขาทั่วประเทศ** (เช่น รุ่น 52 = รุ่น 52 ทุกสาขา) |
| **การเปิดสอน** | สาขาเปิดเองได้ | **สาขาต้องยื่นขออนุมัติจากส่วนกลาง** |
| **ภาคเรียน** | ตามสาขากำหนด | เลือกได้ 2 ภาค: **จันทร์-ศุกร์** หรือ **เสาร์-อาทิตย์** |
| **โครงสร้างเนื้อหา** | ไม่จำกัดโครงสร้าง | มี **100 หัวข้อ** ที่กำหนดโดยส่วนกลาง |
| **การเช็คชื่อ** | เช็คชื่อรายวัน (ถ้ามี) | **เช็คชื่อทุกหัวข้อ** (100 หัวข้อ) |
| **อาจารย์** | 1 คนต่อคอร์ส (ส่วนใหญ่) | **แต่ละหัวข้ออาจมีอาจารย์คนละคน** |
| **ตารางเรียน** | คงที่ตลอดหลักสูตร | **แต่ละหัวข้อมีวัน-เวลาเรียนแตกต่างกัน** |
| **สอบภาคสนาม** | ไม่มี | ดอยอินทนนท์ 4 วัน 3 คืน |

#### 3.2.2 โครงสร้าง 100 หัวข้อ

```
หลักสูตรครูสมาธิ (KRU) - รุ่นที่ N
│
├── เทอม 1 (หัวข้อที่ 1-33)
│   ├── หัวข้อที่ 1: [ชื่อหัวข้อ]
│   │   ├── วันที่เรียน: วันจันทร์ 3 ก.พ. 2568
│   │   ├── เวลา: 18:00-20:30
│   │   ├── อาจารย์: อ.สมชาย
│   │   └── เช็คชื่อ: ✅ นักศึกษา 45/50 คน
│   │
│   ├── หัวข้อที่ 2: [ชื่อหัวข้อ]
│   │   ├── วันที่เรียน: วันอังคาร 4 ก.พ. 2568
│   │   ├── เวลา: 18:00-20:30
│   │   ├── อาจารย์: อ.สมหญิง
│   │   └── เช็คชื่อ: ✅ นักศึกษา 43/50 คน
│   │
│   └── ... (ถึงหัวข้อที่ 33)
│
├── เทอม 2 (หัวข้อที่ 34-66)
│   └── ...
│
├── เทอม 3 (หัวข้อที่ 67-100)
│   └── ...
│
└── สอบภาคสนาม (ดอยอินทนนท์ 4 วัน 3 คืน)
```

#### 3.2.3 Business Rules: หลักสูตรครูสมาธิ

| กฎ | รายละเอียด |
|----|-----------|
| **รุ่นเป็น Global** | ส่วนกลางประกาศเปิดรุ่น (เช่น "รุ่นที่ 53") → ทุกสาขาที่ได้รับอนุมัติจะใช้เลขรุ่นเดียวกัน |
| **สาขาต้องขออนุมัติ** | สาขายื่นคำขอเปิดสอนรุ่น N → ระบุภาค (จ-ศ หรือ ส-อา) + จำนวนที่นั่ง → ส่วนกลางอนุมัติ |
| **ภาคเรียน** | สาขาเลือก 1 ภาค: ภาคจันทร์-ศุกร์ (เรียนวันธรรมดา เช่น 18:00-20:30) หรือ ภาคเสาร์-อาทิตย์ (เรียนวันหยุด เช่น 09:00-16:00) |
| **100 หัวข้อ** | ส่วนกลางกำหนด 100 หัวข้อ (master list) เป็น template ให้ทุกสาขาใช้เหมือนกัน |
| **แต่ละหัวข้อมีอาจารย์ของตัวเอง** | สาขากำหนดว่าหัวข้อไหนอาจารย์คนไหนสอน → อาจารย์ 1 คนสอนหลายหัวข้อได้ หรือ แต่ละหัวข้อคนละคนก็ได้ |
| **แต่ละหัวข้อมีวัน-เวลาต่างกัน** | สาขาจัดตารางเอง — หัวข้อที่ 1 อาจเรียนวันจันทร์, หัวข้อที่ 2 เรียนวันพุธ เป็นต้น |
| **เช็คชื่อรายหัวข้อ** | ทุกหัวข้อต้องเช็คชื่อนักศึกษาแต่ละคน → ดูว่าเข้าเรียนกี่หัวข้อจาก 100 |
| **เกณฑ์จบ** | (กำหนดโดยส่วนกลาง) เช่น ต้องเข้าเรียนอย่างน้อย X หัวข้อจาก 100 + สอบผ่าน + สอบภาคสนาม |

---

## 4. Data Model: หลักสูตรครูสมาธิ 100 หัวข้อ ⭐

### 4.1 Entity Relationship

```
┌─────────────────────┐
│  willpower.course    │  ← Master: หลักสูตร (KRU, CHIN1, ...)
│  - code              │
│  - name              │
│  - duration          │
│  - requires_approval │  ← KRU = True
│  - has_topics        │  ← KRU = True (มี 100 หัวข้อ)
└────────┬────────────┘
         │ 1
         │
         │ M (สำหรับ KRU: กำหนดหัวข้อ master)
┌────────▼────────────┐
│  willpower.topic     │  ← Master: 100 หัวข้อ (ส่วนกลางกำหนด)
│  - course_id (→KRU)  │
│  - sequence (1-100)  │
│  - name              │
│  - term (1/2/3)      │
│  - description       │
│  - duration_hours     │
└────────┬────────────┘
         │
         │ (ใช้เป็น template)
         │
┌────────▼──────────────────────┐
│  willpower.kru.batch          │  ← รุ่น Global (เช่น รุ่น 52)
│  - batch_number (52)          │     ส่วนกลางสร้าง ใช้ทั่วประเทศ
│  - batch_name_pali            │
│  - academic_year              │
│  - state (draft/open/closed)  │
└────────┬──────────────────────┘
         │ 1
         │
         │ M (แต่ละสาขาที่ได้รับอนุมัติ)
┌────────▼──────────────────────────────┐
│  willpower.kru.branch.opening         │  ← สาขาขอเปิดสอนรุ่น N
│  - batch_id (→ รุ่น 52)               │
│  - branch_id (→ สาขา 5)              │
│  - section_type: จ-ศ / ส-อา           │
│  - max_students                       │
│  - approval_state: draft→submitted    │
│    →approved→rejected                 │
│  - approved_by (HQ user)              │
│  - approved_date                      │
└────────┬──────────────────────────────┘
         │ 1
         │
         │ 100 records (1 ต่อหัวข้อ)
┌────────▼──────────────────────────────────────┐
│  willpower.kru.session                         │  ← หัวข้อเรียนแต่ละครั้ง
│  - opening_id (→ สาขา 5 รุ่น 52)              │
│  - topic_id (→ หัวข้อที่ 1)                     │
│  - sequence (1-100)                            │
│  - teacher_id (→ อาจารย์ที่สอนหัวข้อนี้)       │
│  - scheduled_date (วันที่เรียน)                 │
│  - start_time / end_time (เวลาเรียน)           │
│  - state: scheduled / completed / cancelled    │
│  - notes                                       │
└────────┬──────────────────────────────────────┘
         │ 1
         │
         │ M (1 record ต่อนักศึกษา)
┌────────▼──────────────────────────────────────┐
│  willpower.kru.attendance                      │  ← เช็คชื่อรายหัวข้อ
│  - session_id (→ หัวข้อที่ 1 สาขา 5 รุ่น 52)  │
│  - student_id (→ นักศึกษา)                     │
│  - status: present / absent / late / excused   │
│  - checked_by (→ user ที่เช็คชื่อ)             │
│  - checked_at (timestamp)                      │
│  - notes                                       │
└────────────────────────────────────────────────┘
```

### 4.2 Python Model ตัวอย่าง

```python
# ===== 1) หัวข้อ Master (ส่วนกลางกำหนด 100 หัวข้อ) =====
class KruTopic(models.Model):
    _name = 'willpower.topic'
    _description = 'หัวข้อเรียนหลักสูตรครูสมาธิ (Master)'
    _order = 'sequence'

    course_id      = fields.Many2one('willpower.course', default=lambda self: self._get_kru())
    sequence       = fields.Integer('ลำดับหัวข้อ', required=True)  # 1-100
    name           = fields.Char('ชื่อหัวข้อ', required=True)
    term           = fields.Selection([
        ('1', 'เทอม 1'), ('2', 'เทอม 2'), ('3', 'เทอม 3')
    ], string='เทอม', required=True)
    description    = fields.Text('รายละเอียด')
    duration_hours = fields.Float('จำนวนชั่วโมง', default=2.5)
    topic_type     = fields.Selection([
        ('theory', 'ภาคทฤษฎี'),
        ('practice', 'ภาคปฏิบัติ'),
        ('exam', 'สอบ'),
        ('field', 'ภาคสนาม')
    ], default='theory')


# ===== 2) รุ่น Global (ส่วนกลางสร้าง ใช้ทั่วประเทศ) =====
class KruBatch(models.Model):
    _name = 'willpower.kru.batch'
    _description = 'รุ่นหลักสูตรครูสมาธิ (Global ทุกสาขา)'

    batch_number   = fields.Integer('รุ่นที่', required=True)       # 52
    batch_name_pali = fields.Char('ชื่อรุ่น (บาลี)')                # ทวิปัญญาสโม
    academic_year  = fields.Char('ปีการศึกษา')                      # 2568
    start_date     = fields.Date('วันเริ่มรุ่น')
    end_date       = fields.Date('วันสิ้นสุดรุ่น')
    state          = fields.Selection([
        ('draft', 'ร่าง'),
        ('announced', 'ประกาศแล้ว'),       # สาขาเริ่มยื่นขอเปิดได้
        ('in_progress', 'กำลังดำเนินการ'),  # เรียนอยู่
        ('completed', 'จบรุ่นแล้ว'),
        ('cancelled', 'ยกเลิก')
    ], default='draft')
    opening_ids    = fields.One2many('willpower.kru.branch.opening', 'batch_id')
    opening_count  = fields.Integer(compute='_compute_stats')
    total_students = fields.Integer(compute='_compute_stats')


# ===== 3) สาขาขอเปิดสอน (ต้องอนุมัติจาก HQ) =====
class KruBranchOpening(models.Model):
    _name = 'willpower.kru.branch.opening'
    _description = 'สาขาขอเปิดสอนหลักสูตรครูสมาธิ'

    batch_id       = fields.Many2one('willpower.kru.batch', required=True)
    branch_id      = fields.Many2one('res.company', 'สาขา', required=True)
    
    # ภาคเรียน
    section_type   = fields.Selection([
        ('weekday', 'ภาคจันทร์-ศุกร์'),
        ('weekend', 'ภาคเสาร์-อาทิตย์'),
    ], string='ภาคเรียน', required=True)
    
    # ข้อมูลเวลาเรียนตามภาค
    weekday_schedule  = fields.Char(
        'ตารางเรียน (จ-ศ)', 
        help='เช่น จันทร์-ศุกร์ 18:00-20:30',
        default='จันทร์-ศุกร์ 18:00-20:30'
    )
    weekend_schedule  = fields.Char(
        'ตารางเรียน (ส-อา)', 
        help='เช่น เสาร์-อาทิตย์ 09:00-16:00',
        default='เสาร์-อาทิตย์ 09:00-16:00'
    )
    
    max_students   = fields.Integer('จำนวนที่นั่ง')
    current_students = fields.Integer(compute='_compute_students')
    
    # Approval workflow
    approval_state = fields.Selection([
        ('draft', 'ร่าง'),
        ('submitted', 'ยื่นขออนุมัติ'),
        ('approved', 'อนุมัติแล้ว'),
        ('rejected', 'ไม่อนุมัติ'),
    ], default='draft')
    submitted_date = fields.Date('วันที่ยื่น')
    approved_by    = fields.Many2one('res.users', 'อนุมัติโดย')
    approved_date  = fields.Date('วันที่อนุมัติ')
    reject_reason  = fields.Text('เหตุผลที่ไม่อนุมัติ')
    
    # Sessions (100 หัวข้อ)
    session_ids    = fields.One2many('willpower.kru.session', 'opening_id')
    session_count  = fields.Integer(compute='_compute_session_count')
    
    def action_submit(self):
        """สาขายื่นขออนุมัติ"""
        self.write({'approval_state': 'submitted', 'submitted_date': fields.Date.today()})
    
    def action_approve(self):
        """HQ อนุมัติ → สร้าง 100 sessions อัตโนมัติ"""
        self.write({
            'approval_state': 'approved',
            'approved_by': self.env.uid,
            'approved_date': fields.Date.today()
        })
        self._generate_sessions()
    
    def _generate_sessions(self):
        """สร้าง 100 session records จาก topic master"""
        topics = self.env['willpower.topic'].search(
            [('course_id.code', '=', 'KRU')],
            order='sequence'
        )
        for topic in topics:
            self.env['willpower.kru.session'].create({
                'opening_id': self.id,
                'topic_id': topic.id,
                'sequence': topic.sequence,
                'state': 'draft',
                # scheduled_date, teacher_id → สาขาจัดเองทีหลัง
            })


# ===== 4) Session: หัวข้อเรียนแต่ละครั้ง (แต่ละสาขา 100 records) =====
class KruSession(models.Model):
    _name = 'willpower.kru.session'
    _description = 'หัวข้อเรียน/Session ของหลักสูตรครูสมาธิ'
    _order = 'sequence'

    opening_id     = fields.Many2one('willpower.kru.branch.opening', required=True, ondelete='cascade')
    topic_id       = fields.Many2one('willpower.topic', 'หัวข้อ', required=True)
    sequence       = fields.Integer(related='topic_id.sequence', store=True)
    topic_name     = fields.Char(related='topic_id.name')
    term           = fields.Selection(related='topic_id.term')
    
    # ⭐ อาจารย์แต่ละหัวข้อ (แต่ละหัวข้ออาจเป็นคนละคน)
    teacher_id     = fields.Many2one('willpower.teacher', 'อาจารย์ผู้สอน')
    
    # ⭐ วัน-เวลาเรียนแต่ละหัวข้อ (แตกต่างกันได้)
    scheduled_date = fields.Date('วันที่เรียน')
    start_time     = fields.Float('เวลาเริ่ม')     # 18.0 = 18:00
    end_time        = fields.Float('เวลาสิ้นสุด')   # 20.5 = 20:30
    
    state          = fields.Selection([
        ('draft', 'ยังไม่จัดตาราง'),
        ('scheduled', 'จัดตารางแล้ว'),
        ('completed', 'สอนแล้ว'),
        ('cancelled', 'ยกเลิก'),
    ], default='draft')
    
    # Attendance summary
    attendance_ids   = fields.One2many('willpower.kru.attendance', 'session_id')
    present_count    = fields.Integer(compute='_compute_attendance')
    absent_count     = fields.Integer(compute='_compute_attendance')
    attendance_rate  = fields.Float(compute='_compute_attendance')  # %
    
    # ⭐ ค่ารถอาจารย์ (auto-compute)
    is_cross_branch      = fields.Boolean(compute='_compute_transport')
    transport_eligible   = fields.Boolean(compute='_compute_transport')
    transport_claim_id   = fields.Many2one('willpower.transport.claim')
    
    def _compute_transport(self):
        for rec in self:
            teacher = rec.teacher_id
            rec.is_cross_branch = (
                teacher and 
                rec.opening_id.branch_id != teacher.home_branch_id
            )
            rec.transport_eligible = rec.is_cross_branch  # KRU โดยปริยาย
    
    def action_complete(self):
        """สอนเสร็จ → ล็อค attendance + สร้างค่ารถถ้าเข้าเงื่อนไข"""
        self.state = 'completed'
        if self.transport_eligible:
            self.env['willpower.transport.claim'].create({
                'teacher_id': self.teacher_id.id,
                'session_id': self.id,
                'branch_id': self.opening_id.branch_id.id,
                'amount': 500.0,
                'state': 'pending',
            })


# ===== 5) Attendance: เช็คชื่อรายหัวข้อ =====
class KruAttendance(models.Model):
    _name = 'willpower.kru.attendance'
    _description = 'เช็คชื่อนักศึกษา รายหัวข้อ'
    _rec_name = 'student_id'

    session_id     = fields.Many2one('willpower.kru.session', required=True, ondelete='cascade')
    student_id     = fields.Many2one('willpower.student', 'นักศึกษา', required=True)
    
    status         = fields.Selection([
        ('present', 'มาเรียน'),
        ('absent', 'ขาดเรียน'),
        ('late', 'มาสาย'),
        ('excused', 'ลา (มีใบลา)'),
    ], default='absent', required=True)
    
    checked_by     = fields.Many2one('res.users', 'ผู้เช็คชื่อ')
    checked_at     = fields.Datetime('เวลาที่เช็ค')
    notes          = fields.Text('หมายเหตุ')

    _sql_constraints = [
        ('unique_session_student', 
         'UNIQUE(session_id, student_id)', 
         'นักศึกษาซ้ำในหัวข้อเดียวกัน!')
    ]
```

### 4.3 ตัวอย่างข้อมูลจริง: สาขา 5 วัดดอนรัก เปิดรุ่น 52 ภาคเสาร์-อาทิตย์

```
รุ่น 52 (Global) — สาขา 5 วัดดอนรัก — ภาคเสาร์-อาทิตย์
├── หัวข้อ 1: "ความหมายของสมาธิ"
│   ├── วัน: เสาร์ 25 ส.ค. 2567  09:00-11:30
│   ├── อาจารย์: อ.สุนทร (สาขา 5)        → ค่ารถ: ไม่มี (สาขาตนเอง)
│   └── เช็คชื่อ: 48 มา / 2 ขาด = 96%
│
├── หัวข้อ 2: "ประวัติการทำสมาธิ"
│   ├── วัน: เสาร์ 25 ส.ค. 2567  13:00-15:30
│   ├── อาจารย์: อ.วิไล (สาขา 40 ระยอง)  → ค่ารถ: 500 บาท ✅ (ข้ามสาขา + KRU)
│   └── เช็คชื่อ: 47 มา / 3 ขาด = 94%
│
├── หัวข้อ 3: "หลักการบริกรรม"
│   ├── วัน: อาทิตย์ 26 ส.ค. 2567  09:00-11:30
│   ├── อาจารย์: อ.สุนทร (สาขา 5)        → ค่ารถ: ไม่มี
│   └── เช็คชื่อ: 45 มา / 5 ขาด = 90%
│
├── ... (หัวข้อ 4-99)
│
└── หัวข้อ 100: "ปัจฉิมนิเทศ"
    ├── วัน: อาทิตย์ 9 ก.พ. 2568  09:00-16:00
    ├── อาจารย์: อ.สุนทร + อ.สมศรี
    └── เช็คชื่อ: 42 มา / 8 ขาด = 84%
```

---

## 5. บุคลากร / สมาชิกสาขา (Staff & Member Model)

### 5.1 ประเภทบุคลากร

```
สมาชิกสาขา (Branch Member / Staff)
├── เจ้าหน้าที่สาขา (Branch Staff)
│   ├── ผู้จัดการสาขา (Branch Manager)
│   ├── เจ้าหน้าที่ทั่วไป (General Staff)
│   └── พี่เลี้ยง (Mentor / Assistant)
│
├── อาจารย์สมาธิ (Meditation Teacher / Ajarn) ⭐
│   ├── จบหลักสูตรอาจาริยสาสมาธิ (AJARIYA) — บังคับ
│   ├── ขึ้นทะเบียนโดยส่วนกลาง — บังคับ
│   ├── มีรุ่นอาจาริยสาที่จบ (เช่น รุ่นที่ 27)
│   └── สังกัดสาขาหลัก 1 แห่ง แต่สอนข้ามสาขาได้
│
└── อาสาสมัคร (Volunteer)
```

### 5.2 Business Rules สำหรับ "อาจารย์สมาธิ" ⭐

| กฎ | รายละเอียด |
|----|-----------|
| **คุณสมบัติ** | ต้องจบหลักสูตร **อาจาริยสาสมาธิ (AJARIYA)** เท่านั้น จึงจะได้รับสิทธิ์เป็นอาจารย์ |
| **การขึ้นทะเบียน** | **ส่วนกลาง (HQ) เป็นผู้ขึ้นทะเบียนอาจารย์** สาขาไม่สามารถแต่งตั้งเองได้ |
| **รุ่นที่จบ** | บันทึกรุ่นอาจาริยสาที่จบ เช่น รุ่นที่ 27 |
| **สังกัดสาขา** | อาจารย์มีสาขาหลัก (home branch) 1 แห่ง |
| **สอนข้ามสาขา** | ✅ อาจารย์สามารถ **สอนต่างสาขาได้** (multi-branch teaching) |
| **สอนหลายหลักสูตร** | ✅ อาจารย์ 1 คนสามารถ **สอนได้หลายหลักสูตร** |
| **สอนหลายหัวข้อ** | ✅ ใน KRU อาจารย์ 1 คน **สอนได้หลายหัวข้อ** ในรุ่นเดียวกัน |
| **ค่ารถ (KRU เท่านั้น)** | เมื่ออาจารย์ไป **สอนหลักสูตร KRU** ที่สาขาอื่น → **ส่วนกลางจ่ายค่ารถ 500 บาท/ครั้ง(session)** |
| **เงื่อนไขค่ารถ** | ค่ารถ 500 บาท เฉพาะ: (1) สอน KRU เท่านั้น, (2) สอนที่สาขาอื่น ≠ สาขาหลักของอาจารย์ |

### 5.3 Data Model: อาจารย์สมาธิ

```python
class MeditationTeacher(models.Model):
    _name = 'willpower.teacher'
    _description = 'อาจารย์สมาธิ'

    member_id        = fields.Many2one('willpower.member')
    name             = fields.Char(related='member_id.name')
    
    # คุณสมบัติอาจาริยสา
    ajariya_batch_id = fields.Many2one('willpower.batch')      # รุ่นอาจาริยสาที่จบ
    ajariya_date     = fields.Date('วันที่จบอาจาริยสา')
    registration_date = fields.Date('วันที่ขึ้นทะเบียน')
    registered_by    = fields.Many2one('res.users')            # HQ เท่านั้น
    state            = fields.Selection([
        ('pending', 'รอขึ้นทะเบียน'),
        ('active', 'ขึ้นทะเบียนแล้ว'),
        ('suspended', 'ระงับชั่วคราว'),
        ('retired', 'เกษียณ')
    ])
    
    # สังกัดและความสามารถ
    home_branch_id       = fields.Many2one('res.company')
    teachable_course_ids = fields.Many2many('willpower.course')
    
    # Sessions ที่สอน (KRU)
    session_ids          = fields.One2many('willpower.kru.session', 'teacher_id')
    cross_branch_count   = fields.Integer(compute='_compute_stats')  # จำนวนครั้งสอนข้ามสาขา
```

---

## 6. โมดูลหลัก POC

### 6.1 Module: willpower_branch — บริหารสาขา

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| ข้อมูลสาขา | หมายเลขสาขา, ชื่อ, ที่ตั้ง (วัด/สถาบัน), จังหวัด, ภาค, เบอร์โทร |
| ผู้ดูแลสาขา | ผู้จัดการสาขา, เบอร์ติดต่อ |
| สถานะ | Active / Inactive |
| ประเภทการเรียนที่รองรับ | จันทร์-ศุกร์ / เสาร์-อาทิตย์ / ออนไลน์ |
| ความจุ | จำนวนที่นั่งสูงสุด |
| Sync | เชื่อมข้อมูลจาก samathi101.com/branch |

### 6.2 Module: willpower_course — บริหารหลักสูตรและรุ่น

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| หลักสูตร (Master) | รหัส, ชื่อ, ระยะเวลา, ต้องอนุมัติ?, มี topic? |
| Topic Master (KRU) | 100 หัวข้อ — ลำดับ, ชื่อ, เทอม, ภาคทฤษฎี/ปฏิบัติ |
| รุ่น KRU (Global) | หมายเลขรุ่น, ชื่อบาลี, ปีการศึกษา, สถานะ |
| Branch Opening (KRU) | สาขาขอเปิด + ภาคเรียน → HQ อนุมัติ → สร้าง 100 sessions |
| Session (KRU) | แต่ละหัวข้อ: วัน, เวลา, อาจารย์ (กำหนดแยกแต่ละหัวข้อ) |
| รุ่น (หลักสูตรอื่น) | แต่ละสาขากำหนดเอง |

### 6.3 Module: willpower_student — บริหารนักศึกษา

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| ลงทะเบียน | ชื่อ, ข้อมูลติดต่อ, สาขา, หลักสูตร, รุ่น |
| ประวัติ | หลักสูตรที่เรียน, สาขา, รุ่น |
| สถานะ | สมัครแล้ว → กำลังเรียน → สอบผ่าน → จบ / พัก / ไม่ผ่าน |
| เช็คชื่อ KRU | ดูว่าเข้าเรียนกี่หัวข้อจาก 100 (เช็ครายหัวข้อ) |
| สรุป attendance | Dashboard: จำนวนหัวข้อที่มา/ขาด/สาย/ลา, % การเข้าเรียน |
| ใบประกาศนียบัตร | ออกเมื่อผ่านเกณฑ์ |
| เส้นทาง | นักศึกษา → จบ KRU → จบ AJARIYA → ขึ้นทะเบียนอาจารย์ |

### 6.4 Module: willpower_teacher — บริหารอาจารย์สมาธิ ⭐

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| ทะเบียนอาจารย์ | ข้อมูลส่วนตัว, รุ่นอาจาริยสา, วันที่ขึ้นทะเบียน |
| ขึ้นทะเบียน | HQ ดำเนินการเท่านั้น |
| สาขาหลัก | สังกัด 1 แห่ง |
| มอบหมายสอน KRU | กำหนดอาจารย์ **รายหัวข้อ** (อาจารย์ A สอนหัวข้อ 1-20, อาจารย์ B สอน 21-40 ...) |
| สอนข้ามสาขา | ระบบตรวจจับอัตโนมัติ |
| ค่ารถ 500 บาท | Auto-create เมื่อ session ของ KRU ที่สอนข้ามสาขา ถูก mark เป็น "completed" |
| ประวัติการสอน | ดูทุก session ที่เคยสอน + สาขา + หัวข้อ |

### 6.5 Module: willpower_finance — การเงินสาขา

| ฟีเจอร์ | รายละเอียด |
|---------|-----------|
| รายรับ | เงินบริจาค, เงินสนับสนุน |
| รายจ่ายสาขา | ค่าเช่า, อุปกรณ์, สาธารณูปโภค |
| ค่ารถอาจารย์ | ส่วนกลางจ่าย 500 บาท/session (เฉพาะ KRU ข้ามสาขา) |
| รายงาน | รายรับ-จ่ายรายสาขา, รายงานรวม HQ |

---

## 7. สิทธิ์การเข้าถึง (Access Control)

### 7.1 Security Groups

| กลุ่ม | ขอบเขต | สิทธิ์หลัก |
|-------|--------|-----------|
| **Super Admin (HQ)** | ทุกสาขา | ทุกอย่าง + สร้างรุ่น KRU + อนุมัติ opening + ขึ้นทะเบียนอาจารย์ + กำหนด topic master |
| **Branch Manager** | สาขาตนเอง | ยื่นขอเปิด KRU + จัดตาราง session + กำหนดอาจารย์รายหัวข้อ + เช็คชื่อ |
| **อาจารย์สมาธิ** | สาขาที่สอน (หลายสาขา) | ดูนักศึกษา + ดู session ที่ตนสอน + เช็คชื่อในหัวข้อที่ตนรับผิดชอบ |
| **เจ้าหน้าที่/พี่เลี้ยง** | สาขาตนเอง | เช็คชื่อ + ดูข้อมูลนักศึกษา |
| **นักศึกษา (Portal)** | ข้อมูลตนเอง | ดูตารางเรียน 100 หัวข้อ + ดูสถิติ attendance ตนเอง |

### 7.2 Record Rules (ตัวอย่าง)

```xml
<!-- สาขามองเห็นเฉพาะ Opening + Session ของตน -->
<record id="rule_session_branch" model="ir.rule">
    <field name="name">KRU Session: Branch Only</field>
    <field name="model_id" ref="model_willpower_kru_session"/>
    <field name="groups" eval="[(4, ref('group_branch_staff'))]"/>
    <field name="domain_force">[('opening_id.branch_id','=',user.company_id.id)]</field>
</record>

<!-- อาจารย์เห็น session ทุกสาขาที่ตนสอน -->
<record id="rule_session_teacher" model="ir.rule">
    <field name="name">KRU Session: Teacher Sessions</field>
    <field name="model_id" ref="model_willpower_kru_session"/>
    <field name="groups" eval="[(4, ref('group_teacher'))]"/>
    <field name="domain_force">['|',
        ('teacher_id.user_id','=',user.id),
        ('opening_id.branch_id','=',user.company_id.id)
    ]</field>
</record>

<!-- HQ มองเห็นทุกอย่าง -->
<record id="rule_session_hq" model="ir.rule">
    <field name="name">KRU Session: HQ Full Access</field>
    <field name="model_id" ref="model_willpower_kru_session"/>
    <field name="groups" eval="[(4, ref('group_hq_admin'))]"/>
    <field name="domain_force">[(1,'=',1)]</field>
</record>
```

---

## 8. Workflow หลัก

### 8.1 Workflow: เปิดหลักสูตรครูสมาธิ (KRU) ⭐

```
                    ┌──────────────────────────┐
                    │  ส่วนกลาง (HQ)            │
                    │  ประกาศเปิดรุ่น 53        │
                    │  สถานะ: announced         │
                    └─────────┬────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ สาขา 5     │  │ สาขา 40    │  │ สาขา 193   │
     │ ยื่นขอเปิด │  │ ยื่นขอเปิด │  │ ยื่นขอเปิด │
     │ ภาค: ส-อา  │  │ ภาค: จ-ศ   │  │ ภาค: ส-อา  │
     │ ที่นั่ง: 50 │  │ ที่นั่ง: 40 │  │ ที่นั่ง: 60 │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           │               │               │
           ▼               ▼               ▼
     ┌─────────────────────────────────────────┐
     │         HQ พิจารณาอนุมัติ                │
     │  ✅ สาขา 5 — อนุมัติ                    │
     │  ✅ สาขา 40 — อนุมัติ                   │
     │  ❌ สาขา 193 — ไม่อนุมัติ (อาจารย์ไม่พอ)│
     └─────────────────────────────────────────┘
           │               │
           ▼               ▼
  ┌─────────────┐  ┌─────────────┐
  │ Auto-create │  │ Auto-create │
  │ 100 sessions│  │ 100 sessions│
  │ (สาขา 5)   │  │ (สาขา 40)  │
  └──────┬──────┘  └──────┬──────┘
         │                │
         ▼                ▼
  สาขาจัดตาราง:          สาขาจัดตาราง:
  - กำหนดวัน-เวลา        - กำหนดวัน-เวลา
    แต่ละหัวข้อ             แต่ละหัวข้อ
  - กำหนดอาจารย์          - กำหนดอาจารย์
    แต่ละหัวข้อ             แต่ละหัวข้อ
         │                │
         ▼                ▼
  เปิดรับนักศึกษา        เปิดรับนักศึกษา
         │                │
         ▼                ▼
  ปฐมนิเทศ               ปฐมนิเทศ
         │                │
         ▼                ▼
  เรียน 100 หัวข้อ       เรียน 100 หัวข้อ
  (เช็คชื่อทุกหัวข้อ)     (เช็คชื่อทุกหัวข้อ)
         │                │
         ▼                ▼
  สอบภาคสนาม ดอยอินทนนท์ (รวมทุกสาขา)
         │
         ▼
  ปัจฉิมนิเทศ + มอบใบประกาศ
```

### 8.2 Workflow: การจัดตาราง 100 หัวข้อ (สาขาดำเนินการ)

```
HQ อนุมัติเปิดสอน
    │
    ▼
ระบบสร้าง 100 sessions อัตโนมัติ (สถานะ: draft)
    │
    ▼
Branch Manager จัดตาราง:
    │
    ├── ❶ กำหนดวัน-เวลา ของแต่ละหัวข้อ
    │       หัวข้อ 1: เสาร์ 25 ส.ค. 09:00-11:30
    │       หัวข้อ 2: เสาร์ 25 ส.ค. 13:00-15:30
    │       หัวข้อ 3: อาทิตย์ 26 ส.ค. 09:00-11:30
    │       ...
    │
    ├── ❷ กำหนดอาจารย์ ของแต่ละหัวข้อ
    │       หัวข้อ 1-15: อ.สุนทร (สาขา 5 — ไม่มีค่ารถ)
    │       หัวข้อ 16-20: อ.วิไล (สาขา 40 — มีค่ารถ 500×5)
    │       หัวข้อ 21-30: อ.สมศรี (สาขา 5 — ไม่มีค่ารถ)
    │       ...
    │
    └── ❸ Session พร้อม → สถานะ: scheduled
            │
            ▼
      ถึงวันเรียน → เช็คชื่อ → สถานะ: completed
            │
            ▼
      ถ้า cross-branch → Auto-create ค่ารถ 500 บาท
```

### 8.3 Workflow: เช็คชื่อรายหัวข้อ

```
Session หัวข้อที่ 1 — วันเสาร์ 25 ส.ค. 09:00
    │
    ▼
เจ้าหน้าที่/พี่เลี้ยง/อาจารย์ เปิดหน้าเช็คชื่อ
    │
    ▼
ระบบแสดงรายชื่อนักศึกษาทั้งหมดของ Opening นี้
    │
    ▼
เช็คชื่อทีละคน: ✅ มา / ❌ ขาด / ⏰ สาย / 📋 ลา
    │
    ▼
บันทึก → ระบบคำนวณ:
    ├── สรุป session นี้: 48 มา / 2 ขาด = 96%
    └── สรุปรายนักศึกษา: นาย ก เข้าเรียนแล้ว 1/100 หัวข้อ (1%)
```

### 8.4 Workflow: เส้นทางการเป็นอาจารย์

```
บุคคลทั่วไป
    │
    ▼
สมัครเรียน KRU (เช่น รุ่น 52 สาขา 5 ภาค ส-อา)
    │
    ▼
เรียน 100 หัวข้อ (เช็คชื่อทุกหัวข้อ)
    │
    ▼
สอบภาคสนาม ดอยอินทนนท์
    │
    ▼
จบ KRU → ได้ใบประกาศ
    │
    ▼
สมัครอบรม AJARIYA (ส่วนกลางจัดเท่านั้น, 3 วัน)
    │
    ▼
จบ AJARIYA (บันทึกรุ่น เช่น รุ่น 27)
    │
    ▼
HQ ขึ้นทะเบียนเป็นอาจารย์สมาธิ
    │
    ▼
กำหนดหลักสูตรที่สอนได้ + สาขาหลัก
    │
    ▼
พร้อมรับมอบหมายสอน (รายหัวข้อ) ที่สาขาใดก็ได้
```

### 8.5 Workflow: เบิกค่ารถอาจารย์ (ต่อ Session)

```
Session หัวข้อที่ 16 — อ.วิไล (สาขาหลัก: 40) → สอนที่สาขา 5
    │
    ▼
สอนเสร็จ → Mark session เป็น "completed"
    │
    ▼
ระบบตรวจสอบ:
    ├── สาขาที่สอน (5) ≠ สาขาหลักอาจารย์ (40)?  → ✅ ใช่
    └── เป็นหลักสูตร KRU?                         → ✅ ใช่ (โดยปริยาย)
    │
    ▼
Auto-create: Transport Claim
    ├── อาจารย์: อ.วิไล
    ├── Session: หัวข้อที่ 16 สาขา 5 รุ่น 52
    ├── จำนวน: 500 บาท
    └── สถานะ: pending
    │
    ▼
HQ อนุมัติ → จ่ายเงิน
```

---

## 9. รายงานและ Dashboard

### 9.1 Dashboard HQ (ส่วนกลาง)

| รายงาน | รายละเอียด |
|--------|-----------|
| **ภาพรวมรุ่นปัจจุบัน** | รุ่น 52: จำนวนสาขาที่เปิด, กี่สาขาภาค จ-ศ vs ส-อา, จำนวนนักศึกษารวม |
| **ความก้าวหน้ารายสาขา** | แต่ละสาขาสอนไปแล้วกี่หัวข้อจาก 100, % completed |
| **อัตราเข้าเรียนรวม** | เฉลี่ย attendance rate ทุกสาขา, สาขาที่ต่ำกว่าเกณฑ์ |
| **ทะเบียนอาจารย์** | จำนวนอาจารย์ทั้งหมด, แยกตามรุ่นอาจาริยสา |
| **ค่ารถอาจารย์** | สรุปรายเดือน, Top อาจารย์สอนข้ามสาขา, งบประมาณที่ใช้ |
| **Approval Queue** | คำขอเปิดสอนที่รออนุมัติ |
| **การเงินรวม** | รายรับ-จ่ายรวมทุกสาขา |

### 9.2 Dashboard สาขา

| รายงาน | รายละเอียด |
|--------|-----------|
| **ตาราง 100 หัวข้อ** | Calendar/Gantt view แสดง 100 หัวข้อ, สี = อาจารย์, สถานะ |
| **Attendance Board** | ตาราง นักศึกษา × 100 หัวข้อ (✅/❌/⏰/📋) |
| **สรุปนักศึกษา** | จำนวนหัวข้อที่เข้าเรียน, % เข้าเรียน, นักศึกษาที่เสี่ยงไม่จบ |
| **ตารางอาจารย์** | อาจารย์แต่ละคนสอนหัวข้อไหนบ้าง, กี่ครั้ง, ค่ารถรวม |
| **การเงินสาขา** | รายรับ-จ่าย, งบคงเหลือ |

### 9.3 Dashboard นักศึกษา (Portal)

| รายงาน | รายละเอียด |
|--------|-----------|
| **ตารางเรียนของฉัน** | 100 หัวข้อ + วัน-เวลา + อาจารย์ + สถานะ (เรียนแล้ว/ยังไม่ถึง) |
| **สถิติ Attendance** | เข้าเรียนแล้ว X/100, ขาด Y, สาย Z, ลา W |
| **Progress Bar** | แถบแสดงความก้าวหน้า |

---

## 10. ขอบเขต POC

### 10.1 สาขาทดสอบ

| Tenant | สาขา | ภาคเรียน KRU | หลักสูตรอื่นที่เปิด |
|--------|------|-------------|-------------------|
| **HQ** | มูลนิธิฯ วัดธรรมมงคล | สร้างรุ่น + อนุมัติ + จัด AJARIYA | - |
| **สาขา A** | สาขา 5 วัดดอนรัก จ.สงขลา | **ภาค ส-อา** | CHIN1, WITUN |
| **สาขา B** | สาขา 40 วัดตรีรัตนาราม จ.ระยอง | **ภาค จ-ศ** | CHIN1 |
| **สาขา C** | สาขา 193 วัดคุณหญิงส้มจีน จ.ปทุมธานี | (**ไม่อนุมัติ** — ทดสอบ reject flow) | WITHI, WITUN |

### 10.2 ข้อมูลทดสอบ

| รายการ | จำนวน |
|--------|-------|
| หัวข้อ Master (Topic) | 100 หัวข้อ |
| รุ่น KRU | รุ่นที่ 52 (Global) |
| Branch Opening | 3 คำขอ (2 อนุมัติ, 1 ไม่อนุมัติ) |
| Sessions | 200 records (2 สาขา × 100 หัวข้อ) |
| อาจารย์สมาธิ | 10 คน (5 คนสอนข้ามสาขา) |
| นักศึกษา | 100 คน (50 ต่อสาขา) |
| Attendance records | 5,000+ records (50 นศ × 100 หัวข้อ ทดสอบบางส่วน) |
| ค่ารถ Transport Claims | 20 รายการ |

### 10.3 เป้าหมาย POC (Success Criteria)

| # | เป้าหมาย | วิธีทดสอบ |
|---|---------|----------|
| 1 | **Global Batch** — รุ่นเดียวกันทุกสาขา | สร้างรุ่น 52 ที่ HQ → ทุกสาขาเห็นรุ่นเดียวกัน |
| 2 | **Approval Flow** — สาขาขอเปิด → HQ อนุมัติ | สาขา A ขอเปิด → HQ อนุมัติ → 100 sessions สร้างอัตโนมัติ |
| 3 | **Reject Flow** — HQ ไม่อนุมัติ | สาขา C ขอเปิด → HQ ไม่อนุมัติ + ระบุเหตุผล |
| 4 | **Section Type** — ภาค จ-ศ vs ส-อา | สาขา A เปิดภาค ส-อา, สาขา B เปิดภาค จ-ศ → ข้อมูลถูกต้อง |
| 5 | **100 Sessions** — สร้าง 100 หัวข้อ | อนุมัติแล้ว → 100 sessions สร้างจาก topic master |
| 6 | **Per-Session Teacher** — อาจารย์ต่างกันแต่ละหัวข้อ | กำหนด อ.A สอนหัวข้อ 1-15, อ.B สอนหัวข้อ 16-20 |
| 7 | **Per-Session Schedule** — วัน-เวลาต่างกันแต่ละหัวข้อ | หัวข้อ 1 เรียนเสาร์เช้า, หัวข้อ 2 เรียนเสาร์บ่าย |
| 8 | **Per-Session Attendance** — เช็คชื่อรายหัวข้อ | เช็คชื่อ 50 คน ในหัวข้อที่ 1 → สรุป 48 มา / 2 ขาด |
| 9 | **Student Attendance Summary** — สรุปรายนักศึกษา | นาย ก เข้าเรียน 85/100 หัวข้อ = 85% |
| 10 | **Cross-Branch Transport** — ค่ารถ per session | อ.วิไล (สาขา 40) สอนหัวข้อ 16 ที่สาขา 5 → 500 บาท |
| 11 | **No Transport Same Branch** — ไม่มีค่ารถ | อ.สุนทร (สาขา 5) สอนที่สาขา 5 → ไม่มีค่ารถ |
| 12 | **Data Isolation** — สาขาเห็นเฉพาะข้อมูลตน | Staff สาขา A ไม่เห็น sessions สาขา B |
| 13 | **HQ Dashboard** — ดูภาพรวมทุกสาขา | Dashboard แสดงทุกสาขา + ความก้าวหน้า + attendance |
| 14 | **Teacher Registration** — HQ ขึ้นทะเบียน | เฉพาะ HQ เท่านั้น |
| 15 | **Data Sync** — Import จาก samathi101.com | Import สาขา + คอร์ส |

---

## 11. Tech Stack

| ส่วน | เทคโนโลยี |
|------|----------|
| **ERP** | Odoo 17 Community (หรือ Enterprise) |
| **Database** | PostgreSQL 15+ |
| **Custom Modules** | willpower_branch, willpower_course, willpower_kru, willpower_student, willpower_teacher, willpower_finance |
| **Data Sync** | Python script + Odoo XML-RPC / REST API |
| **Deployment (POC)** | Docker Compose (Odoo + PostgreSQL) |
| **Portal** | Odoo Website + Portal |

---

## 12. แผน Implementation (POC 7 สัปดาห์)

| สัปดาห์ | งาน | Deliverable |
|---------|-----|-------------|
| **1** | ติดตั้ง Odoo, Multi-Company (HQ + 3 สาขา), Import สาขาจาก samathi101.com | Instance พร้อมใช้ |
| **2** | willpower_course: หลักสูตร master + **Topic Master 100 หัวข้อ** + รุ่น KRU Global | Master data ครบ |
| **3** | willpower_kru: **Branch Opening (approval flow)** + **Auto-generate 100 sessions** + ภาค จ-ศ / ส-อา | เปิดสอน KRU ครบ workflow |
| **4** | willpower_kru: **Session scheduling** (วัน-เวลา-อาจารย์ รายหัวข้อ) + **Attendance เช็คชื่อรายหัวข้อ** | จัดตาราง + เช็คชื่อทำงานได้ |
| **5** | willpower_student + willpower_teacher: ลงทะเบียน, ทะเบียนอาจารย์, **ค่ารถ auto per session** | นักศึกษา + อาจารย์ครบ |
| **6** | สิทธิ์ (Record Rules), willpower_finance, Data Sync script | สิทธิ์ + การเงิน |
| **7** | **Dashboard + Reports** (Attendance Board, Progress, ค่ารถ), Integration Test, UAT, สรุป POC | Demo + รายงาน POC |

---

## 13. ความเสี่ยงและข้อจำกัด

| ความเสี่ยง | ผลกระทบ | แนวทางแก้ |
|-----------|---------|----------|
| samathi101.com ไม่มี public API | ไม่สามารถ sync อัตโนมัติ | Web scraping / manual import |
| 300+ สาขา × 100 sessions = 30,000+ records ต่อรุ่น | Performance concern | Index ที่ดี, Lazy loading, ทดสอบ load |
| 300+ สาขา × 50 นศ × 100 หัวข้อ = 1.5M attendance records ต่อรุ่น | Database size | Partitioning, Archive รุ่นเก่า |
| 100 หัวข้อ × วัน-เวลา-อาจารย์ต่างกัน = UI ซับซ้อน | UX ไม่ดี | Calendar/Gantt view, Bulk edit tools |
| อาจารย์สอนหลายสาขา → Record Rules ซับซ้อน | อาจารย์มองไม่เห็นข้อมูลบางที่ | Computed field teacher_branch_ids |
| เช็คชื่อ 50+ คน ทุกหัวข้อ → เสียเวลา | Staff ไม่อยากใช้ระบบ | Bulk check-in, QR code, default "present" |

---

> **เอกสารฉบับนี้ใช้เป็นจุดเริ่มต้น POC v2**  
> หากต้องการรายละเอียดเพิ่มเติม เช่น ERD เต็มรูปแบบ, Odoo module scaffolding,  
> Docker Compose setup, หรือตัวอย่าง 100 หัวข้อจริง สามารถขอเพิ่มเติมได้
