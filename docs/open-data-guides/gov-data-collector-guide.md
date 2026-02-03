# 🏛️ Government Data Collector Agent
## คู่มือ Prompt สำหรับรวบรวมข้อมูลภาครัฐ + จัดเก็บเป็น Projects ด้วย Claude Artifacts

---

## ภาพรวมระบบ

```
เว็บไซต์หน่วยงานรัฐ ──┐
                        │
data.go.th (CKAN API) ──┼──▶ [Scraper Agent] ──▶ [Cleaner / Parser] ──▶ [Project Storage]
                        │         │                      │                     │
BOT / SEC / DBD APIs ───┘         │                      │                     │
                            Claude AI ช่วย          จัด schema           Dashboard
                           วิเคราะห์โครงสร้าง       ทำความสะอาด          ค้นหา / Export
```

### แหล่งข้อมูลภาครัฐไทยที่สำคัญ

| แหล่งข้อมูล | URL | ประเภท | วิธีดึงข้อมูล |
|---|---|---|---|
| **data.go.th** | data.go.th | Open Data กลาง | CKAN API |
| **ธปท. (BOT)** | bot.or.th | การเงิน / อัตราแลกเปลี่ยน | BOT API |
| **กลต. (SEC)** | sec.or.th | ตลาดทุน / กองทุน | SEC API + Scrape |
| **กรมพัฒนาธุรกิจ (DBD)** | opendata.dbd.go.th | ข้อมูลนิติบุคคล / งบการเงิน | DBD Open API |
| **สำนักงบประมาณ** | bb.go.th | งบประมาณแผ่นดิน | Scrape (PDF/HTML) |
| **สำนักงานสถิติ** | nso.go.th | สำมะโนประชากร / สถิติ | Download + Scrape |
| **กรมอุตุนิยมวิทยา** | tmd.go.th | สภาพอากาศ | API + Scrape |
| **สพร. (DGA)** | dga.or.th | บริการรัฐดิจิทัล | API Gateway |
| **ราชกิจจานุเบกษา** | ratchakitcha.soc.go.th | กฎหมาย / ประกาศ | Scrape (PDF) |
| **สภาพัฒน์ (NESDC)** | nesdc.go.th | แผนพัฒนาชาติ / GDP | API + Download |

---

## ส่วนที่ 1: Project Manager Dashboard (Artifact หลัก)

### Prompt 1.1 — สร้าง Dashboard จัดการโปรเจกต์ข้อมูลภาครัฐ

```
สร้าง React artifact เป็น "Government Data Project Manager" ที่มี:

1. หน้า Projects:
   - สร้างโปรเจกต์ใหม่ (ชื่อ, คำอธิบาย, หมวดหมู่, tags)
   - หมวดหมู่: เศรษฐกิจ / สาธารณสุข / การศึกษา / สิ่งแวดล้อม / กฎหมาย / อื่นๆ
   - แต่ละ project มี datasets หลายชุดได้
   - แสดงสถานะ: draft / collecting / complete
   - search + filter ตามหมวดหมู่ / tags

2. หน้า Data Sources:
   - เพิ่ม data source (URL, ชื่อหน่วยงาน, ประเภท: API/Scrape/Download)
   - ระบุ schedule (รายวัน/สัปดาห์/เดือน/ครั้งเดียว)
   - แสดงสถานะ last fetched, record count
   - ปุ่ม "Fetch Now" จำลองการดึงข้อมูล

3. หน้า Dataset Viewer:
   - แสดงข้อมูลที่ดึงมาเป็นตาราง
   - filter / sort / search ในตาราง
   - ปุ่ม export เป็น JSON / CSV
   - แสดง metadata: source, fetched_at, record_count

4. หน้า AI Assistant:
   - ช่อง chat เรียก Claude API
   - วาง URL ของเว็บภาครัฐแล้วให้ AI วิเคราะห์โครงสร้าง
   - แนะนำวิธี scrape / API ที่เหมาะสม
   - สร้าง scraping code ให้อัตโนมัติ

ใช้ persistent storage เก็บ projects และ datasets ข้ามเซสชัน
ออกแบบ dark theme แบบ data-engineering / terminal aesthetic
ใช้ monospace font สำหรับ data view
สี accent เป็นเขียว (#00ff88) บน dark background
```

