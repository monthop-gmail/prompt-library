# Proof of Concept: Odoo Dormitory & Room Management
## ระบบบริหารหอพัก/ห้องพัก บน Odoo — Multi-Tenant Architecture

> **Version:** 1.0 | **Date:** February 2026 | **Status:** Draft

---

## 1. Executive Summary

เอกสารนี้นำเสนอ Proof of Concept (POC) สำหรับ **ระบบบริหารหอพักและห้องพัก** ที่พัฒนาบนแพลตฟอร์ม Odoo ด้วยสถาปัตยกรรม Multi-Tenant โดยออกแบบมาเพื่อรองรับ **ผู้ประกอบการหอพักหลายราย** บน Odoo instance เดียว พร้อมการแยกข้อมูลอย่างสมบูรณ์ branding อิสระ และความสามารถในการขยายตัว

**เป้าหมายหลัก:** พิสูจน์ว่า Odoo สามารถปรับแต่งเพื่อจัดการ lifecycle ของหอพักตั้งแต่ต้นจนจบ ทั้งการจัดการผู้เช่า การเรียกเก็บเงิน การซ่อมบำรุง และรายงาน โดยรองรับเจ้าของหอพักหลายรายบน infrastructure เดียว

| Aspect | Detail |
|--------|--------|
| Platform | Odoo 17 Community / Enterprise |
| Architecture | Multi-Tenant (Multi-Company in Odoo) |
| Target Users | เจ้าของหอพัก, ผู้จัดการ, พนักงานต้อนรับ, ผู้เช่า |
| Core Modules | Custom Dormitory Module + Odoo Accounting, Invoicing, Maintenance |
| Deployment | Docker / On-Premise / Cloud (AWS/GCP) |
| Timeline (POC) | 8–12 Weeks |

---

## 2. Multi-Tenant Architecture Design

Odoo รองรับ Multi-Company architecture แบบ native ซึ่งเราใช้เป็นรากฐานของ multi-tenancy โดยเจ้าของหอพัก/ผู้ประกอบการแต่ละรายจะถูกแทนด้วย **Company แยกกัน** ภายใน Odoo instance เดียว

### 2.1 Tenant Isolation Strategy

| Strategy | Implementation | Data Isolation |
|----------|---------------|----------------|
| **Odoo Multi-Company** | แต่ละเจ้าของหอพัก = 1 Odoo Company | Record rules บังคับแยกข้อมูลตาม company |
| **Database-Level** | Single DB, `company_id` บนทุก record | `ir.rule` กรองข้อมูลให้ user เห็นเฉพาะข้อมูล company ตัวเอง |
| **UI-Level** | Company switcher บน Odoo navbar | UI ปรับตาม company ที่เลือก |
| **Alternative: Multi-DB** | แยก database ต่อ tenant (optional) | แยกข้อมูลสมบูรณ์; จัดการผ่าน `odoo.conf` หรือ Nginx proxy |

### 2.2 Recommended: Multi-Company (Single DB)

- Single Odoo instance พร้อม PostgreSQL database เดียว
- เจ้าของหอพักแต่ละราย = `res.company` record แยก
- Custom models ทั้งหมดมี `company_id` field พร้อม record rules
- Master data (เช่น ประเภทห้อง, อัตราค่าสาธารณูปโภค) ตั้งค่าแยกต่อ company
- การบริหารจัดการแบบรวมศูนย์ พร้อม access control ต่อ company
- รองรับ 50–100+ tenant บน instance เดียว

### 2.3 Alternative: Multi-Database Approach

สำหรับกรณีที่ต้องการแยกข้อมูลอย่างเข้มงวด (เช่น สภาพแวดล้อมที่มีข้อกำหนดด้านกฎหมาย) Odoo รองรับหลาย database ผ่าน `dbfilter`:

```ini
# odoo.conf
dbfilter = ^%h$
# tenant1.example.com -> db: tenant1
# tenant2.example.com -> db: tenant2
```

### 2.4 Security & Access Control

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| Record Rules | `ir.rule` + `company_id` filter | ทุก record ถูกกรองตาม company ของ user |
| Access Rights | `res.groups` per module | Role-based: Owner, Manager, Front Desk, Tenant (portal) |
| Portal Access | Odoo Portal | ผู้เช่า login ดูใบแจ้งหนี้, แจ้งซ่อม |
| API Security | OAuth2 / API Keys | External integrations ยืนยันตัวตนต่อ company |

