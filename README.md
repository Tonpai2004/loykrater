# ลอยกะเธอ (Loikratur) — บางกอกทวิกาล 🌕🪷🏮
> **“จันทร์เอ๋ยจันทร์เจ้าฉาย แสงพราวพรายเหนือสายชล ชวนเธอลอยกระทงอธิษฐานกมล ฝากสายน้ำและลมบนช่วยนำพา”**
>
> เว็บแอปพลิเคชัน **ลอยกระทงและปล่อยโคมลอยดิจิทัลแบบ Interactive Multiplayer** ที่ผสานการตรวจจับท่าทางมือด้วย AI (**MediaPipe Hand Landmarker**) เข้ากับงานศิลปะคอลลาจเรขาคณิต (**100% Procedural HTML5 Canvas & SVG**) ในบรรยากาศวรรณศิลป์ **“ท่าน้ำพระนครร่วมสมัย (Contemporary Thai-Global Craft)”**

---

## 💡 แนวคิดและที่มาของโปรเจกต์ (Project Concept & Vision)

**“ลอยกะเธอ (Loikratur)”** เกิดจากไอเดียที่ต้องการเปลี่ยนเว็บลอยกระทงออนไลน์แบบเดิม ๆ (ที่มักเป็นแค่ฟอร์มกรอกชื่อแล้วกดปุ่มส่ง) ให้กลายเป็น **ประสบการณ์เชิงโต้ตอบ (Interactive Ritual Experience)** ที่ผู้เล่นได้มีส่วนร่วมจริงตั้งแต่การเลือกพับกลีบใบตอง การจารึกคำอธิษฐานคล้องจอง ไปจนถึงการ **ยกมือขึ้นหน้ากล้องแล้วใช้นิ้วจีบ (Pinch Gesture)** เพื่อประคองกระทงไปวางในวงแสงบนผิวน้ำ หรือส่งโคมทองลอยขึ้นสู่ฟากฟ้าด้วยตัวเอง หรือทำไปพร้อมกับคนพิเศษข้างกาย

### ความท้าทายทางวิศวกรรมและการออกแบบที่โปรเจกต์นี้แก้ไข:
1. **Zero External Image Assets (100% Procedural Art):** กราฟิกทุกชิ้นในฉาก—ตั้งแต่ท้องฟ้ายามราตรี ดวงจันทร์ เจดีย์ริมน้ำ คลื่นสะท้อนน้ำ กระทงใบตอง 3 รูปทรง โคมลอยล้านนา มือ 2D ทั้ง 5 นิ้ว ไปจนถึงภาพพระแม่คงคา—ถูกวาดขึ้นด้วยโค้ดคณิตศาสตร์และเรขาคณิตบน HTML5 Canvas และ SVG ทั้งหมด
2. **60 FPS Performance Optimization:** ใช้เทคนิค **Offscreen Canvas Sprite Caching** (`getOrCreateKrathongSprite` และ `getOrCreateLanternSprite`) เพื่อแคชรูปทรงกระทงและโคมลอยที่ซับซ้อนไว้ในหน่วยความจำ และอัปเดตพิกัดมือผ่าน React `useRef` โดยตรงเพื่อหลีกเลี่ยงการ Re-render ของ React ที่ 60Hz
3. **Zero-Server-Cost Multiplayer Architecture:** ประมวลผล AI Hand Tracking บนเครื่องผู้ใช้ (Client-Side 100%) และซิงก์เฉพาะข้อมูล JSON ขนาดเล็กผ่าน **Firebase Realtime Database** พร้อมระบบ **Local BroadcastChannel Fallback** ที่ช่วยให้รันทดสอบระบบ Multiplayer ข้ามแท็บเบราว์เซอร์ได้ทันทีแม้ยังไม่ได้เชื่อมต่อ Firebase

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **🤲 2D Illustrated Hand & Multi-Hand Tracking (รองรับสูงสุด 2 มือพร้อมกัน):**
  - ใช้ `@mediapipe/tasks-vision` ตรวจจับจุดข้อต่อมือ 21 จุด (`numHands: 2`)
  - วาด **2D Hand Avatar** ที่มีฝ่ามือ ข้อนิ้วทั้ง 5 เล็บสีทอง กำไลข้อมือ และประกายดาวเมื่อทำท่าจีบนิ้วโป้งและนิ้วชี้เข้าหากัน
  - รองรับการลากด้วยเมาส์หรือนิ้วสัมผัสหน้าจอ (Touch/Pointer Fallback) ควบคู่กันเสมอ