---

## ส่วนที่ 2: Web Scraper Agent (Artifact + Claude API)

### Prompt 2.1 — AI-Powered URL Analyzer

```
สร้าง React artifact ชื่อ "Gov Site Analyzer" ที่:

1. มีช่องกรอก URL ของเว็บไซต์หน่วยงานรัฐ
2. กดปุ่ม "วิเคราะห์" แล้วเรียก Claude API พร้อม web_search tool
   ให้ Claude:
   - เข้าไปดูโครงสร้างของเว็บไซต์นั้น
   - ระบุว่ามี API endpoint หรือไม่
   - ระบุว่ามี open data / CSV / Excel ให้ดาวน์โหลดหรือไม่
   - วิเคราะห์ว่าข้อมูลอยู่ใน HTML element ไหน
   - แนะนำวิธี scrape ที่เหมาะสม

3. แสดงผลลัพธ์เป็น:
   - Site Overview: ชื่อหน่วยงาน, ประเภทข้อมูล
   - Data Access Method: API / Scrape / Download / CKAN
   - Recommended Approach: พร้อมเหตุผล
   - Generated Code: Python code สำหรับดึงข้อมูล (เลือกได้ระหว่าง
     requests+BeautifulSoup / Selenium / CKAN API)
   - Schema Preview: โครงสร้างข้อมูลที่คาดว่าจะได้

4. ปุ่ม "Copy Code" และ "Save to Project"

System prompt สำหรับ Claude API:
---
คุณเป็น Government Data Engineering Expert
เชี่ยวชาญการดึงข้อมูลจากเว็บไซต์หน่วยงานรัฐไทย

เมื่อได้รับ URL ให้:
1. ใช้ web_search ค้นหาข้อมูลเกี่ยวกับ API/Open Data ของหน่วยงาน
2. วิเคราะห์วิธีที่ดีที่สุดในการดึงข้อมูล
3. สร้าง Python code ที่พร้อมใช้งาน
4. ระบุ data schema ที่คาดว่าจะได้

ตอบเป็น JSON format:
{
  "agency": "ชื่อหน่วยงาน",
  "data_types": ["ประเภทข้อมูลที่มี"],
  "access_method": "api|scrape|download|ckan",
  "api_endpoints": ["endpoint ถ้ามี"],
  "recommended_approach": "คำแนะนำ",
  "python_code": "โค้ด Python",
  "expected_schema": {"fields": [...]},
  "notes": "ข้อควรระวัง / ข้อจำกัด"
}
---
```

### Prompt 2.2 — CKAN API Explorer (สำหรับ data.go.th)

```
สร้าง React artifact ชื่อ "Thailand Open Data Explorer" ที่:

1. เชื่อมต่อกับ data.go.th CKAN API:
   - Base URL: https://data.go.th/api/3/action/
   - ไม่ต้อง API key สำหรับ read

2. ฟีเจอร์:
   a) ค้นหาชุดข้อมูล:
      - ช่อง search keyword
      - filter ตามหน่วยงาน (organization)
      - filter ตามหมวดหมู่ (group)
      - filter ตามรูปแบบ (CSV, API, XLS, JSON)

   b) แสดงผลลัพธ์:
      - ชื่อชุดข้อมูล + คำอธิบาย
      - หน่วยงานเจ้าของ
      - รูปแบบไฟล์ที่มี
      - วันที่อัปเดตล่าสุด
      - จำนวนดาวน์โหลด

   c) ดูรายละเอียดชุดข้อมูล:
      - แสดง resources ทั้งหมด
      - preview ข้อมูล (ถ้าเป็น CSV/JSON)
      - ปุ่ม "เพิ่มเข้าโปรเจกต์"

   d) เรียก Claude API วิเคราะห์:
      - ส่ง metadata ของ dataset ให้ Claude
      - Claude แนะนำว่าข้อมูลนี้ใช้ทำอะไรได้
      - Claude สร้าง Python code สำหรับดาวน์โหลด

3. CKAN API Calls ที่ใช้:
   - package_search?q={keyword}&rows=20
   - package_show?id={dataset_id}
   - organization_list
   - group_list

ออกแบบ UI สะอาด ใช้ card layout
สี theme เป็นน้ำเงิน-ขาว ให้ดู official / gov-like
```