---

## 3. Data Model Design

Custom Odoo module (`dormitory`) ประกอบด้วย models หลักดังนี้ ทุก model มี `company_id` สำหรับ multi-tenant isolation

### 3.1 Core Models

| Model Name | Description | Key Fields |
|------------|-------------|------------|
| `dormitory.building` | อาคาร/หอพัก | `name`, `address`, `company_id`, `floor_count`, `building_type`, `owner_id` |
| `dormitory.floor` | ชั้นภายในอาคาร | `name`, `building_id`, `floor_number`, `company_id` |
| `dormitory.room.type` | ประเภท/หมวดห้อง | `name`, `default_price`, `description`, `company_id` |
| `dormitory.room` | ห้องพักแต่ละห้อง | `name`, `building_id`, `floor_id`, `room_type_id`, `status`, `price`, `company_id` |
| `dormitory.tenant` | โปรไฟล์ผู้เช่า | `partner_id`, `emergency_contact`, `id_card`, `move_in_date`, `company_id` |
| `dormitory.contract` | สัญญาเช่า | `tenant_id`, `room_id`, `start_date`, `end_date`, `monthly_rent`, `deposit`, `state`, `company_id` |
| `dormitory.invoice` | ใบแจ้งหนี้รายเดือน (extends `account.move`) | `contract_id`, `period`, `utility_charges`, `total`, `company_id` |
| `dormitory.meter.reading` | บันทึกมิเตอร์สาธารณูปโภค | `room_id`, `type` (water/electric), `reading_date`, `value`, `company_id` |
| `dormitory.maintenance` | คำขอซ่อมบำรุง | `room_id`, `tenant_id`, `description`, `priority`, `state`, `assigned_to`, `company_id` |
| `dormitory.payment` | บันทึกการชำระเงิน | `invoice_id`, `amount`, `payment_date`, `method`, `company_id` |

### 3.2 Entity Relationship Overview

```
Building (อาคาร)
  └── Floor (ชั้น)
       └── Room (ห้อง) ── Room Type (ประเภทห้อง)
            ├── Meter Reading (มิเตอร์)
            ├── Maintenance Request (แจ้งซ่อม)
            └── Contract (สัญญาเช่า) ── Tenant (ผู้เช่า ↔ res.partner)
                 └── Invoice (ใบแจ้งหนี้)
                      └── Payment (การชำระเงิน)
```

### 3.3 Room Status State Machine

```
                    ┌─────────────┐
         ┌─────────│  available   │←────────┐
         │         └──────┬──────┘          │
         │                │                 │
         ▼                ▼                 │
  ┌─────────────┐  ┌─────────────┐   ┌─────────────┐
  │ maintenance  │  │  reserved   │   │  inactive    │
  └──────┬──────┘  └──────┬──────┘   └─────────────┘
         │                │
         │                ▼
         │         ┌─────────────┐
         └────────→│  occupied    │
                   └─────────────┘
```

| Status | Description | Transitions To |
|--------|-------------|---------------|
| `available` | พร้อมสำหรับผู้เช่าใหม่ | `reserved`, `maintenance` |
| `reserved` | จองแล้ว รอเข้าพัก | `occupied`, `available` |
| `occupied` | ผู้เช่าพักอยู่ปัจจุบัน | `available` (checkout), `maintenance` |
| `maintenance` | กำลังซ่อม/ปรับปรุง | `available` |
| `inactive` | ปิดใช้งาน | `available` |

---

## 4. Custom Module Structure

```
dormitory/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── building.py
│   ├── floor.py
│   ├── room.py
│   ├── room_type.py
│   ├── tenant.py
│   ├── contract.py
│   ├── meter_reading.py
│   ├── maintenance.py
│   └── payment.py
├── views/
│   ├── building_views.xml
│   ├── room_views.xml
│   ├── tenant_views.xml
│   ├── contract_views.xml
│   ├── dashboard_views.xml
│   └── menu.xml
├── security/
│   ├── ir.model.access.csv
│   └── security_rules.xml
├── data/
│   └── demo_data.xml
├── wizard/
│   ├── generate_invoice_wizard.py
│   └── meter_reading_wizard.py
├── report/
│   ├── occupancy_report.py
│   └── revenue_report.xml
├── controllers/
│   ├── __init__.py
│   ├── portal.py
│   └── api.py
└── static/
    └── description/
        └── icon.png
```

