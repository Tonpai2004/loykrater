import { Locale } from '@/constants/translations';

export type LoreChapterId = 'origins' | 'goddess' | 'siam' | 'song' | 'popculture';

export interface LoreSection {
  heading: string;
  body: string;
}

export interface LoreChapter {
  id: LoreChapterId;
  num: string;
  title: string;
  short: string;
  sub: string;
  lede: string;
  sections: LoreSection[];
  note?: { label: string; text: string };
}

export interface LoreManuscript {
  header: string;
  headerShort: string;
  sub: string;
  closeBtn: string;
  prevBtn: string;
  nextBtn: string;
  chapters: LoreChapter[];
}

// Chronicles shown in the Loy Krathong lore manuscript (สมุดข่อยตำนานประเพณี)
export const LORE_CONTENT: Record<Locale, LoreManuscript> = {
  th: {
    header: 'สมุดไทยดำคลังความรู้ • ตำนานประเพณีลอยประทีป',
    headerShort: 'สมุดข่อยตำนานประเพณี',
    sub: 'CHRONICLES OF LOY KRATHONG & YI PENG HERITAGE',
    closeBtn: 'ปิดสมุดไทย',
    prevBtn: 'ผูกก่อนหน้า',
    nextBtn: 'ผูกถัดไป',
    chapters: [
      {
        id: 'origins',
        num: '๑',
        title: 'ปฐมบทแห่งวันเพ็ญ',
        short: 'ที่มา',
        sub: 'ความเชื่อ • ความหมาย',
        lede:
          'ลอยกระทงจัดขึ้นในคืนวันเพ็ญ ขึ้น ๑๕ ค่ำ เดือน ๑๒ ซึ่งมักตรงกับเดือนพฤศจิกายน ช่วงที่น้ำเหนือหลากมาเต็มสองฝั่งตลิ่ง และดวงจันทร์ส่องสว่างเต็มดวงที่สุดของปี',
        sections: [
          {
            heading: 'ขอขมาพระแม่คงคา',
            body:
              'วิถีชีวิตคนไทยผูกพันกับสายน้ำ ทั้งการกิน การใช้ การเดินทาง และการทำนา การลอยกระทงจึงเป็นการขอบคุณแม่น้ำที่หล่อเลี้ยงชีวิต และขอขมาที่ได้ใช้น้ำและทำให้น้ำแปดเปื้อนตลอดทั้งปี ความเชื่อนี้สัมพันธ์กับคติพราหมณ์ที่เคารพบูชาแม่น้ำศักดิ์สิทธิ์',
          },
          {
            heading: 'บูชาตามคติพุทธศาสนา',
            body:
              'ตำราทางพุทธศาสนาบางฉบับอธิบายว่า การลอยประทีปเป็นการบูชารอยพระพุทธบาทที่ประทับไว้ริมฝั่งแม่น้ำนัมมทานที และบูชาพระจุฬามณีเจดีย์บนสวรรค์ชั้นดาวดึงส์ ซึ่งบรรจุพระเกศาของพระพุทธเจ้า',
          },
          {
            heading: 'ลอยทุกข์ ลอยโศก',
            body:
              'หลายบ้านนิยมตัดเส้นผม เล็บ หรือใส่เหรียญลงในกระทง เปรียบเหมือนการปล่อยเคราะห์และความทุกข์ให้ลอยไปกับกระแสน้ำ แล้วอธิษฐานขอสิ่งดีงามให้เกิดขึ้นในชีวิต',
          },
          {
            heading: 'องค์ประกอบของกระทง',
            body:
              'กระทงแบบดั้งเดิมทำจากหยวกกล้วยและใบตองพับเป็นกลีบบัว ประดับดอกไม้ ปักธูปและเทียน ธูปเทียนแทนการบูชา ดอกไม้แทนความงาม และแสงเทียนแทนปัญญาที่ส่องทางให้ชีวิต',
          },
        ],
        note: {
          label: 'บันทึกริมขอบสมุด',
          text: 'ยังไม่มีหลักฐานชัดเจนว่าลอยกระทงเริ่มขึ้นเมื่อใด นักวิชาการมองว่าเป็นการผสมผสานคติพราหมณ์ พุทธ และวิถีชาวน้ำ ซึ่งพบประเพณีบูชาน้ำและแสงไฟในฤดูเดียวกันหลายแห่งในเอเชียตะวันออกเฉียงใต้',
        },
      },
      {
        id: 'goddess',
        num: '๒',
        title: 'ความเชื่อเรื่องพระแม่คงคา',
        short: 'แม่คงคา',
        sub: 'เทวีแห่งสายน้ำ • การขอขมา',
        lede:
          'หัวใจของการลอยกระทงคือการขอขมาพระแม่คงคา เทวีผู้เป็นเจ้าแห่งสายน้ำ ผู้ประทานความชุ่มเย็นให้แผ่นดิน และรองรับทุกสิ่งที่มนุษย์ทิ้งลงในน้ำโดยไม่เคยเอ่ยปากตำหนิ',
        sections: [
          {
            heading: 'พระแม่คงคาคือใคร',
            body:
              'ในคติฮินดู "คงคา" คือเทวีแห่งแม่น้ำคงคา แม่น้ำศักดิ์สิทธิ์ที่เชื่อกันว่าชำระบาปได้ ตำนานเล่าว่าพระเจ้าภคีรถบำเพ็ญตบะเพื่อขอให้พระแม่คงคาเสด็จลงจากสวรรค์มาชำระดวงวิญญาณบรรพบุรุษ แต่กระแสน้ำนั้นแรงจนแผ่นดินอาจแตก พระศิวะจึงทรงรองรับสายน้ำไว้ด้วยมวยพระเกศา ก่อนปล่อยให้ไหลลงสู่โลกอย่างอ่อนโยน',
          },
          {
            heading: 'แม่ผู้รักษาน้ำในวิถีไทย',
            body:
              'เมื่อความเชื่อนี้เดินทางมาถึงสุวรรณภูมิ คนไทยนับถือพระแม่คงคาเป็นผู้ดูแลน้ำทั้งปวง ทั้งแม่น้ำ ลำคลอง หนองบึง และเรียกขานด้วยคำว่า "แม่" เช่นเดียวกับแม่โพสพผู้รักษาข้าว และแม่ธรณีผู้รักษาแผ่นดิน สะท้อนความเคารพต่อธรรมชาติที่หล่อเลี้ยงชีวิตเหมือนมารดา',
          },
          {
            heading: 'ทำไมต้องขอขมา',
            body:
              'ตลอดปีที่ผ่านมา เราได้ดื่ม ได้อาบ ได้ใช้น้ำหุงหาอาหาร และอาจทิ้งสิ่งสกปรกลงในน้ำ คืนวันเพ็ญเดือน ๑๒ ที่น้ำเต็มตลิ่งจึงเป็นโอกาสขอบคุณและขอขมาพระแม่คงคา พร้อมขอให้น้ำอุดมสมบูรณ์ ไม่ท่วมไม่แล้ง ให้พืชพันธุ์ธัญญาหารเจริญงอกงามในปีถัดไป',
          },
          {
            heading: 'ข้อปฏิบัติและความเชื่อสืบมา',
            body:
              'ก่อนปล่อยกระทง หลายคนจะจุดธูปเทียน พนมมือ กล่าวขอขมาพระแม่คงคา และตั้งจิตอธิษฐานก่อนวางกระทงลงบนผิวน้ำอย่างนุ่มนวล ผู้ใหญ่หลายบ้านสอนลูกหลานไม่ให้ทิ้งขยะหรือของสกปรกลงแม่น้ำ เพราะถือว่าไม่ให้เกียรติแม่คงคา ขณะที่ชาวเรือก็มีธรรมเนียมเคารพแม่ย่านางผู้รักษาเรือ ซึ่งเป็นอีกหนึ่งความเชื่อเรื่องสิ่งศักดิ์สิทธิ์แห่งสายน้ำ',
          },
          {
            heading: 'รูปลักษณ์ในงานศิลป์',
            body:
              'ในศิลปะอินเดีย พระแม่คงคามักปรากฏเป็นเทวีงามประทับเหนือมกร สัตว์ในตำนานแห่งสายน้ำ ถือหม้อน้ำหรือดอกบัว ส่วนในงานศิลป์ไทยร่วมสมัย มักวาดเป็นเทวีทรงเครื่องแบบไทย ประทับเหนือเกลียวคลื่นหรือดอกบัวกลางแม่น้ำ รายล้อมด้วยกระทงและแสงเทียน',
          },
        ],
        note: {
          label: 'บนท่าน้ำแห่งนี้',
          text: 'เมื่อปล่อยเครื่องสักการะครบทุกชิ้นในรอบ พระแม่คงคาจะปรากฏในซุ้มเรือนแก้วเพื่อประทานพรตอบรับคำขอขมาของท่าน ลองเงียบใจสักครู่ก่อนคลายนิ้วปล่อยกระทง',
        },
      },
      {
        id: 'siam',
        num: '๓',
        title: 'ลอยกระทงในแผ่นดินสยาม',
        short: 'ประวัติ',
        sub: 'สุโขทัย • อยุธยา • รัตนโกสินทร์',
        lede:
          'จากงานรื่นเริงริมน้ำในเมืองโบราณ สู่พระราชพิธีในราชสำนัก และกลายเป็นเทศกาลของคนทั้งประเทศ ลอยกระทงเดินทางผ่านหลายยุคสมัยจนเป็นภาพที่เราเห็นในวันนี้',
        sections: [
          {
            heading: 'สุโขทัยและตำนานนางนพมาศ',
            body:
              'ตำนานที่คุ้นเคยเล่าว่านางนพมาศ สนมเอกในสมัยสุโขทัย ประดิษฐ์กระทงรูปดอกบัวขึ้นเป็นคนแรก เรื่องนี้มาจาก "เรื่องนางนพมาศ หรือตำรับท้าวศรีจุฬาลักษณ์" ซึ่งนักประวัติศาสตร์หลายท่านเห็นว่าแต่งขึ้นในสมัยรัตนโกสินทร์ตอนต้น ส่วนศิลาจารึกหลักที่ ๑ กล่าวถึงการ "เผาเทียน เล่นไฟ" งานรื่นเริงด้วยแสงไฟของชาวเมืองสุโขทัย',
          },
          {
            heading: 'อยุธยาและพระราชพิธีจองเปรียง',
            body:
              'เอกสารสมัยอยุธยากล่าวถึงพระราชพิธีในเดือน ๑๒ ที่ยกโคมไฟขึ้นบนเสาสูงเพื่อบูชา เรียกว่า "จองเปรียง" ควบคู่กับการลอยประทีปในแม่น้ำ แสงไฟบนฟ้าและบนน้ำจึงเป็นหัวใจของเทศกาลนี้มาแต่โบราณ',
          },
          {
            heading: 'รัตนโกสินทร์: จากราชสำนักสู่ประชาชน',
            body:
              'พระราชนิพนธ์ "พระราชพิธีสิบสองเดือน" ในพระบาทสมเด็จพระจุลจอมเกล้าเจ้าอยู่หัว บันทึกพิธีจองเปรียงและการลอยพระประทีปในราชสำนักไว้อย่างละเอียด เมื่อเวลาผ่านไป ลอยกระทงกลายเป็นงานรื่นเริงของประชาชนทั่วไปตามริมแม่น้ำลำคลอง วัด และชุมชนทั่วประเทศ',
          },
          {
            heading: 'ยี่เป็ง: แสงโคมแห่งล้านนา',
            body:
              'ทางภาคเหนือเรียกเทศกาลนี้ว่า "ยี่เป็ง" หมายถึงวันเพ็ญเดือนยี่ตามปฏิทินล้านนา ซึ่งตรงกับเดือน ๑๒ ของภาคกลาง ชาวล้านนาประดับบ้านและวัดด้วยโคมแขวนและซุ้มประตูป่า จุดผางประทีป และปล่อยโคมลอยขึ้นฟ้าเพื่อบูชาพระเกศแก้วจุฬามณี',
          },
          {
            heading: 'สีสันของแต่ละถิ่น',
            body:
              'สุโขทัยจัดงาน "เผาเทียน เล่นไฟ" อย่างยิ่งใหญ่ในอุทยานประวัติศาสตร์ จังหวัดตากมี "ลอยกระทงสาย" ที่จุดประทีปในกะลามะพร้าวลอยเรียงเป็นสายยาวกลางแม่น้ำปิง ส่วนกรุงเทพฯ มีงานลอยกระทงริมแม่น้ำเจ้าพระยาที่ผู้คนออกมาร่วมกันนับแสน',
          },
        ],
      },
      {
        id: 'song',
        num: '๔',
        title: 'เพลงรำวงวันลอยกระทง',
        short: 'บทเพลง',
        sub: 'สุนทราภรณ์ • ครูเอื้อ • ครูแก้ว',
        lede:
          'เมื่อเอ่ยถึงลอยกระทง ทำนองแรกที่คนไทยนึกถึงคือ "รำวงวันลอยกระทง" ของวงดนตรีสุนทราภรณ์ ที่ขึ้นต้นด้วยท่อนคุ้นหู "วันเพ็ญเดือนสิบสอง น้ำก็นองเต็มตลิ่ง"',
        sections: [
          {
            heading: 'ผู้ประพันธ์',
            body:
              'คำร้องโดยครูแก้ว อัจฉริยะกุล ทำนองโดยครูเอื้อ สุนทรสนาน หัวหน้าวงดนตรีสุนทราภรณ์ ประพันธ์ขึ้นในราวทศวรรษ ๒๔๙๐ เป็นเพลงจังหวะรำวง ชวนให้หนุ่มสาวออกมาร่ายรำร่วมกันในค่ำคืนวันเพ็ญ',
          },
          {
            heading: 'วงดนตรีสุนทราภรณ์',
            body:
              'สุนทราภรณ์เป็นวงดนตรีสากลที่ครูเอื้อ สุนทรสนาน ก่อตั้งและควบคุมวง ชื่อวงมาจากการผสมนามสกุล "สุนทรสนาน" เข้ากับชื่อ "อาภรณ์" ภรรยาของท่าน ผลงานเพลงประจำเทศกาลของวง เช่น เพลงลอยกระทง เพลงสงกรานต์ และเพลงอวยพรวันปีใหม่ ยังถูกเปิดกันทุกปีจนถึงวันนี้',
          },
          {
            heading: 'ทำไมเพลงนี้จึงไม่เคยหายไป',
            body:
              'ทำนองรำวงที่ร้องตามได้ง่าย กับเนื้อร้องที่วาดภาพน้ำนองตลิ่ง แสงจันทร์ และการชวนกันมารำวง ทำให้เพลงนี้ถูกเปิดในงานลอยกระทงแทบทุกแห่ง และถูกสอนร้องในโรงเรียนจนกลายเป็นเสียงประจำเทศกาลของคนหลายรุ่น',
          },
        ],
        note: {
          label: 'ฟังด้วยหัวใจ',
          text: 'สมุดเล่มนี้ยกมาเพียงท่อนแรกของบทเพลงด้วยความเคารพต่อลิขสิทธิ์ ลองเปิดฟังฉบับเต็มของวงสุนทราภรณ์ระหว่างลอยกระทงในคืนนี้',
        },
      },
      {
        id: 'popculture',
        num: '๕',
        title: 'ลอยกระทงในวัฒนธรรมสมัยนิยม',
        short: 'ยุคใหม่',
        sub: 'คู่รัก • สิ่งแวดล้อม • โลกออนไลน์',
        lede:
          'ประเพณีเก่าแก่ยังคงมีชีวิต เพราะคนแต่ละรุ่นหยิบมาตีความใหม่ ทั้งในฐานะคืนแห่งความรัก งานประกวด ภาพจำของการท่องเที่ยว และพิธีกรรมบนหน้าจอ',
        sections: [
          {
            heading: 'คืนแห่งคู่รัก',
            body:
              'ในยุคปัจจุบัน ลอยกระทงกลายเป็นคืนออกเดตของคู่รัก หลายคนเชื่อว่าคู่ที่ลอยกระทงใบเดียวกันจะได้อยู่เคียงข้างกันไปนาน ๆ คำพ้องเสียงระหว่าง "ลอยกระทง" กับ "ลอยกะเธอ" จึงกลายเป็นมุกคุ้นหู และเป็นที่มาของชื่อ "ลอย กะ เธอ" ของท่าน้ำแห่งนี้',
          },
          {
            heading: 'นางนพมาศยุคใหม่',
            body:
              'ตำนานนางนพมาศมีชีวิตต่อในเวทีประกวดนางนพมาศและหนูน้อยนพมาศตามโรงเรียน ชุมชน และงานประจำจังหวัด ผู้เข้าประกวดแต่งชุดไทยโบราณ ถือกระทง และกลายเป็นภาพคุ้นตาของเทศกาลทุกปี',
          },
          {
            heading: 'จากกระทงโฟมสู่กระทงรักษ์โลก',
            body:
              'เมื่อขยะกระทงที่ต้องเก็บจากแม่น้ำหลังเทศกาลกลายเป็นปัญหา ผู้คนจึงหันมาใช้กระทงจากหยวกกล้วย ใบตอง ขนมปัง หรือวัสดุย่อยสลายได้ บางแห่งรณรงค์ "หนึ่งครอบครัว หนึ่งกระทง" หรือลอยในสระที่จัดเตรียมไว้แทนแม่น้ำ',
          },
          {
            heading: 'แสงโคมยี่เป็งบนเวทีโลก',
            body:
              'ภาพโคมลอยนับพันดวงลอยขึ้นพร้อมกันในเชียงใหม่ กลายเป็นภาพจำระดับโลกผ่านภาพถ่าย ภาพยนตร์ และโซเชียลมีเดีย ปัจจุบันการปล่อยโคมมีการควบคุมพื้นที่และเวลา เพื่อความปลอดภัยของการบินและป้องกันอัคคีภัย',
          },
          {
            heading: 'ลอยกระทงบนหน้าจอ',
            body:
              'เว็บไซต์ลอยกระทงออนไลน์เกิดขึ้นตั้งแต่ยุคแรกของอินเทอร์เน็ตไทย ให้คนที่อยู่ไกลบ้านได้ส่งคำอธิษฐานลงสายน้ำร่วมกัน ลอย กะ เธอ สานต่อแนวคิดนั้นด้วยการใช้นิ้วมือจริงหยิบกระทงและโคมลอยผ่านกล้อง',
          },
        ],
      },
    ],
  },
  en: {
    header: 'ROYAL BLACK KHOI CHRONICLES • HERITAGE & LORE',
    headerShort: 'FESTIVAL CHRONICLES',
    sub: 'TALES & WISDOM OF THE TWELFTH FULL MOON',
    closeBtn: 'Close Manuscript',
    prevBtn: 'Previous Folio',
    nextBtn: 'Next Folio',
    chapters: [
      {
        id: 'origins',
        num: 'I',
        title: 'Origins of the Full Moon Rite',
        short: 'Origins',
        sub: 'Beliefs • Meaning',
        lede:
          'Loy Krathong falls on the full moon of the twelfth Thai lunar month, usually in November, when the northern floods fill the rivers to their banks and the moon shines at its brightest of the year.',
        sections: [
          {
            heading: 'Asking forgiveness of the Water Goddess',
            body:
              'Thai life has always flowed with the river: for drinking, washing, travel and rice farming. Floating a krathong thanks the waters that sustain life and asks forgiveness of Mae Khongkha, the Water Goddess, for using and polluting them through the year. The idea echoes Brahmanical reverence for sacred rivers.',
          },
          {
            heading: 'A Buddhist offering of light',
            body:
              'Some Buddhist texts describe floating lights as homage to the Buddha’s footprint on the banks of the Nammada River, and to the Chulamani Chedi in Tavatimsa heaven, which enshrines a lock of the Buddha’s hair.',
          },
          {
            heading: 'Letting sorrow drift away',
            body:
              'Many families tuck a strand of hair, a fingernail clipping or a coin into the krathong as a way of sending misfortune downstream, then make a wish for good things ahead.',
          },
          {
            heading: 'Anatomy of a krathong',
            body:
              'A traditional krathong has a base of banana trunk wrapped in banana leaves folded into lotus petals, decorated with flowers, incense and a candle. Incense honours, flowers celebrate beauty, and the candle’s flame stands for wisdom lighting the way.',
          },
        ],
        note: {
          label: 'Margin note',
          text: 'No one knows exactly when Loy Krathong began. Scholars see it as a blend of Brahmanical and Buddhist beliefs with river-based ways of life; water-and-light festivals at the same season appear across Southeast Asia.',
        },
      },
      {
        id: 'goddess',
        num: 'II',
        title: 'Beliefs About Mae Khongkha',
        short: 'Goddess',
        sub: 'Goddess of Waters • Seeking Forgiveness',
        lede:
          'At the heart of Loy Krathong is asking forgiveness of Mae Khongkha, the goddess of waters, she who cools the land and silently receives everything people cast into the river.',
        sections: [
          {
            heading: 'Who is Mae Khongkha?',
            body:
              'In Hindu belief, Ganga is the goddess of the sacred Ganges, whose waters are said to wash away sin. Legend tells that King Bhagiratha performed long austerities to bring her down from heaven to purify his ancestors’ souls. Her torrent was so mighty it could have split the earth, so Shiva caught the river in his matted hair and released it gently to the world.',
          },
          {
            heading: 'A mother of waters in Thai life',
            body:
              'When the belief reached Southeast Asia, Thais came to honour her as guardian of all waters, from rivers and canals to marshes, and call her “Mae”, mother, just as they revere Mae Phosop, mother of rice, and Mae Thorani, mother of the earth. The word reflects a deep respect for nature as the one who nurtures life.',
          },
          {
            heading: 'Why ask forgiveness?',
            body:
              'Through the year we drink, bathe and cook with water, and may let waste flow into it. On the twelfth full moon, when the rivers brim their banks, people thank Mae Khongkha and ask her pardon. They also pray for gentle waters in the year ahead, with no floods, no drought and abundant harvests.',
          },
          {
            heading: 'Customs that live on',
            body:
              'Before releasing a krathong, many light incense, join their palms, ask Mae Khongkha’s forgiveness and make a silent wish before setting it softly on the water. Elders teach children not to throw rubbish into rivers out of respect for her, while boat people honour Mae Ya Nang, the guardian spirit of boats, another thread in Thailand’s reverence for sacred waters.',
          },
          {
            heading: 'How she is depicted',
            body:
              'In Indian art Ganga often stands upon a makara, a mythical water creature, holding a water pot or lotus. Contemporary Thai artists tend to portray her as a goddess in Thai regalia, seated above waves or a lotus in the river, surrounded by krathongs and candlelight.',
          },
        ],
        note: {
          label: 'At this pier',
          text: 'When every offering in a round has been released, Mae Khongkha appears in her golden shrine to bless you in return. Take a quiet breath before you open your fingers to let your krathong go.',
        },
      },
      {
        id: 'siam',
        num: 'III',
        title: 'Loy Krathong Through Siam’s History',
        short: 'History',
        sub: 'Sukhothai • Ayutthaya • Rattanakosin',
        lede:
          'From riverside revelry in ancient cities to royal ceremony and finally a nationwide festival, Loy Krathong has travelled through many eras to become what we celebrate today.',
        sections: [
          {
            heading: 'Sukhothai and the legend of Nang Noppamas',
            body:
              'Popular legend credits Nang Noppamas, a royal consort of Sukhothai, with crafting the first lotus-shaped krathong. The tale comes from the “Treatise of Thao Sri Chulalak”, which many historians believe was written in the early Rattanakosin period. The Sukhothai Inscription No. 1 does, however, mention “burning candles and playing with fire”, a festival of lights in the old city.',
          },
          {
            heading: 'Ayutthaya and the Chong Priang rite',
            body:
              'Ayutthaya-era records describe a twelfth-month royal rite of raising lanterns on tall poles, called Chong Priang, alongside floating lights on the river. Light in the sky and light on the water have been the heart of the festival for centuries.',
          },
          {
            heading: 'Rattanakosin: from court to people',
            body:
              'King Chulalongkorn’s (Rama V) treatise “Royal Ceremonies of the Twelve Months” records the Chong Priang rite and the royal floating of lights in detail. Over time the festival became a celebration for everyone along rivers, canals, temples and communities across the country.',
          },
          {
            heading: 'Yi Peng: lanterns of Lanna',
            body:
              'In the north the festival is called Yi Peng, the full moon of the second month in the Lanna calendar, matching the twelfth month in central Thailand. Homes and temples glow with hanging lanterns and forest-gate arches, oil lamps are lit, and sky lanterns rise in homage to the Chulamani Chedi.',
          },
          {
            heading: 'Colours of every region',
            body:
              'Sukhothai stages a grand “Candles & Lights” festival in its Historical Park; Tak floats Krathong Sai, coconut-shell lamps drifting in a long line down the Ping River; and Bangkok gathers crowds in the hundreds of thousands along the Chao Phraya.',
          },
        ],
      },
      {
        id: 'song',
        num: 'IV',
        title: 'The Song “Ram Wong Wan Loy Krathong”',
        short: 'The Song',
        sub: 'Suntaraporn • Kru Eua • Kru Kaew',
        lede:
          'Say “Loy Krathong” and most Thais will start humming “Ram Wong Wan Loy Krathong” by the Suntaraporn band, opening with the famous line “Wan pen duean sip song, nam ko nong tem taling” (“On the twelfth full moon, the water brims the banks”).',
        sections: [
          {
            heading: 'Who wrote it',
            body:
              'Lyrics by Kru Kaew Atchariyakun and music by Kru Eua Sunthornsanan, leader of the Suntaraporn band, written around the late 1940s to early 1950s. It is a ram wong, a circle-dance song inviting everyone to dance together under the full moon.',
          },
          {
            heading: 'The Suntaraporn band',
            body:
              'Suntaraporn is the big band founded and led by Kru Eua Sunthornsanan. Its name joins his surname, “Sunthornsanan”, with “Aporn”, the name of his wife. The band’s festival songs for Loy Krathong, Songkran and the New Year are still played every season.',
          },
          {
            heading: 'Why it never fades',
            body:
              'An easy, sing-along ram wong melody and lyrics painting brimming rivers, moonlight and an invitation to dance have made it the soundtrack of almost every Loy Krathong fair, and a song taught in schools across generations.',
          },
        ],
        note: {
          label: 'Listen with your heart',
          text: 'Out of respect for copyright, this manuscript quotes only the opening line. Play the full Suntaraporn recording while you float your krathong tonight.',
        },
      },
      {
        id: 'popculture',
        num: 'V',
        title: 'Loy Krathong in Popular Culture',
        short: 'Today',
        sub: 'Romance • Environment • Online',
        lede:
          'An old tradition stays alive because every generation reinterprets it: as a romantic night out, a pageant, an iconic travel image, and even a ritual on screen.',
        sections: [
          {
            heading: 'A night for couples',
            body:
              'Today Loy Krathong is a classic date night, and many believe couples who float a krathong together will stay together. The near-homophone of “Loy Krathong” and “loy ka ter” (“float with you”) is a beloved pun, and the origin of this pier’s name, Loy Kra Ter.',
          },
          {
            heading: 'Nang Noppamas, reimagined',
            body:
              'The Noppamas legend lives on in Nang Noppamas and Little Noppamas pageants at schools, communities and provincial fairs, where contestants in classical Thai dress carry krathongs, a familiar sight every year.',
          },
          {
            heading: 'From foam to eco-krathongs',
            body:
              'As post-festival krathong waste became a real problem, people turned to banana trunk, banana leaves, bread and other biodegradable materials. Some campaigns encourage “one family, one krathong”, or floating in prepared ponds instead of rivers.',
          },
          {
            heading: 'Yi Peng lanterns on the world stage',
            body:
              'Thousands of lanterns rising at once in Chiang Mai have become a worldwide image through photography, film and social media. Releases are now regulated by area and time for aviation safety and fire prevention.',
          },
          {
            heading: 'Loy Krathong on screen',
            body:
              'Online krathong sites appeared in the early days of the Thai internet, letting people far from home send wishes down the river together. Loy Kra Ter continues that idea with your real hands picking up krathongs and lanterns through the camera.',
          },
        ],
      },
    ],
  },
};