---

## ส่วนที่ 3: Scraping Code Templates

### Prompt 3.1 — สร้าง Python Scraping Toolkit

```
สร้าง Python project structure สำหรับ Government Data Scraper:

project structure:
gov_scraper/
├── scrapers/
│   ├── base.py          # BaseScraper class
│   ├── ckan_scraper.py  # สำหรับ data.go.th
│   ├── bot_scraper.py   # สำหรับ ธปท.
│   ├── dbd_scraper.py   # สำหรับ กรมพัฒนาธุรกิจ
│   ├── html_scraper.py  # สำหรับ scrape HTML ทั่วไป
│   └── pdf_scraper.py   # สำหรับดึงข้อมูลจาก PDF
├── models/
│   ├── project.py       # Project model
│   ├── dataset.py       # Dataset model
│   └── source.py        # DataSource model
├── storage/
│   ├── local.py         # เก็บเป็น JSON/CSV ใน local
│   ├── sqlite.py        # เก็บใน SQLite
│   └── cloud.py         # เก็บใน S3/GCS
├── utils/
│   ├── cleaner.py       # ทำความสะอาดข้อมูล
│   ├── scheduler.py     # ตั้งเวลาดึงข้อมูล
│   └── notifier.py      # แจ้งเตือนเมื่อมีข้อมูลใหม่
├── config.yaml
├── main.py
└── requirements.txt

ข้อกำหนด:
1. BaseScraper ต้องมี:
   - rate limiting (เคารพ robots.txt)
   - retry logic (exponential backoff)
   - logging ครบถ้วน
   - user-agent ที่เหมาะสม
   - cache layer (ไม่ดึงซ้ำถ้าข้อมูลไม่เปลี่ยน)
   - error handling ที่ดี

2. แต่ละ scraper ต้อง implement:
   - fetch(): ดึงข้อมูลดิบ
   - parse(): แปลงเป็น structured data
   - validate(): ตรวจสอบความถูกต้อง
   - save(): บันทึกลง storage

3. ให้โค้ดที่รันได้จริง พร้อม docstring ภาษาไทย
```

### Prompt 3.2 — CKAN Scraper สำหรับ data.go.th

```
เขียน Python class สำหรับดึงข้อมูลจาก data.go.th CKAN API:

class CKANScraper:
    """ดึงข้อมูลจากศูนย์กลางข้อมูลเปิดภาครัฐ"""

    base_url = "https://data.go.th/api/3/action/"

    methods ที่ต้องมี:
    1. search_datasets(keyword, org, group, format, limit)
       - เรียก package_search
       - return list of dataset metadata

    2. get_dataset(dataset_id)
       - เรียก package_show
       - return full dataset with resources

    3. download_resource(resource_id, save_path)
       - ดาวน์โหลดไฟล์ (CSV, XLS, JSON)
       - auto-detect encoding (Thai encoding: TIS-620, UTF-8)
       - return DataFrame

    4. list_organizations()
       - เรียก organization_list?all_fields=true
       - return list of orgs with metadata

    5. list_groups()
       - เรียก group_list?all_fields=true
       - return list of categories

    6. bulk_download(keyword, save_dir)
       - ค้นหา + ดาวน์โหลดทุก dataset ที่ match
       - rate limiting 1 req/sec
       - progress bar ด้วย tqdm

ให้ตัวอย่างการใช้งานจริง เช่น:
- ดึงข้อมูลสถิติจดทะเบียนนิติบุคคลจาก DBD
- ดึงข้อมูลอัตราแลกเปลี่ยนจาก BOT
- ดึงข้อมูลสถิติประชากรจาก NSO
```

### Prompt 3.3 — HTML Scraper สำหรับเว็บไซต์ภาครัฐทั่วไป

