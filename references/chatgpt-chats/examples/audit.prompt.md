# Audit Prompt: AI Self-Audit for Survey Analysis

> Prompt นี้ใช้ให้ AI ตรวจสอบตัวเองหลังวิเคราะห์ข้อมูล เพื่อความโปร่งใสและตรวจสอบได้

---

## วัตถุประสงค์

AI Data Audit มีไว้เพื่อ:
1. **บันทึก** สิ่งที่ AI ทำและไม่ได้ทำ
2. **เปิดเผย** สมมติฐานและข้อจำกัด
3. **ประเมิน** ความเชื่อมั่นในผลลัพธ์
4. **ให้** Data Steward ตรวจสอบได้

---

## Prompt Template

```markdown
# คำสั่ง: สร้าง AI Data Audit

## บทบาท

คุณคือ **AI Auditor** ที่ต้องตรวจสอบและบันทึกการวิเคราะห์ที่เพิ่งทำไป
ต้องรายงานอย่างตรงไปตรงมา ไม่ปกปิดข้อจำกัดหรือความไม่แน่นอน

## เอกสารอ้างอิง

- **metrics.yaml** - metrics ที่ได้รับอนุญาต
- **dataset_profile.md** - ขอบเขตและข้อจำกัดของข้อมูล
- **ผลการวิเคราะห์** - output ที่เพิ่งสร้าง

## สิ่งที่ต้องรายงาน

### 1. Analysis Summary (สรุปการวิเคราะห์)
- วิเคราะห์อะไรบ้าง
- ใช้ข้อมูลอะไร
- ผลลัพธ์หลักคืออะไร

### 2. Compliance Check (ตรวจสอบความถูกต้อง)
- ทำตาม metrics.yaml หรือไม่
- อยู่ในขอบเขต dataset_profile.md หรือไม่
- มีการละเมิดกฎอะไรหรือไม่

### 3. What Was Done (สิ่งที่ทำ)
- รายการ metrics ที่คำนวณ
- วิธีการคำนวณ
- ข้อมูลที่ใช้

### 4. What Was NOT Done (สิ่งที่ไม่ได้ทำ)
- metrics ที่ไม่ได้คำนวณ และเหตุผล
- การวิเคราะห์ที่ข้าม และเหตุผล
- คำถามที่ตอบไม่ได้ และเหตุผล

### 5. Assumptions (สมมติฐาน)
- สมมติฐานที่ AI ใช้
- สมมติฐานที่รับมาจาก dataset_profile.md
- สมมติฐานที่ AI เพิ่มเอง (ถ้ามี)

### 6. Limitations (ข้อจำกัด)
- ข้อจำกัดจากข้อมูล
- ข้อจำกัดจากวิธีการ
- ข้อจำกัดจากขอบเขตที่กำหนด

### 7. Confidence Assessment (ประเมินความเชื่อมั่น)
- ระดับความเชื่อมั่น: High / Medium / Low
- เหตุผลที่ให้ระดับนี้
- ปัจจัยที่อาจทำให้ผลลัพธ์ไม่แม่นยำ

### 8. Recommendations (ข้อเสนอแนะ)
- สิ่งที่ Data Steward ควรตรวจสอบ
- การวิเคราะห์เพิ่มเติมที่อาจเป็นประโยชน์ (ต้องขออนุญาตก่อน)
- ข้อควรระวังในการนำผลไปใช้

## รูปแบบ Output

ใช้ template ด้านล่างในการสร้าง AI Data Audit
```

---

## AI Data Audit Template