### 4.1 `__manifest__.py`

```python
# -*- coding: utf-8 -*-
{
    'name': 'Dormitory Management',
    'version': '17.0.1.0.0',
    'category': 'Real Estate',
    'summary': 'Multi-Tenant Dormitory & Room Management System',
    'description': """
        ระบบบริหารหอพักและห้องพัก แบบ Multi-Tenant
        - จัดการอาคาร ชั้น ห้องพัก
        - จัดการผู้เช่าและสัญญาเช่า
        - คิดค่าเช่าและค่าสาธารณูปโภค
        - แจ้งซ่อมและติดตามงาน
        - Dashboard และรายงาน
    """,
    'author': 'Your Company',
    'website': 'https://www.yourcompany.com',
    'depends': ['base', 'mail', 'account', 'portal', 'maintenance'],
    'data': [
        'security/ir.model.access.csv',
        'security/security_rules.xml',
        'views/menu.xml',
        'views/building_views.xml',
        'views/room_views.xml',
        'views/tenant_views.xml',
        'views/contract_views.xml',
        'views/dashboard_views.xml',
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
```

---

## 5. Key Features & Functional Scope

### 5.1 Building & Room Management

- ลงทะเบียนอาคารพร้อมที่อยู่, พิกัด GPS, รูปภาพ, ข้อมูลกรรมสิทธิ์
- กำหนดชั้นและผังห้องต่ออาคาร
- ตั้งค่าประเภทห้องพร้อมราคาเริ่มต้น (เช่น Standard, Deluxe, Suite)
- Room Board/Kanban แสดงสถานะห้องพร้อมรหัสสี
- Wizard สร้างห้องจำนวนมากสำหรับ setup เริ่มต้น

### 5.2 Tenant Lifecycle Management

- ลงทะเบียนผู้เช่าพร้อมตรวจสอบบัตรประชาชนและอัปโหลดเอกสาร
- **Move-in workflow:** จอง → ทำสัญญา → เก็บเงินประกัน → เปิดใช้งาน
- **Move-out workflow:** แจ้งออก → ตรวจสอบห้อง → คืนเงินประกัน → ปิดสัญญา
- Tenant Portal สำหรับ self-service (ดูใบแจ้งหนี้, แจ้งซ่อม, อัปเดตข้อมูล)
- บันทึกข้อมูลผู้ติดต่อฉุกเฉินและผู้ค้ำประกัน

### 5.3 Contract Management

| Feature | Description |
|---------|-------------|
| Contract Types | รายเดือน, 6 เดือน, รายปี พร้อมตัวเลือกต่อสัญญาอัตโนมัติ |
| Pricing Rules | ค่าเช่าพื้นฐาน + สาธารณูปโภค, ตั้งค่าต่อประเภทห้องหรือห้องเดี่ยว |
| Deposit Management | ติดตามการเก็บ, ค้าง, และคืนเงินประกัน พร้อมกฎการหักเงิน |
| Auto-Renewal | Scheduled action ต่อสัญญาที่จะหมดอายุ พร้อมแจ้งเตือน |
| E-Signature | เชื่อมต่อ Odoo Sign สำหรับลงนามสัญญาดิจิทัล |

### 5.4 Billing & Invoicing

- สร้างใบแจ้งหนี้รายเดือนอัตโนมัติผ่าน scheduled action (cron)
- คิดค่าสาธารณูปโภค: บันทึกมิเตอร์น้ำ/ไฟ, คำนวณค่าใช้จ่าย
- อัตราค่าสาธารณูปโภคตั้งค่าต่อ company (รองรับราคาแบบขั้นบันได)
- เชื่อมต่อ Odoo Accounting (`account.move`) สำหรับบัญชีครบวงจร
- หลายช่องทางชำระเงิน: เงินสด, โอนธนาคาร, QR Payment, บัตรเครดิต
- สร้าง **PromptPay QR Code** สำหรับระบบธนาคารไทย
- ติดตามใบแจ้งหนี้ค้างชำระพร้อมแจ้งเตือนอัตโนมัติ

### 5.5 Maintenance & Requests

- ผู้เช่าแจ้งซ่อมผ่าน Portal หรือ Front Desk สร้างให้
- ระดับความสำคัญ: Low, Medium, High, Urgent
- มอบหมายงานให้ช่างพร้อมติดตาม SLA
- อัปโหลดรูปภาพประกอบ
- Workflow: `New → In Progress → Done / Cancelled`