```
เขียน Python class สำหรับ scrape เว็บไซต์ภาครัฐที่ไม่มี API:

class GovHTMLScraper(BaseScraper):
    """Scrape เว็บไซต์ภาครัฐที่ไม่มี API"""

    ความท้าทายที่ต้องรับมือ:
    1. Thai encoding (TIS-620 / Windows-874 / UTF-8)
    2. เว็บเก่าที่ใช้ table layout
    3. ข้อมูลอยู่ใน iframe
    4. JavaScript rendering (ต้องใช้ Selenium)
    5. PDF ที่ embed ในเว็บ
    6. CAPTCHA (แนะนำวิธีรับมือ)

    methods:
    1. fetch_page(url, encoding='auto')
       - auto-detect encoding
       - handle redirects
       - return BeautifulSoup object

    2. extract_tables(soup)
       - ดึงข้อมูลจาก HTML tables
       - handle merged cells (colspan/rowspan)
       - return list of DataFrames

    3. extract_links(soup, pattern)
       - ดึง links ที่ match regex pattern
       - เช่น links ไปยังไฟล์ PDF, CSV, XLS

    4. extract_text_content(soup, selectors)
       - ดึง text จาก CSS selectors ที่กำหนด
       - clean whitespace + Thai text normalization

    5. crawl_paginated(base_url, page_param, max_pages)
       - รองรับการ scrape หลายหน้า
       - auto-detect pagination pattern

    6. download_files(urls, save_dir, file_type)
       - ดาวน์โหลดไฟล์ทีละตัว
       - rename ด้วย convention: {agency}_{date}_{type}.{ext}

ให้ตัวอย่างจริงสำหรับ:
- scrape ข่าวประกาศจากเว็บหน่วยงาน
- ดึงตารางสถิติจาก HTML
- ดาวน์โหลด PDF รายงานประจำปี
```

---

## ส่วนที่ 4: Data Schema & Storage

### Prompt 4.1 — ออกแบบ Database Schema

```
ออกแบบ database schema (SQLite/PostgreSQL) สำหรับเก็บข้อมูลภาครัฐ:

ตาราง:
1. projects
   - id, name, description, category, tags[], status,
     created_at, updated_at

2. data_sources
   - id, project_id (FK), name, agency, url,
     access_type (api/scrape/download/ckan),
     schedule (daily/weekly/monthly/once),
     config_json, last_fetched_at, status

3. datasets
   - id, source_id (FK), project_id (FK),
     name, description, version, record_count,
     schema_json, fetched_at, file_path, file_format

4. records (สำหรับ structured data)
   - id, dataset_id (FK), data_json,
     created_at, source_url

5. fetch_logs
   - id, source_id (FK), started_at, completed_at,
     status (success/error/partial),
     records_fetched, error_message

6. tags
   - id, name, category

7. project_tags (many-to-many)
   - project_id, tag_id

ให้:
- SQL CREATE statements
- Python SQLAlchemy models
- Index สำหรับ query ที่ใช้บ่อย
- Migration script
- ตัวอย่างข้อมูลจำลอง
```

### Prompt 4.2 — Data Cleaning Pipeline

```
เขียน Python module สำหรับทำความสะอาดข้อมูลภาครัฐไทย:

class ThaiGovDataCleaner:
    """ทำความสะอาดข้อมูลจากหน่วยงานภาครัฐไทย"""

    ปัญหาที่พบบ่อย:
    1. Encoding: TIS-620 ↔ UTF-8 conversion
    2. วันที่: พ.ศ. ↔ ค.ศ. conversion
       - "25 ม.ค. 2567" → "2024-01-25"
       - "25/01/67" → "2024-01-25"
       - รองรับทั้งเลขไทย ๒๕๖๗ และเลขอารบิก
    3. ตัวเลข: เลขไทย ↔ อารบิก
       - "๑,๒๓๔.๕๖" → 1234.56
    4. ชื่อจังหวัด: normalize (กทม./กรุงเทพฯ/กรุงเทพมหานคร)
    5. ชื่อหน่วยงาน: normalize ชื่อย่อ ↔ ชื่อเต็ม
    6. Missing values: "-", "N/A", "ไม่มีข้อมูล", ""
    7. HTML entities: &amp; → &, &nbsp; → " "
    8. White space: \xa0, zero-width space
    9. เลขประจำตัว: format validation (เลข 13 หลัก etc.)

    methods:
    - clean_encoding(text)
    - convert_thai_date(date_str, output_format)
    - convert_thai_numbers(text)
    - normalize_province(name)
    - normalize_agency(name)
    - clean_currency(text) → float
    - clean_dataframe(df, column_config)
    - validate_id_number(id_str, id_type)

ให้โค้ดที่ครอบคลุมทุกกรณีข้างต้น
พร้อม unit tests
```