```markdown
# AI Data Audit Report

**Generated**: [วันที่และเวลา]
**Dataset**: [ชื่อ dataset]
**Analysis Run**: [รหัสหรือชื่อการวิเคราะห์]
**AI Model**: [ชื่อ model ที่ใช้]

---

## 1. Analysis Summary

| รายการ | รายละเอียด |
|--------|------------|
| **วัตถุประสงค์** | [วิเคราะห์เพื่ออะไร] |
| **ข้อมูลที่ใช้** | [ชื่อไฟล์, จำนวน records] |
| **ช่วงเวลาข้อมูล** | [วันที่เก็บข้อมูล] |
| **จำนวนตัวอย่าง (n)** | [จำนวน] |

---

## 2. Compliance Check

### ตรวจสอบ metrics.yaml

| Metric | อนุญาต? | คำนวณ? | หมายเหตุ |
|--------|---------|--------|----------|
| [metric_1] | ✓ | ✓ | - |
| [metric_2] | ✓ | ✓ | - |
| [metric_3] | ✓ | ✗ | n < min_sample |
| [metric_x] | ✗ | ✗ | ไม่ได้รับอนุญาต |

### ตรวจสอบ dataset_profile.md

| กฎ | ปฏิบัติตาม? | หมายเหตุ |
|----|-------------|----------|
| ไม่เปรียบเทียบระหว่างแผนก | ✓ | - |
| ไม่วิเคราะห์ open-ended | ✓ | ไม่มี codebook |
| แสดง n ทุกครั้ง | ✓ | - |

### การละเมิดกฎ (ถ้ามี)

- [ ] ไม่มีการละเมิด
- [ ] มีการละเมิด: [รายละเอียด]

---

## 3. What Was Done

### Metrics ที่คำนวณ

| Metric | Formula | n | Result |
|--------|---------|---|--------|
| response_count | COUNT(responses) | - | 33 |
| response_rate | COUNT/total × 100 | - | 70.2% |
| overall_satisfaction | AVG(q1) | 33 | 4.21 |
| content_score | AVG(q2) | 33 | 4.35 |
| instructor_score | AVG(q3) | 32 | 4.48 |
| recommendation_rate | COUNT(Yes)/total × 100 | 33 | 78.8% |

### Data Transformations

| ขั้นตอน | รายละเอียด |
|---------|------------|
| 1 | กรอง complete responses (ตัด partial 2 records) |
| 2 | ตรวจสอบค่าอยู่ในช่วงที่กำหนด (1-5) |
| 3 | คำนวณตาม formula ใน metrics.yaml |

---

## 4. What Was NOT Done

### Metrics ที่ไม่ได้คำนวณ

| Metric | เหตุผล |
|--------|--------|
| department_comparison | บางแผนก n < 10 (ไม่ผ่าน min_sample) |
| applicability_score | missing data 1 record แต่ยังคำนวณได้ (n=32) |
| satisfaction_distribution | ไม่ได้ร้องขอในครั้งนี้ |

### การวิเคราะห์ที่ข้าม

| การวิเคราะห์ | เหตุผล |
|--------------|--------|
| Correlation analysis | อยู่ใน requires_approval ไม่ได้ขออนุญาต |
| Sentiment analysis (q8) | ไม่มี codebook |
| Trend analysis | ไม่มี historical data |

### คำถามที่ตอบไม่ได้

| คำถาม | เหตุผล |
|-------|--------|
| "แผนกไหนพอใจน้อยสุด?" | ห้ามเปรียบเทียบระหว่างแผนก |
| "การอบรมสำเร็จไหม?" | ไม่มี success criteria ที่กำหนดไว้ |
| "ควรจัดอบรมอีกไหม?" | เกินขอบเขตการวิเคราะห์ |

---

## 5. Assumptions

### สมมติฐานจาก dataset_profile.md

| สมมติฐาน | แหล่งที่มา |
|----------|------------|
| ผู้ตอบเข้าใจคำถามตรงกัน | dataset_profile.md |
| ผู้ตอบตอบตามความจริง | dataset_profile.md |
| ไม่มีการตอบซ้ำ | dataset_profile.md |

### สมมติฐานที่ AI เพิ่ม

| สมมติฐาน | เหตุผล | ความเสี่ยง |
|----------|--------|-----------|
| ใช้เฉพาะ complete responses | ตัด partial เพื่อความถูกต้อง | ต่ำ - มีแค่ 2 records |
| Missing ใน q3 = random | ไม่มี pattern ชัดเจน | ต่ำ - มีแค่ 1 record |

---

## 6. Limitations

### ข้อจำกัดจากข้อมูล

| ข้อจำกัด | ผลกระทบ |
|----------|---------|
| Self-selection bias | ผู้พอใจอาจตอบมากกว่า → overestimate |
| Sample size เล็ก | Confidence interval กว้าง |
| ไม่มี baseline | เปรียบเทียบไม่ได้ |

### ข้อจำกัดจากวิธีการ

| ข้อจำกัด | ผลกระทบ |
|----------|---------|
| ใช้ค่าเฉลี่ยอย่างเดียว | ไม่เห็น distribution |
| ไม่วิเคราะห์ open-ended | พลาด insights เชิงคุณภาพ |

### ข้อจำกัดจากขอบเขต

| ข้อจำกัด | ผลกระทบ |
|----------|---------|
| ห้ามเปรียบเทียบแผนก | ไม่ทราบว่าแผนกไหนต้องปรับปรุง |
| ห้ามหา correlation | ไม่ทราบปัจจัยที่ส่งผลต่อความพึงพอใจ |

---

## 7. Confidence Assessment

### Overall Confidence: **MEDIUM**

| ปัจจัย | ระดับ | เหตุผล |
|--------|-------|--------|
| Data Quality | Medium | Complete 94%, มี missing เล็กน้อย |
| Sample Size | Medium | n=33 เพียงพอสำหรับ descriptive stats |
| Methodology | High | ใช้ formula ตาม metrics.yaml |
| Bias Risk | Medium | Self-selection bias อาจมีผล |

### Confidence by Metric

| Metric | Confidence | เหตุผล |
|--------|------------|--------|
| response_rate | High | นับได้ตรงไปตรงมา |
| overall_satisfaction | Medium | n=33, self-selection bias |
| instructor_score | Medium | n=32, missing 1 |
| recommendation_rate | Medium | n=33, self-selection bias |

---

## 8. Recommendations

### สิ่งที่ Data Steward ควรตรวจสอบ

1. **ตรวจสอบ partial responses** - 2 records ที่ตัดออก มีข้อมูลที่ควรพิจารณาไหม
2. **ยืนยัน threshold** - เกณฑ์ "Good ≥ 4.0" เหมาะสมกับบริบทองค์กรหรือไม่
3. **ตรวจสอบ outlier** - q6_years = 45 ปี ควรรวมในการวิเคราะห์ไหม (ถ้าวิเคราะห์อายุงาน)

### การวิเคราะห์เพิ่มเติมที่อาจเป็นประโยชน์

> ต้องขออนุญาต Data Steward ก่อนดำเนินการ

1. **Satisfaction distribution** - ดูการกระจายแทนค่าเฉลี่ย
2. **Open-ended analysis** - ถ้ามี codebook
3. **Follow-up survey** - ติดตามผลหลังนำไปใช้งาน

### ข้อควรระวังในการนำผลไปใช้

1. **อย่าสรุปว่าเป็นความเห็นของพนักงานทั้งหมด** - เฉพาะผู้เข้าอบรมที่ตอบเท่านั้น
2. **อย่าใช้ตัดสินวิทยากรโดยตรง** - ไม่ได้ออกแบบมาเพื่อสิ่งนี้
3. **ใช้เป็น baseline สำหรับครั้งต่อไป** - ไม่ใช่ตัดสินว่าสำเร็จ/ล้มเหลว

---

## Sign-off

| รายการ | สถานะ |
|--------|-------|
| AI Analysis Complete | ✓ |
| AI Audit Complete | ✓ |
| Ready for Data Steward Review | ✓ |

**Data Steward Review**: [ ] Approved / [ ] Needs Revision

**Comments**: _____________________

**Reviewed by**: _____________________

**Date**: _____________________
```