### 5.6 Dashboard & Reporting

| Report | Metrics |
|--------|---------|
| Occupancy Dashboard | อัตราครอบครอง, ห้องว่าง, สัญญาจะหมดอายุ, แนวโน้มรายได้ |
| Revenue Report | รายได้รายเดือนแยกตามอาคาร, ประเภทห้อง, ช่องทางชำระเงิน |
| Tenant Report | ผู้เช่าปัจจุบัน, แนวโน้มเข้า/ออก, ยอดค้างชำระ |
| Maintenance Report | คำขอค้าง, เวลาแก้ไขเฉลี่ย, แยกตามหมวด |
| Financial Summary | กำไร-ขาดทุนต่ออาคาร, ต่อ company, มุมมองรวม |

---

## 6. User Roles & Permissions

| Role | Access Level | Capabilities |
|------|-------------|-------------|
| **System Admin** | Super Admin (ทุก company) | เข้าถึงทั้งหมด, สร้าง company/tenant, ตั้งค่าระบบ |
| **Dormitory Owner** | Company Admin | เข้าถึงทั้งหมดภายใน company ตัวเอง, ดูรายงาน, จัดการตั้งค่า |
| **Property Manager** | Manager Group | จัดการอาคาร, ห้อง, สัญญา, ใบแจ้งหนี้ภายใน company |
| **Front Desk Staff** | User Group | Check-in/out, สร้างคำขอ, บันทึกชำระเงิน, ดูห้อง |
| **Maintenance Staff** | Limited User | ดูและอัปเดตเฉพาะงานซ่อมที่ได้รับมอบหมาย |
| **Tenant (Portal)** | Portal User | ดูใบแจ้งหนี้/สัญญาของตัวเอง, แจ้งซ่อม |

Security ใช้ `ir.rule` ของ Odoo พร้อม `company_id` domain filter เพื่อให้ user เข้าถึงเฉพาะข้อมูลของ company ที่ตนเองสังกัด

---

## 7. Technical Specification

### 7.1 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| ERP Platform | Odoo | 17.0 (Community or Enterprise) |
| Backend | Python | 3.10+ |
| Frontend | Odoo OWL Framework | Odoo 17 built-in |
| Database | PostgreSQL | 14+ |
| Web Server | Nginx (reverse proxy) | Latest stable |
| Containerization | Docker + Docker Compose | Latest stable |
| OS | Ubuntu Server | 22.04 LTS |

### 7.2 Infrastructure Architecture (Docker Compose)

```yaml
# docker-compose.yml
version: '3.8'
services:
  odoo:
    image: odoo:17.0
    ports:
      - "8069:8069"
    volumes:
      - ./addons:/mnt/extra-addons
      - ./config:/etc/odoo
      - odoo-data:/var/lib/odoo
    environment:
      - HOST=db
      - USER=odoo
      - PASSWORD=odoo
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: odoo
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
    volumes:
      - pg-data:/var/lib/postgresql/data

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - odoo

volumes:
  odoo-data:
  pg-data:
```

### 7.3 REST API Endpoints