---

## ส่วนที่ 5: All-in-One Artifact

### Prompt 5.1 — Government Data Hub (รวมทุกอย่าง)

```
สร้าง React artifact ชื่อ "Gov Data Hub 🏛️" รวมทุกฟีเจอร์ในแอปเดียว:

Tab 1 - "โปรเจกต์" (Project Manager):
  - สร้าง / แก้ไข / ลบ projects
  - แต่ละ project มี datasets หลายชุด
  - tag system สำหรับจัดหมวดหมู่
  - search / filter / sort

Tab 2 - "สำรวจ" (Data Explorer):
  - กรอก URL เว็บไซต์หน่วยงานรัฐ
  - เรียก Claude API + web_search วิเคราะห์เว็บ
  - แสดงผลวิเคราะห์: ประเภทข้อมูล, วิธีดึง, API endpoints
  - สร้าง Python scraping code อัตโนมัติ
  - ปุ่ม "บันทึกลงโปรเจกต์"

Tab 3 - "ข้อมูล" (Data Viewer):
  - เลือกดู datasets ในแต่ละ project
  - แสดงเป็นตารางที่ sort / filter / search ได้
  - สรุปสถิติพื้นฐาน (count, unique, min, max)
  - export เป็น JSON / CSV
  - จำลองข้อมูลตัวอย่างจากหน่วยงานจริง

Tab 4 - "AI ช่วยวิเคราะห์" (AI Assistant):
  - chat interface เรียก Claude API
  - ถามคำถามเกี่ยวกับข้อมูลในโปรเจกต์
  - ให้ Claude วิเคราะห์ / หา pattern / สรุป insight
  - สร้าง visualization code

Tab 5 - "คลังโค้ด" (Code Snippets):
  - templates สำเร็จรูปสำหรับดึงข้อมูลจากแต่ละหน่วยงาน:
    • data.go.th (CKAN API)
    • BOT API (อัตราแลกเปลี่ยน, ดอกเบี้ย)
    • DBD Open Data (นิติบุคคล)
    • HTML scraper template
    • PDF extractor template
  - กด copy ได้เลย
  - Claude AI ช่วย customize โค้ดตาม use case

ใช้ persistent storage เก็บทุกอย่าง
Demo data: จำลอง 3 projects ตัวอย่าง:
  1. "สถิติธุรกิจไทย" - ข้อมูลจดทะเบียนนิติบุคคลจาก DBD
  2. "ตัวชี้วัดเศรษฐกิจ" - GDP, CPI, อัตราแลกเปลี่ยน จาก BOT
  3. "ข้อมูลสิ่งแวดล้อม" - คุณภาพอากาศ, PM2.5 จาก PCD

Design: dark theme, monospace สำหรับ code/data
สี accent: เขียวนีออน (#00ff88) + cyan (#00d4ff)
font: IBM Plex Mono สำหรับ code, IBM Plex Sans Thai สำหรับ UI
```

---

## ส่วนที่ 6: Code Snippets สำเร็จรูป

### 6.1 — data.go.th CKAN API

