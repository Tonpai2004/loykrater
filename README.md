# Loikratur (ลอยกะเธอ)

**Loikratur (ลอยกะเธอ)** คือเว็บแอปพลิเคชันเชิงโต้ตอบแบบเรียลไทม์ (Interactive Multiplayer Web Experience) ที่นำประเพณีลอยกระทงและปล่อยโคมลอยของไทยมาตีความใหม่ในรูปแบบงานศิลปะดิจิทัลร่วมสมัยภายใต้บรรยากาศ "ท่าน้ำพระนครยามราตรี"

โปรเจกต์นี้ออกแบบมาเพื่อแก้ปัญหาความจำเจของเว็บไซต์ลอยกระทงออนไลน์ทั่วไปที่มักเป็นเพียงแบบฟอร์มกรอกข้อความแล้วกดปุ่มส่ง โดยเปลี่ยนให้ผู้ใช้ได้มีส่วนร่วมกับพิธีกรรมผ่านการตรวจจับท่าทางมือด้วย AI (Hand Gesture Tracking) เพื่อหยิบและประคองกระทงไปวางลงในสายน้ำ หรือปล่อยโคมลอยขึ้นสู่ท้องฟ้าด้วยตัวเองและสามารถเล่นพร้อมกับคนข้างกายได้ในหน้าจอเดียวกัน

---

## แนวคิดและการออกแบบ (Concept & Design Rationale)

1. **Physicality in Digital Ritual (การสร้างสัมผัสทางกายภาพบนหน้าเว็บ)**
   แทนที่จะใช้การคลิกปุ่มเพียงอย่างเดียว ระบบใช้กล้องเว็บแคมตรวจจับพิกัดมือแบบเรียลไทม์ ผู้ใช้ต้องทำท่า "จีบนิ้ว" (Pinch Gesture) เพื่อหยิบกระทงหรือโคมลอยที่ตัวเองพับไว้ แล้วค่อยๆ ลากไปวางในวงแสงเป้าหมายบนผิวน้ำหรือบนท้องฟ้า สร้างความรู้สึกของการ "ประคองและปล่อย" ที่ใกล้เคียงกับการลอยกระทงจริง

2. **Contemporary Phra Nakhon Aesthetics (บรรยากาศพระนครร่วมสมัย)**
   งานออกแบบผสมผสานโครงสร้างสถาปัตยกรรมไทยประยุกต์ (เช่น กรอบตัดเหลี่ยมย่อมุม และโทนสีเครื่องรักปิดทอง) เข้ากับวรรณศิลป์ไทยแบบเจ้าบทเจ้ากลอน มีระบบสุ่มคำกลอนอธิษฐานคล้องจองทั้งสำหรับผู้ที่ลอยคนเดียวและผู้ที่ลอยเป็นคู่

3. **Zero-Asset Procedural Rendering (กราฟิกวาดด้วยโค้ด 100%)**
   องค์ประกอบภาพทั้งหมดในฉาก ไม่ว่าจะเป็นท้องฟ้า ดวงจันทร์ เจดีย์ริมน้ำ คลื่นสะท้อนแสงจันทร์ กระทงใบตองทั้ง 3 รูปทรง โคมลอยล้านนา มือจำลอง 2 มิติ ไปจนถึงภาพพระแม่คงคา ถูกสร้างขึ้นด้วยโค้ดคณิตศาสตร์และเรขาคณิตผ่าน HTML5 Canvas และ SVG โดยไม่ใช้ไฟล์รูปภาพภายนอก ทำให้โหลดเร็วและปรับขนาดตามความละเอียดหน้าจอได้อย่างสมบูรณ์