- **🪷 ลอยกระทงสายน้ำ & 🏮 ปล่อยโคมลอยขึ้นฟ้า:**
  - เลือกรูปแบบพิธีได้ 3 แบบ: **ประทีปคู่ฟ้าและสายชล (กระทง + โคมลอย)**, **ล่องนาวาฝากแม่คงคา (เฉพาะกระทง)**, หรือ **ลอยโคมทองท่องเวหา (เฉพาะโคมลอย)**
  - **วงแสงเป้าหมายแยกจุดชัดเจน:** ลากกระทงไปวางในวงแสงดอกบัวบนผิวน้ำ หรือลากโคมลอยเข้าสู่วงแสงเวหาด้านบนเพื่อให้โคมลอยทะยานขึ้นฟ้าโดยอัตโนมัติ
- **👫 โหมดลอยเดี่ยว & ลอยคู่เคียงขวัญ (1–2 Players):**
  - เลือกเล่นคนเดียว หรือเล่นคู่พร้อมกัน 2 คนหน้ากล้องเดียว โดยมีช่องจารึกคำอธิษฐานและนามของผู้ลอยทั้งสองแยกกัน
- **📜 วรรณศิลป์มู้ดพระนคร & ระบบสุ่มกลอนคำพร:**
  - มีปุ่ม **“สุ่มกลอนคำพรพระนคร”** และ **“สุ่มกลอนคู่รัก”** สำหรับสุ่มบทกลอนแปดคล้องจองในกลิ่นอายบางกอกทวิกาล
- **🙏 สาส์นอวยพรจากพระแม่คงคาเทวี (`MaeKhongkhaModal`):**
  - รอจนผู้เล่นปล่อยกระทงและโคมลอย **ครบทุกชิ้นในรอบนั้น** (เช่น กระทง 2 + โคมลอย 1 = ครบ 3 ชิ้น) จึงแสดงโปสการ์ดที่ระลึกพร้อมภาพวาด 2D พระแม่คงคาในซุ้มเรือนแก้ว บทกลอนอวยพร สมุดลงนามรีวิว และปุ่มแชร์คำเชิญ

---

## 🛠️ Tech Stack

