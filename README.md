# ระบบจัดการรายรับรายจ่าย (Income & Expense Management)

เว็บแอปพลิเคชันสำหรับบันทึกและจัดการรายรับรายจ่ายส่วนบุคคล พร้อมระบบสรุปผลรายเดือน การวิเคราะห์ข้อมูลด้วยกราฟ และจัดเก็บข้อมูลอย่างปลอดภัยบน Firebase Cloud (Firestore) เชื่อมต่อด้วยบัญชี Google (Gmail)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **ระบบเข้าสู่ระบบด้วย Google (Gmail Authentication)**
   - เข้าสู่ระบบด้วย Google Account ผ่าน Firebase Authentication
   - จัดเก็บข้อมูลแยกตามผู้ใช้แบบซับคอลเลกชัน (`users/{userId}/transactions`) ปลอดภัยและเป็นส่วนตัว

2. **สรุปภาพรวมรายเดือน (Monthly Financial Summary)**
   - คำนวณรายรับรวม, รายจ่ายรวม, ยอดคงเหลือสุทธิ และอัตราการออม (%)
   - ตัวติดตามงบประมาณรายจ่ายประจำเดือน (Monthly Budget Tracker) พร้อมแถบแสดงสถานะและคำนวณวงเงินเฉลี่ยต่อวัน

3. **ภาพวิเคราะห์ข้อมูลและสถิติ (Data Visualization & Charts)**
   - กราฟโดนัท (Donut Chart) แสดงสัดส่วนรายจ่ายตามหมวดหมู่
   - กราฟแท่ง (Bar Chart) เปรียบเทียบรายรับ-รายจ่ายย้อนหลัง 6 เดือน
   - กราฟพื้นที่ (Area Chart) แสดงแนวโน้มการใช้จ่ายสะสมรายวันตลอดทั้งเดือน
   - ตารางสรุปข้อมูลรายหมวดหมู่แบบละเอียด

4. **การจัดการรายการ (Transaction Management)**
   - บันทึก แก้ไข และลบรายการรายรับ-รายจ่าย
   - หมวดหมู่มาตรฐานพร้อมไอคอน และช่องทางการชำระเงิน (เงินสด, โอนเงิน, บัตรเครดิต, อื่นๆ)
   - ตัวกรองและค้นหาตามประเภท หมวดหมู่ หรือวันที่

5. **ส่งออกข้อมูล (Export Data)**
   - ส่งออกเป็นไฟล์ **Excel (CSV)** รองรับภาษาไทย (UTF-8 with BOM)
   - ส่งออกเป็นไฟล์สำรองข้อมูล **JSON**

---

## 🚀 วิธีการติดตั้งและรันในเครื่อง (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันเซิร์ฟเวอร์สำหรับพัฒนา (Development Server)
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ `http://localhost:3000` (หรือตามพอร์ตที่ระบบแสดง)

### 3. ตรวจสอบโค้ด (Linting)
```bash
npm run lint
```

### 4. บิลด์สำหรับ Production
```bash
npm run build
```

---

## 🗄️ การตั้งค่า Firebase (Firebase Configuration)

โปรเจกต์นี้เชื่อมต่อกับ Firebase Project: `zen1234v-52bab`
ไฟล์คอนฟิกถูกบันทึกไว้ใน `firebase-applet-config.json` โดยอัตโนมัติ

---

## 📦 วิธีการนำขึ้น GitHub (Push to GitHub)

หากดาวน์โหลดโค้ดเป็นไฟล์ `.zip` มาแล้ว สามารถนำขึ้น GitHub ได้ตามขั้นตอนดังนี้:

```bash
# 1. แตกไฟล์ zip และเปิดโฟลเดอร์ใน Terminal / Command Prompt
cd path/to/project

# 2. สร้าง Git Repository
git init

# 3. เพิ่มไฟล์ทั้งหมด
git add .

# 4. คอมมิตครั้งแรก
git commit -m "feat: Initial commit for income and expense tracker"

# 5. เปลี่ยนชื่อ branch เป็น main
git branch -M main

# 6. เชื่อมต่อไปยัง GitHub Repository ของคุณ (สร้าง repo เปล่าบน GitHub ก่อน)
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# 7. พุชโค้ดขึ้น GitHub
git push -u origin main
```