4. **Serverless & Zero-Cost Scalability (รองรับผู้เล่นหลายคนโดยไม่มีค่าเซิร์ฟเวอร์)**
   การประมวลผลโมเดล AI สำหรับจับพิกัดมือทำงานอยู่บนเบราว์เซอร์ของผู้ใช้ทั้งหมด (Client-Side WebAssembly/WebGL) ส่วนการซิงก์ข้อมูลกระทงและโคมลอยของผู้เล่นแต่ละคนจะส่งเฉพาะข้อมูล JSON ขนาดเล็กผ่าน Firebase Realtime Database และมีระบบสำรองข้อมูลผ่าน `BroadcastChannel` API เพื่อให้สามารถทดสอบระบบ Multiplayer ข้ามแท็บเบราว์เซอร์ได้ทันทีแม้ในสภาพแวดล้อมที่ไม่ได้ตั้งค่าฐานข้อมูล

---

## ฟีเจอร์และการทำงานหลัก (Core Capabilities)

- **Dual-Hand Gesture Tracking:** รองรับการตรวจจับมือพร้อมกันสูงสุด 2 ข้าง (`numHands: 2`) ด้วย `@mediapipe/tasks-vision` พร้อมวาดโมเดลมือ 2 มิติตามจุดข้อต่อทั้ง 21 จุด และมีระบบ Fallback สำหรับการลากด้วยเมาส์หรือหน้าจอสัมผัส
- **Multi-Mode & Co-op Support:** เลือกได้ว่าจะลอยเฉพาะกระทง ปล่อยเฉพาะโคมลอย หรือทำทั้งสองอย่างในรอบเดียวกัน และรองรับโหมดผู้เล่น 1 คน หรือ 2 คนพร้อมกัน
- **Target Spotlight Release Mechanics:** แสดงวงกลมแสงเป้าหมายบนผิวน้ำสำหรับวางกระทง และวงกลมแสงด้านบนท้องฟ้าสำหรับปล่อยโคมลอย พร้อมระบบฟิสิกส์แบบสปริง (Spring Physics) และความลึกตามระยะสายตา (Perspective Scaling)
- **End-of-Round Blessing & Guestbook:** ระบบจะตรวจสอบจนกว่าผู้เล่นจะปล่อยกระทงและโคมลอยครบทุกชิ้นในรอบนั้น จึงจะแสดงหน้าต่างสาส์นอวยพรจากพระแม่คงคา พร้อมสมุดลงนามเขียนความประทับใจและระบบแชร์คำเชิญ

---

## สถาปัตยกรรมและเทคโนโลยี (Tech Stack & Architecture)

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling & Typography:** Tailwind CSS v4 ร่วมกับฟอนต์ `Pridi`, `Bai Jamjuree`, `Charm` และ `Cormorant Garamond`
- **Computer Vision:** `@mediapipe/tasks-vision` (HandLandmarker)
- **Rendering & Animation:** HTML5 Canvas 2D API (พร้อมระบบ Offscreen Canvas Sprite Caching เพื่อรักษาความลื่นไหลที่ 60 FPS) และ Framer Motion
- **Realtime Data Sync:** Firebase Realtime Database และ Web `BroadcastChannel` API
- **Package Manager:** `pnpm`

### โครงสร้างไดเรกทอรี (Directory Structure)

```text
loikrater/
├── src/
│   ├── app/
│   │   ├── globals.css              # ตั้งค่าตัวแปรสี ฟอนต์ และคลาสรูปทรงย่อมุม (.thai-chamfer)
│   │   ├── layout.tsx               # โหลดฟอนต์และกำหนด Metadata ของเว็บแอปพลิเคชัน
│   │   └── page.tsx                 # หน้าหลักและ State Machine ('CUSTOMIZE' | 'INTERACT' | 'FLOATING')
│   ├── components/
│   │   ├── CustomizationPanel.tsx   # แผงปรับแต่งรูปทรงกระทง โทนสี โหมดผู้เล่น และสมุดจารึกคำอธิษฐาน
│   │   ├── RiverCanvas.tsx          # คอมโพเนนต์ Canvas หลัก จัดการ Render Loop 60FPS และระบบหยิบ-ปล่อย
│   │   ├── HandTrackerHUD.tsx       # หน้าจอกล้องเว็บแคมขนาดย่อและปุ่มควบคุมระหว่างการลอย
│   │   └── MaeKhongkhaModal.tsx     # หน้าต่างสาส์นอวยพรพระแม่คงคา สมุดลงนามรีวิว และระบบแชร์
│   ├── hooks/
│   │   └── useHandTracking.ts       # Custom Hook สำหรับจัดการกล้อง โมเดล MediaPipe และการคำนวณท่าจีบนิ้ว
│   ├── lib/
│   │   ├── canvasRenderer.ts        # ฟังก์ชันวาดกราฟิก 2D บน Canvas และระบบ Offscreen Sprite Cache
│   │   └── firebase.ts              # โมดูลเชื่อมต่อ Firebase Realtime Database และระบบ Fallback
│   └── types/
│       └── krathong.ts              # นิยาม Type และ Interface ทั้งหมดของโปรเจกต์
├── .env.example                     # ตัวอย่างไฟล์ตั้งค่า Environment Variables
├── design.md                        # เอกสารกำหนดแนวทางงานศิลป์และฟิสิกส์การเคลื่อนไหว
└── package.json
```