| หมวดหมู่ | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Styling & Typography** | Tailwind CSS v4 + Google Fonts (`Pridi`, `Bai Jamjuree`, `Charm`, `Cormorant Garamond`) |
| **AI Hand Tracking** | `@mediapipe/tasks-vision` (HandLandmarker — Client-side WebAssembly/WebGL) |
| **Graphics & Physics** | HTML5 Canvas 2D API (Offscreen Sprite Caching + Spring Physics) & Framer Motion |
| **Icons & Effects** | `iconoir-react`, `@phosphor-icons/react`, `canvas-confetti` |
| **Realtime Multiplayer** | Firebase Realtime Database + Web `BroadcastChannel` Fallback |
| **Package Manager** | `pnpm` |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
loikrater/
├── src/
│   ├── app/
│   │   ├── globals.css              # ตั้งค่า Theme, ฟอนต์ และคลาสย่อมุมไทยร่วมสมัย (.thai-chamfer)
│   │   ├── layout.tsx               # โหลดฟอนต์ไทย-สากล และตั้งค่า Metadata (ลอยกะเธอ / Loikratur)
│   │   └── page.tsx                 # หน้าหลัก จัดการ GameState ('CUSTOMIZE' | 'INTERACT' | 'FLOATING')
│   ├── components/
│   │   ├── CustomizationPanel.tsx   # โรงพับใบตองและสมุดข่อยจารึกคำพร (เลือกโหมด, สี, รูปทรง, สุ่มกลอน)
│   │   ├── RiverCanvas.tsx          # HTML5 Canvas หลัก จัดการลูป 60FPS, ฟิสิกส์การหยิบ-ปล่อย และ Perspective
│   │   ├── HandTrackerHUD.tsx       # หน้าจอกล้องเว็บแคมขนาดย่อ แสดงสถานะจำนวนมือและจำนวนประทีปที่ปล่อยแล้ว
│   │   └── MaeKhongkhaModal.tsx     # โปสการ์ดสาส์นอวยพรพระแม่คงคา สมุดลงนามรีวิว และระบบแชร์
│   ├── hooks/
│   │   └── useHandTracking.ts       # Custom Hook โหลดโมเดล MediaPipe HandLandmarker และคำนวณท่าจีบนิ้ว 2 มือ
│   ├── lib/
│   │   ├── canvasRenderer.ts        # ฟังก์ชันวาดกราฟิก 2D ทั้งหมด (ฉากคืนเพ็ญ, กระทง, โคมลอย, วงแสง, มือ 2D)
│   │   └── firebase.ts              # ระบบเชื่อมต่อ Firebase Realtime Database และ BroadcastChannel Fallback
│   └── types/
│       └── krathong.ts              # TypeScript Interfaces ทั้งหมดของระบบ
├── .env.example                     # ตัวอย่างไฟล์ตั้งค่าตัวแปรสภาพแวดล้อมสำหรับ Firebase
├── design.md                        # เอกสารกำหนดทิศทางงานศิลป์ (Art Direction & Animation Physics)
└── package.json
```

---

## 🚀 วิธี Clone และรันโปรเจกต์ (Getting Started)

ผู้ที่สนใจศึกษาโค้ดหรือนำไปพัฒนาต่อสามารถ Clone โปรเจกต์ไปรันบนเครื่องได้ทันที (แม้ยังไม่มี Firebase Key ก็สามารถรันและทดสอบทุกฟีเจอร์ได้ครบถ้วน):

### 1. Clone โปรเจกต์และติดตั้งแพ็กเกจ
```bash
git clone https://github.com/Tonpai2004/loikrater.git
cd loikrater
pnpm install
```

### 2. รันเซิร์ฟเวอร์สำหรับการพัฒนา (Development Server)
```bash
pnpm dev
```
จากนั้นเปิดเบราว์เซอร์ไปที่ **[http://localhost:3000](http://localhost:3000)** (อนุญาตสิทธิ์การใช้กล้องเว็บแคมเพื่อทดสอบระบบจีบนิ้วหยิบกระทงและโคมลอย)

---

## 🌐 การตั้งค่า Firebase สำหรับโหมด Multiplayer ออนไลน์ (Optional)

หากต้องการให้กระทงและโคมลอยซิงก์ออนไลน์ข้ามเครื่องแบบเรียลไทม์ผ่าน Firebase Realtime Database:

1. คัดลอกไฟล์ `.env.example` เป็น `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. สร้างโปรเจกต์บน [Firebase Console](https://console.firebase.google.com/) เปิดใช้งาน **Realtime Database** และนำค่า Config มาใส่ใน `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.asia-southeast1.firebasedatabase.app
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
3. ตั้งค่า **Realtime Database Rules** ดังนี้:
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

## 🌱 แนวทางการนำไปพัฒนาต่อ (Ideas for Contributors)

หากคุณต้องการ Fork หรือ Clone โปรเจกต์นี้ไปต่อยอด สามารถลองเพิ่มฟีเจอร์เหล่านี้ได้:
- **เสียงดนตรีบรรเลงประกอบ (Procedural Web Audio API / Ambient Soundscape):** เพิ่มเสียงคลื่นน้ำกระทบตลิ่ง เสียงดนตรีไทยเดิมบรรเลงเบา ๆ และเสียงพลุเมื่อปล่อยโคมลอยสำเร็จ
- **ระบบสร้างห้องส่วนตัว (Private River Rooms):** ให้คู่รักหรือกลุ่มเพื่อนสร้าง URL ห้องเฉพาะของตัวเองเพื่อลอยกระทงด้วยกันแบบส่วนตัว
- **ระบบบันทึกรูปโปสการ์ดคำพร (Downloadable Souvenir Card):** เพิ่มปุ่มแปลงหน้าต่างสาส์นอวยพรพระแม่คงคาเป็นไฟล์ภาพ PNG สำหรับแชร์ลง Instagram Story

---

พัฒนาและออกแบบโดย **[Tonpai2004](https://github.com/Tonpai2004)**