```python
"""
Prompt: สร้าง Python snippet สำหรับดึงข้อมูลจาก data.go.th
ด้วย CKAN API พร้อม error handling และ Thai encoding support
"""

import requests
import pandas as pd
from io import StringIO

class DataGoTH:
    BASE = "https://data.go.th/api/3/action/"

    def search(self, keyword, rows=10):
        """ค้นหาชุดข้อมูล"""
        r = requests.get(f"{self.BASE}package_search",
                         params={"q": keyword, "rows": rows})
        return r.json()["result"]["results"]

    def get_dataset(self, dataset_id):
        """ดึงรายละเอียดชุดข้อมูล"""
        r = requests.get(f"{self.BASE}package_show",
                         params={"id": dataset_id})
        return r.json()["result"]

    def download_csv(self, resource_url):
        """ดาวน์โหลด CSV พร้อม handle Thai encoding"""
        r = requests.get(resource_url)
        # Auto-detect encoding
        for enc in ['utf-8', 'tis-620', 'cp874']:
            try:
                text = r.content.decode(enc)
                return pd.read_csv(StringIO(text))
            except (UnicodeDecodeError, pd.errors.ParserError):
                continue
        raise ValueError("Cannot decode file")

    def list_by_org(self, org_name, limit=50):
        """ดึงชุดข้อมูลตามหน่วยงาน"""
        r = requests.get(f"{self.BASE}package_search",
                         params={"fq": f"organization:{org_name}",
                                 "rows": limit})
        return r.json()["result"]["results"]

# ตัวอย่างใช้งาน
api = DataGoTH()
datasets = api.search("จดทะเบียนนิติบุคคล")
for ds in datasets:
    print(f"📦 {ds['title']}")
    print(f"   หน่วยงาน: {ds['organization']['title']}")
    print(f"   ทรัพยากร: {len(ds['resources'])} ไฟล์")
```

### 6.2 — BOT API (อัตราแลกเปลี่ยน)

```python
"""
Prompt: เขียน Python snippet สำหรับดึงอัตราแลกเปลี่ยน
และข้อมูลเศรษฐกิจจาก ธปท. API
"""

import requests
import pandas as pd

class BOTAPI:
    BASE = "https://apigw1.bot.or.th/bot/public/v2"

    def __init__(self, api_key):
        self.headers = {
            "X-IBM-Client-Id": api_key,
            "accept": "application/json"
        }

    def get_exchange_rate(self, start_date, end_date, currency="USD"):
        """ดึงอัตราแลกเปลี่ยน"""
        url = f"{self.BASE}/Fin_ExchangeRateAll/"
        params = {
            "start_period": start_date,  # YYYY-MM-DD
            "end_period": end_date,
            "currency": currency
        }
        r = requests.get(url, headers=self.headers, params=params)
        return r.json()

    def get_interest_rate(self, start_date, end_date):
        """ดึงอัตราดอกเบี้ยนโยบาย"""
        url = f"{self.BASE}/Fin_PolicyRate/"
        params = {
            "start_period": start_date,
            "end_period": end_date
        }
        r = requests.get(url, headers=self.headers, params=params)
        return r.json()

# หมายเหตุ: ต้องสมัคร API key ที่ https://apiportal.bot.or.th/
```

### 6.3 — General HTML Scraper

```python
"""
Prompt: เขียน Python snippet สำหรับ scrape เว็บไซต์ภาครัฐ
ที่ไม่มี API โดยรองรับ Thai encoding
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import re

class GovSiteScraper:
    def __init__(self, delay=1.0):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'GovDataBot/1.0 (research purposes)'
        })
        self.delay = delay

    def fetch(self, url):
        """ดึง HTML พร้อม auto-detect encoding"""
        time.sleep(self.delay)  # Rate limiting
        r = self.session.get(url, timeout=30)
        # Auto-detect Thai encoding
        if r.encoding and 'iso-8859' in r.encoding.lower():
            r.encoding = 'tis-620'
        return BeautifulSoup(r.text, 'html.parser')

    def extract_tables(self, soup):
        """ดึงตารางทั้งหมดเป็น DataFrames"""
        tables = []
        for table in soup.find_all('table'):
            rows = []
            for tr in table.find_all('tr'):
                cells = [td.get_text(strip=True)
                         for td in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append(cells)
            if rows:
                df = pd.DataFrame(rows[1:], columns=rows[0])
                tables.append(df)
        return tables

    def extract_pdf_links(self, soup, base_url):
        """ดึง links ไปยังไฟล์ PDF"""
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if href.lower().endswith('.pdf'):
                if not href.startswith('http'):
                    href = base_url.rstrip('/') + '/' + href.lstrip('/')
                links.append({
                    'url': href,
                    'text': a.get_text(strip=True)
                })
        return links

    def crawl_pages(self, base_url, page_param='page',
                    start=1, max_pages=10):
        """Scrape หลายหน้า"""
        all_data = []
        for page in range(start, start + max_pages):
            url = f"{base_url}?{page_param}={page}"
            soup = self.fetch(url)
            tables = self.extract_tables(soup)
            if not tables:
                break
            all_data.extend(tables)
            print(f"  ✅ Page {page}: {len(tables)} tables found")
        return all_data

# ตัวอย่าง
scraper = GovSiteScraper(delay=2.0)
soup = scraper.fetch("https://www.example.go.th/data")
tables = scraper.extract_tables(soup)
pdfs = scraper.extract_pdf_links(soup, "https://www.example.go.th")
```