---

## การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

โปรเจกต์นี้สามารถโคลนไปรันบนเครื่องเพื่อศึกษาโครงสร้างโค้ดหรือพัฒนาต่อได้ทันที โดยไม่จำเป็นต้องมีคีย์ของ Firebase ในการรันครั้งแรก

### 1. โคลนโปรเจกต์และติดตั้งแพ็กเกจ

```bash
git clone https://github.com/Tonpai2004/loikrater.git
cd loikrater
pnpm install
```

### 2. รันเซิร์ฟเวอร์สำหรับการพัฒนา

```bash
pnpm dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000` (หากต้องการทดสอบการควบคุมด้วยมือ ให้กดอนุญาตการเข้าถึงกล้องเว็บแคมบนเบราว์เซอร์)

### 3. การตรวจสอบคุณภาพโค้ดและ Type

```bash
pnpm lint
pnpm tsc --noEmit
```

---

## การตั้งค่า Firebase Realtime Database (สำหรับการซิงก์ออนไลน์)

หากต้องการเปิดใช้งานระบบซิงก์ข้อมูลกระทงและโคมลอยระหว่างผู้เล่นหลายคนผ่านอินเทอร์เน็ต ให้ตั้งค่าดังนี้:

1. คัดลอกไฟล์ `.env.example` เป็น `.env.local`
   ```bash
   cp .env.example .env.local
   ```
2. สร้างโปรเจกต์บน Firebase Console เปิดใช้งาน **Realtime Database** และนำค่าการเชื่อมต่อมาใส่ใน `.env.local`
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. กำหนด Security Rules ของ Realtime Database เพื่อเปิดให้ซิงก์และเรียงลำดับตามเวลาที่สร้าง
   ```json
   {
     "rules": {
       "global_river_krathongs": {
         ".read": true,
         ".write": true,
         ".indexOn": ["createdAt"]
       }
     }
   }
   ```

---

## แนวทางการพัฒนาต่อยอด (Future Enhancements)

สำหรับนักพัฒนาที่สนใจนำซอร์สโค้ดไปศึกษาหรือต่อยอด สามารถขยายความสามารถของระบบเพิ่มเติมได้ในหลายมิติ:
- **Procedural Audio & Soundscape:** สร้างเสียงบรรยากาศสายน้ำและดนตรีบรรเลงด้วย Web Audio API ที่ตอบสนองต่อความเร็วในการเคลื่อนไหวมือและการปล่อยกระทง
- **Private Session Rooms:** เพิ่มระบบสร้างรหัสห้อง (Room ID) เพื่อให้กลุ่มเพื่อนหรือคู่รักสามารถสร้างคุ้งน้ำส่วนตัวสำหรับลอยด้วยกันเฉพาะกลุ่ม
- **Canvas Snapshot Export:** เพิ่มฟังก์ชันบันทึกภาพโปสการ์ดคำอธิษฐานและกระทงของผู้ใช้เป็นไฟล์รูปภาพความละเอียดสูงสำหรับดาวน์โหลดเก็บเป็นที่ระลึก

---

พัฒนาและดูแลโดย [Tonpai2004](https://github.com/Tonpai2004)