สำหรับ external integrations (mobile app, IoT, third-party):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/rooms` | GET | รายการห้องพร้อมสถานะ (กรองตาม company) |
| `/api/v1/rooms/<id>/status` | PATCH | อัปเดตสถานะห้อง |
| `/api/v1/tenants` | GET / POST | รายการหรือสร้างผู้เช่า |
| `/api/v1/contracts` | GET / POST | รายการหรือสร้างสัญญา |
| `/api/v1/invoices` | GET | รายการใบแจ้งหนี้ตามผู้เช่า/ห้อง |
| `/api/v1/maintenance` | GET / POST | รายการหรือสร้างคำขอซ่อม |
| `/api/v1/meter-readings` | POST | บันทึกค่ามิเตอร์ (รองรับ batch) |
| `/api/v1/payments` | POST | บันทึกการชำระเงิน |

### 7.4 Integration Points

| Integration | Method | Purpose |
|-------------|--------|---------|
| **Thai Banking (PromptPay)** | QR Code Generation | สร้าง QR code ชำระเงินสำหรับผู้เช่า |
| **LINE Notify / LINE OA** | REST API | ส่งการแจ้งเตือนผ่าน LINE |
| **SMS Gateway** | REST API | แจ้งเตือนชำระเงิน, สัญญาจะหมดอายุ |
| **IoT Smart Lock** | MQTT / REST | ควบคุมกุญแจประตูระยะไกล, จัดการ key card |
| **IoT Meter Reading** | MQTT / REST | เก็บข้อมูลมิเตอร์น้ำ/ไฟอัตโนมัติ |
| **Accounting** | Odoo Built-in | Journal entries, ภาษี, กำไร-ขาดทุน |

---

## 8. Sample Model Code

### 8.1 Room Model — `models/room.py`

```python
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class DormitoryRoom(models.Model):
    _name = 'dormitory.room'
    _description = 'Dormitory Room'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'building_id, floor_id, name'

    name = fields.Char(
        string='Room Number', required=True, tracking=True)
    building_id = fields.Many2one(
        'dormitory.building', string='Building',
        required=True, ondelete='cascade')
    floor_id = fields.Many2one(
        'dormitory.floor', string='Floor', ondelete='set null')
    room_type_id = fields.Many2one(
        'dormitory.room.type', string='Room Type')
    price = fields.Float(
        string='Monthly Rent', tracking=True)
    status = fields.Selection([
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('occupied', 'Occupied'),
        ('maintenance', 'Maintenance'),
        ('inactive', 'Inactive'),
    ], default='available', tracking=True, string='Status')
    current_tenant_id = fields.Many2one(
        'dormitory.tenant', string='Current Tenant',
        compute='_compute_current_tenant', store=True)
    contract_ids = fields.One2many(
        'dormitory.contract', 'room_id', string='Contracts')
    meter_reading_ids = fields.One2many(
        'dormitory.meter.reading', 'room_id', string='Meter Readings')
    maintenance_ids = fields.One2many(
        'dormitory.maintenance', 'room_id', string='Maintenance Requests')

    # Multi-tenant field
    company_id = fields.Many2one(
        'res.company', string='Company',
        default=lambda self: self.env.company, required=True)
    active = fields.Boolean(default=True)

    _sql_constraints = [
        ('unique_room_per_building',
         'UNIQUE(name, building_id, company_id)',
         'Room number must be unique per building!')
    ]

    @api.depends('contract_ids', 'contract_ids.state')
    def _compute_current_tenant(self):
        for room in self:
            active_contract = room.contract_ids.filtered(
                lambda c: c.state == 'active'
            )[:1]
            room.current_tenant_id = (
                active_contract.tenant_id if active_contract else False
            )

    def action_set_available(self):
        self.write({'status': 'available'})

    def action_set_maintenance(self):
        self.write({'status': 'maintenance'})

    def action_set_occupied(self):
        self.write({'status': 'occupied'})
```

### 8.2 Contract Model — `models/contract.py`

```python
from odoo import models, fields, api
from odoo.exceptions import UserError
from dateutil.relativedelta import relativedelta


class DormitoryContract(models.Model):
    _name = 'dormitory.contract'
    _description = 'Dormitory Lease Contract'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'start_date desc'

    name = fields.Char(
        string='Contract Number', readonly=True,
        default=lambda self: self.env['ir.sequence'].next_by_code(
            'dormitory.contract'))
    tenant_id = fields.Many2one(
        'dormitory.tenant', string='Tenant',
        required=True, tracking=True)
    room_id = fields.Many2one(
        'dormitory.room', string='Room',
        required=True, tracking=True)
    start_date = fields.Date(
        string='Start Date', required=True)
    end_date = fields.Date(
        string='End Date', required=True)
    monthly_rent = fields.Float(
        string='Monthly Rent', required=True, tracking=True)
    deposit = fields.Float(
        string='Deposit Amount', tracking=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('expiring', 'Expiring Soon'),
        ('expired', 'Expired'),
        ('terminated', 'Terminated'),
    ], default='draft', tracking=True, string='Status')
    invoice_ids = fields.One2many(
        'dormitory.invoice', 'contract_id', string='Invoices')
    auto_renew = fields.Boolean(
        string='Auto Renew', default=False)

    company_id = fields.Many2one(
        'res.company', string='Company',
        default=lambda self: self.env.company, required=True)

    def action_confirm(self):
        for contract in self:
            if contract.room_id.status != 'available':
                raise UserError(
                    f'Room {contract.room_id.name} is not available.')
            contract.write({'state': 'confirmed'})
            contract.room_id.write({'status': 'reserved'})

    def action_activate(self):
        for contract in self:
            contract.write({'state': 'active'})
            contract.room_id.write({'status': 'occupied'})

    def action_terminate(self):
        for contract in self:
            contract.write({'state': 'terminated'})
            contract.room_id.write({'status': 'available'})

    @api.model
    def _cron_check_expiring_contracts(self):
        """Scheduled action: mark contracts expiring within 30 days"""
        expiring_date = fields.Date.today() + relativedelta(days=30)
        contracts = self.search([
            ('state', '=', 'active'),
            ('end_date', '<=', expiring_date),
        ])
        contracts.write({'state': 'expiring'})
        # Send notifications...