---

## ส่วนที่ 7: Best Practices & ข้อควรระวัง

### ข้อกฎหมายและจริยธรรม

| หัวข้อ | แนวปฏิบัติ |
|---|---|
| **robots.txt** | ตรวจสอบและเคารพทุกครั้ง |
| **Rate limiting** | ≤ 1 request/second สำหรับ scraping |
| **ข้อมูลส่วนบุคคล** | ห้ามเก็บข้อมูลส่วนบุคคลโดยไม่ได้รับอนุญาต (PDPA) |
| **Open Data License** | ตรวจสอบ license ของแต่ละชุดข้อมูล |
| **Terms of Service** | อ่าน ToS ก่อน scrape ทุกครั้ง |
| **วัตถุประสงค์** | ใช้เพื่อการวิจัย/วิเคราะห์/สาธารณประโยชน์ |
| **Attribution** | อ้างอิงแหล่งที่มาเสมอ |

### ลำดับเลือกวิธีดึงข้อมูล (เรียงจากแนะนำมากสุด)

```
1. Official API (ถ้ามี)           → เสถียร, มี schema ชัดเจน
2. CKAN API (data.go.th)         → มาตรฐาน, มี metadata
3. Direct download (CSV/Excel)    → ง่าย, ไม่ต้อง parse HTML
4. HTML scraping (BeautifulSoup)  → เมื่อไม่มีทางอื่น
5. JavaScript rendering (Selenium)→ เมื่อเว็บ render ด้วย JS
6. PDF extraction (tabula-py)     → ทางเลือกสุดท้าย
```

### Monitoring & Scheduling

```
Prompt: เขียน Python script สำหรับ schedule
การดึงข้อมูลอัตโนมัติ ด้วย APScheduler:

- ดึงอัตราแลกเปลี่ยน BOT ทุกวัน 09:00
- ดึงข้อมูลจดทะเบียนนิติบุคคล DBD ทุกเดือนวันที่ 1
- ดึงข่าวประกาศจากราชกิจจานุเบกษาทุกสัปดาห์
- ส่ง notification เข้า LINE Notify เมื่อมีข้อมูลใหม่
- บันทึก log ทุกครั้ง
- retry 3 ครั้งถ้า error
```

---

## ลำดับการเริ่มต้นที่แนะนำ

```
Step 1: ใช้ Prompt 5.1 สร้าง All-in-One Artifact
        → ได้ dashboard + demo data ทำงานได้ใน Claude

Step 2: ใช้ Prompt 2.2 สร้าง CKAN Explorer
        → ทดสอบดึงข้อมูลจริงจาก data.go.th

Step 3: ใช้ Prompt 2.1 ให้ AI วิเคราะห์เว็บที่ต้องการ
        → ได้ code สำเร็จรูปสำหรับแต่ละเว็บ

Step 4: ใช้ Prompt 3.1-3.3 สร้าง Python project
        → นำ code ไปรันจริงบนเครื่อง

Step 5: ใช้ Prompt 4.1-4.2 สร้าง database + cleaner
        → เก็บข้อมูลอย่างเป็นระบบ

Step 6: ตั้ง scheduler ดึงข้อมูลอัตโนมัติ
        → ข้อมูลอัปเดตตลอดเวลา
```

> 💡 **เคล็ดลับ**: เริ่มจาก data.go.th เสมอ เพราะมี API มาตรฐาน CKAN
> ดึงง่าย ไม่ต้อง scrape HTML และข้อมูลมี metadata ครบถ้วน
> แล้วค่อยขยายไปเว็บที่ต้อง scrape เอง
