import { KrathongConfig, OfferingSlotConfig } from '@/types/krathong';

export const FLOAT_LIFESPAN_MS = 24000;
export const AMBIENT_CYCLE_MS = 38000;
export const BLESSING_MODAL_DELAY_MS = 7800;

export const THAI_NUMERALS = ['๑', '๒', '๓', '๔', '๕'];

export const DEFAULT_KRATHONG_CONFIG: KrathongConfig = {
  baseColor: '#2D6A4F',
  flowerColor: '#FF99C8',
  candleColor: '#F4D06F',
  baseStyle: 'classic-lotus',
  wishText: 'ลอยทุกข์โศกโรคภัย ให้ไหลลับกับสายชล',
  authorName: '',
  offeringCount: 1,
  selectedSlotIndex: 0,
};

export const DEFAULT_SLOT_PRESETS: Omit<OfferingSlotConfig, 'id'>[] = [
  {
    itemType: 'krathong',
    baseColor: '#2D6A4F',
    flowerColor: '#FF99C8',
    candleColor: '#F4D06F',
    baseStyle: 'classic-lotus',
    wishText: 'ลอยทุกข์โศกโรคภัย ให้ไหลลับกับสายชล',
    authorName: '',
  },
  {
    itemType: 'lantern',
    baseColor: '#40916C',
    flowerColor: '#F4D06F',
    candleColor: '#FF8C42',
    baseStyle: 'layered-star',
    wishText: 'โคมทองลอยขึ้นฟ้า ปรารถนาสิ่งใดสมหวัง',
    authorName: '',
  },
  {
    itemType: 'krathong',
    baseColor: '#52B788',
    flowerColor: '#FFF275',
    candleColor: '#F4D06F',
    baseStyle: 'royal-pleat',
    wishText: 'คืนเพ็ญเดือนสิบสอง ขอชีวามีสุขศรี',
    authorName: '',
  },
  {
    itemType: 'krathong',
    baseColor: '#B5838D',
    flowerColor: '#E0AAFF',
    candleColor: '#FFF275',
    baseStyle: 'classic-lotus',
    wishText: 'จันทร์กระจ่างกลางนภา ขอชีวาไร้โรคา',
    authorName: '',
  },
  {
    itemType: 'lantern',
    baseColor: '#2D6A4F',
    flowerColor: '#FF8C42',
    candleColor: '#F4D06F',
    baseStyle: 'royal-pleat',
    wishText: 'ประทีปทองส่องนำทาง ให้สว่างทั้งกายใจ',
    authorName: '',
  },
];