```

### 8.3 Multi-Company Record Rule — `security/security_rules.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Room: Multi-Company Rule -->
    <record id="dormitory_room_company_rule" model="ir.rule">
        <field name="name">Dormitory Room: Multi-Company</field>
        <field name="model_id" ref="model_dormitory_room"/>
        <field name="domain_force">
            ['|', ('company_id', '=', False),
                  ('company_id', 'in', company_ids)]
        </field>
        <field name="global" eval="True"/>
    </record>

    <!-- Contract: Multi-Company Rule -->
    <record id="dormitory_contract_company_rule" model="ir.rule">
        <field name="name">Dormitory Contract: Multi-Company</field>
        <field name="model_id" ref="model_dormitory_contract"/>
        <field name="domain_force">
            ['|', ('company_id', '=', False),
                  ('company_id', 'in', company_ids)]
        </field>
        <field name="global" eval="True"/>
    </record>

    <!-- Tenant: Multi-Company Rule -->
    <record id="dormitory_tenant_company_rule" model="ir.rule">
        <field name="name">Dormitory Tenant: Multi-Company</field>
        <field name="model_id" ref="model_dormitory_tenant"/>
        <field name="domain_force">
            ['|', ('company_id', '=', False),
                  ('company_id', 'in', company_ids)]
        </field>
        <field name="global" eval="True"/>
    </record>

    <!-- Building: Multi-Company Rule -->
    <record id="dormitory_building_company_rule" model="ir.rule">
        <field name="name">Dormitory Building: Multi-Company</field>
        <field name="model_id" ref="model_dormitory_building"/>
        <field name="domain_force">
            ['|', ('company_id', '=', False),
                  ('company_id', 'in', company_ids)]
        </field>
        <field name="global" eval="True"/>
    </record>
</odoo>
```

### 8.4 Access Rights — `security/ir.model.access.csv`

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_dormitory_building_manager,dormitory.building.manager,model_dormitory_building,dormitory.group_dormitory_manager,1,1,1,1
access_dormitory_building_user,dormitory.building.user,model_dormitory_building,dormitory.group_dormitory_user,1,0,0,0
access_dormitory_room_manager,dormitory.room.manager,model_dormitory_room,dormitory.group_dormitory_manager,1,1,1,1
access_dormitory_room_user,dormitory.room.user,model_dormitory_room,dormitory.group_dormitory_user,1,1,0,0
access_dormitory_tenant_manager,dormitory.tenant.manager,model_dormitory_tenant,dormitory.group_dormitory_manager,1,1,1,1
access_dormitory_contract_manager,dormitory.contract.manager,model_dormitory_contract,dormitory.group_dormitory_manager,1,1,1,1
access_dormitory_contract_user,dormitory.contract.user,model_dormitory_contract,dormitory.group_dormitory_user,1,0,0,0
access_dormitory_maintenance_user,dormitory.maintenance.user,model_dormitory_maintenance,dormitory.group_dormitory_user,1,1,1,0
access_dormitory_meter_reading_user,dormitory.meter.reading.user,model_dormitory_meter_reading,dormitory.group_dormitory_user,1,1,1,0
access_dormitory_payment_manager,dormitory.payment.manager,model_dormitory_payment,dormitory.group_dormitory_manager,1,1,1,1
```

### 8.5 API Controller — `controllers/api.py`