---

## Quick Audit Prompt (แบบย่อ)

สำหรับการวิเคราะห์ที่ไม่ซับซ้อน:

```markdown
# คำสั่ง: สร้าง AI Data Audit แบบย่อ

ตรวจสอบการวิเคราะห์ที่เพิ่งทำและรายงาน:

1. **ทำอะไรไปบ้าง** (รายการ metrics)
2. **ไม่ได้ทำอะไร** (และเหตุผล)
3. **สมมติฐานที่ใช้**
4. **Confidence Level** (High/Medium/Low + เหตุผล)
5. **ข้อควรระวัง** (1-3 ข้อ)

แสดงเป็นตารางกระชับ
```

---

## Audit Checklist

ใช้ตรวจสอบว่า Audit ครบถ้วน:

- [ ] ระบุ metrics ที่คำนวณทั้งหมด
- [ ] ระบุ metrics ที่ไม่ได้คำนวณและเหตุผล
- [ ] ระบุ n ของทุก metric
- [ ] ระบุสมมติฐานที่ใช้
- [ ] ระบุข้อจำกัด
- [ ] ประเมิน confidence level พร้อมเหตุผล
- [ ] ระบุสิ่งที่ Data Steward ควรตรวจสอบ
- [ ] ไม่มีการวิเคราะห์นอกเหนือ metrics.yaml

---

## Related Documents

| เอกสาร | ที่อยู่ |
|--------|-------|
| Analysis Prompt | `examples/analysis.prompt.md` |
| Dataset Profile Template | `examples/dataset_profile.md` |
| Metrics Definition Template | `examples/metrics.yaml` |
| Framework Overview | `ai_survey_steward_framework.md` |
