
# 🎨 Design System & Visual Guidelines: Interactive Digital Loy Krathong

## 1. Core Vision & Aesthetic (แนวคิดหลัก)

- **Vibe & Mood:** Magical, Festive, Warm, and Hand-crafted. (อบอุ่น เทศกาลยามค่ำคืน และดูมีเวทมนตร์)
- **Art Style:** "Premium 2D Hand-drawn Animation" (สไตล์ภาพวาดการ์ตูน 2D เกรดพรีเมียม อารมณ์คล้าย Studio Ghibli ผสมผสานความเป็นไทยโมเดิร์น)
- **STRICT RULE (Anti-AI Look):** ห้ามใช้การแรเงาแบบสมจริงเกินไป (Hyper-realistic gradients) หรือภาพที่ดูมันวาวแบบพลาสติก (Glossy 3D) ให้เน้นใช้สีแบบ Flat Color, Cell-shading และเพิ่ม Texture (เช่น Film Grain หรือ Noise อ่อนๆ) บนพื้นหลังเพื่อให้ภาพดูมีชีวิตและเป็นงานวาดมือ

## 2. 2.5D Animation & Depth (การสร้างมิติ 2.5D)

เพื่อให้ภาพ 2D ดูมีมิติและมีชีวิตชีวา ให้ใช้เทคนิค **Parallax Scrolling & Layering**:

- **Background (Layer 1):** ท้องฟ้ายามค่ำคืน มีดาวกระพริบเบาๆ (CSS Keyframes opacity) และโคมลอยที่ลอยเอื่อยๆ ด้วยความเร็วไม่เท่ากัน
- **Midground (Layer 2):** ผิวน้ำแม่น้ำ ใช้ HTML5 Canvas วาดเส้นคลื่นน้ำ (Sine waves) ที่เคลื่อนที่ต่อเนื่องแบบนุ่มนวล พร้อมใส่เอฟเฟกต์สะท้อนแสงเทียนบนผิวน้ำ (Gradient reflection)
- **Foreground (Layer 3):** UI แผงควบคุม และใบหน้า/มือของผู้เล่น (จากเว็บแคม)
- **Interaction Easing:** ทุกการเคลื่อนไหว (เช่น กระทงลอยออกไป, การกดปุ่ม, การ Hover) ต้องใช้ `Framer Motion` ด้วยค่า Spring Easing (`stiffness: 100, damping: 15`) เพื่อให้การเคลื่อนไหวดูเด้งดึ๋ง นุ่มนวล ไม่แข็งทื่อเหมือนหุ่นยนต์

## 3. Color Palette (ชุดสี)

หลีกเลี่ยงสีที่ดูสดสว่างแสบตา (Neon/Cyberpunk) ให้เน้นชุดสีธรรมชาติยามค่ำคืน:

- **Night Sky & Water (สีหลัก):** Deep Indigo (`#1A1B41`), Midnight Blue (`#0D1321`)
- **Glow & Light (สีส่องสว่าง/แสงเทียน):** Warm Gold (`#F4D06F`), Candle Orange (`#FF8C42`), Soft Yellow (`#FFF275`)
- **Nature (ส่วนประกอบกระทง):** Banana Leaf Green (`#2D6A4F`), Lotus Pink (`#FF99C8`)
- **Lighting Effect:** ใช้ CSS `box-shadow` หรือ `drop-shadow` สี Warm Gold แบบเบลอจัดๆ รอบตัวกระทง เพื่อสร้างเอฟเฟกต์แสงเทียนเรืองแสงในความมืด (Glow effect)

## 4. UI/UX Layout (หน้าตาอินเทอร์เฟซ)

UI ต้องดูเป็นมิตร เข้าถึงง่าย และ "กลืนไปกับฉาก" ไม่ดูเป็นกล่องสี่เหลี่ยมแข็งๆ ทั่วไป:

- **Glassmorphism (แบบซอฟต์ๆ):** กรอบเมนู (Card/Modal) ให้ใช้พื้นหลังแบบกึ่งโปร่งใส (Background Blur / `backdrop-blur-md`) สีขาวหรือดำความโปร่งใสแค่ 10-15% เพื่อให้ยังมองเห็นแม่น้ำด้านหลัง
- **Borders & Corners:** ไม่ใช้มุมแหลมเด็ดขาด ให้ใช้ `rounded-2xl` หรือ `rounded-full` (มุมโค้งมน) เพื่อความละมุน
- **Icons & Buttons:** ปุ่มกดให้ดีไซน์คล้ายปุ่มแบบ Soft UI/Neumorphism อ่อนๆ หรือเป็นปุ่มสี Flat ที่มี Hover effect เป็นแอนิเมชันเด้งขยายตัวเบาๆ (`scale: 1.05`)
- **Typography (ฟอนต์):**
  - *Heading:* ใช้ฟอนต์ไทยที่มีหัว มีความร่วมสมัยและอ่านง่าย (เช่น 'IBM Plex Sans Thai' หรือ 'Noto Sans Thai')
  - *Body/Wishes:* ฟอนต์ตัวเขียนหรือฟอนต์ลายมือที่อ่านง่าย เพื่อให้คำอธิษฐานดูมีความเป็นมนุษย์ (เช่น 'Mali' หรือ 'Itim' จาก Google Fonts)

## 5. Procedural Graphics Guidelines (สำหรับช่วง MVP ที่ยังไม่มีรูปวาด)

ในระหว่างที่สร้างรูปทรง 2D ด้วยโค้ด Canvas หรือ CSS:

- ใช้ SVG paths ที่มีความโค้งมนแบบออร์แกนิก (Organic shapes) แทนการใช้รูปทรงเรขาคณิตแข็งๆ ตรงๆ (หลีกเลี่ยงสี่เหลี่ยมจัตุรัสเป๊ะๆ)
- ใส่ `filter: drop-shadow(...)` และทาบเลเยอร์สีอ่อนทับที่ขอบบนของรูปทรง เพื่อสร้างแสงเงาตกกระทบ (Highlight & Shadow) แบบงานวาดการ์ตูน