```python
from odoo import http
from odoo.http import request
import json


class DormitoryAPI(http.Controller):

    @http.route('/api/v1/rooms', type='json', auth='user', methods=['GET'])
    def get_rooms(self, building_id=None, status=None):
        domain = []
        if building_id:
            domain.append(('building_id', '=', int(building_id)))
        if status:
            domain.append(('status', '=', status))

        rooms = request.env['dormitory.room'].search(domain)
        return [{
            'id': r.id,
            'name': r.name,
            'building': r.building_id.name,
            'floor': r.floor_id.name or '',
            'type': r.room_type_id.name or '',
            'price': r.price,
            'status': r.status,
            'tenant': r.current_tenant_id.partner_id.name or None,
        } for r in rooms]

    @http.route('/api/v1/maintenance', type='json',
                auth='user', methods=['POST'])
    def create_maintenance(self, **kwargs):
        vals = {
            'room_id': kwargs.get('room_id'),
            'tenant_id': kwargs.get('tenant_id'),
            'description': kwargs.get('description'),
            'priority': kwargs.get('priority', 'medium'),
        }
        request_obj = request.env['dormitory.maintenance'].create(vals)
        return {
            'id': request_obj.id,
            'state': request_obj.state,
            'message': 'Maintenance request created successfully',
        }
```

---

## 9. POC Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1:** Setup & Core Models | Week 1–2 | Docker environment, module skeleton, Building/Room/Floor models, basic views |
| **Phase 2:** Tenant & Contract | Week 3–4 | Tenant registration, contract workflow, room status automation |
| **Phase 3:** Billing & Payments | Week 5–6 | Invoice generation, meter reading, utility calculation, payment recording |
| **Phase 4:** Multi-Tenant Config | Week 7–8 | Multi-company setup, record rules, role-based access, demo data 3 companies |
| **Phase 5:** Portal & Notifications | Week 9–10 | Tenant portal, LINE/SMS notifications, maintenance request flow |
| **Phase 6:** Dashboard & Testing | Week 11–12 | Dashboard, reports, UAT testing, performance testing, documentation |

### Milestones

```
Week 2  ─── Core models & views working
Week 4  ─── Complete tenant lifecycle demo
Week 6  ─── ★ Stakeholder Review (billing flow complete)
Week 8  ─── Multi-tenant isolation verified
Week 10 ─── Portal & integrations ready
Week 12 ─── ★ Final POC Delivery & Demo
```

---

## 10. POC Success Criteria

| Criteria | Target | Measurement |
|----------|--------|-------------|
| Multi-Tenant Isolation | 100% data isolation ระหว่าง company | ไม่มี cross-company data leakage ในทุก view และ API |
| Core Workflow | End-to-end tenant lifecycle | ตั้งแต่ลงทะเบียนจนถึง move-out พร้อมการเรียกเก็บเงินครบ |
| Invoice Accuracy | 100% คำนวณถูกต้อง | ค่าเช่า + สาธารณูปโภค ตรงกับจำนวนที่คาดหวัง |
| User Roles | ทั้ง 6 roles ทำงานได้ | แต่ละ role เห็นเฉพาะข้อมูลและ action ที่อนุญาต |
| Performance | < 2s page load กับ 1,000+ ห้อง | Load test ด้วยข้อมูลจำลอง |
| Portal Access | ผู้เช่า self-service ได้ | ดูใบแจ้งหนี้, แจ้งซ่อม, อัปเดตข้อมูล |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Performance ลดลงเมื่อมี tenant มาก | High | Database indexing, caching, async report generation |
| Record rules ซับซ้อน | Medium | ทดสอบอย่างละเอียด, automated test suite สำหรับ isolation |
| ความเข้ากันได้เมื่อ upgrade Odoo version | Medium | ตามมาตรฐาน Odoo coding, แก้ไข core น้อยที่สุด |
| ข้อกำหนด Thai localization | Low | ใช้ Thai localization module ที่มีอยู่, config ภาษีเอง |
| User adoption resistance | Medium | UI ใช้งานง่าย, จัดอบรม, portal รองรับ mobile |

---

## 12. Recommended Next Steps

1. **Environment Setup** — ติดตั้ง Docker-based Odoo 17 development environment พร้อม PostgreSQL
2. **Module Scaffolding** — สร้างโครงสร้าง module ด้วย `odoo scaffold dormitory ./addons`
3. **Data Model Implementation** — พัฒนา core models พร้อม `company_id` และ record rules
4. **Demo Data** — สร้าง 3 sample companies พร้อมอาคาร ห้อง และผู้เช่า
5. **Stakeholder Review** — นำเสนอ POC ที่ทำงานได้ ณ Week 6 milestone เพื่อรับ feedback
6. **Production Planning** — จากผลลัพธ์ POC วางแผน production deployment timeline และงบประมาณ

---

> **Document End** | POC: Odoo Dormitory Management — Multi-Tenant Architecture | v1.0
