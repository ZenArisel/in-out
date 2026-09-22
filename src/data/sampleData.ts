import { Transaction } from '../types';

export function generateSampleTransactions(userId: string): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');

  return [
    {
      userId,
      type: 'income',
      amount: 45000,
      category: 'เงินเดือน / ค่าจ้าง',
      date: `${year}-${month}-01`,
      note: 'เงินเดือนประจำเดือน',
      paymentMethod: 'transfer',
    },
    {
      userId,
      type: 'expense',
      amount: 8500,
      category: 'ที่อยู่อาศัย / ค่าน้ำค่าไฟ',
      date: `${year}-${month}-02`,
      note: 'ค่าเช่าห้องพัก + ค่าน้ำค่าไฟ',
      paymentMethod: 'transfer',
    },
    {
      userId,
      type: 'expense',
      amount: 1250,
      category: 'อาหารและเครื่องดื่ม',
      date: `${year}-${month}-03`,
      note: 'ซื้อของสดและของกินเข้าตู้เย็น',
      paymentMethod: 'credit_card',
    },
    {
      userId,
      type: 'expense',
      amount: 350,
      category: 'การเดินทาง / ยานพาหนะ',
      date: `${year}-${month}-04`,
      note: 'เติมเงินบัตรรถไฟฟ้า MRT/BTS',
      paymentMethod: 'transfer',
    },
    {
      userId,
      type: 'expense',
      amount: 140,
      category: 'อาหารและเครื่องดื่ม',
      date: `${year}-${month}-05`,
      note: 'กาแฟและอาหารกลางวัน',
      paymentMethod: 'cash',
    },
    {
      userId,
      type: 'income',
      amount: 3500,
      category: 'ธุรกิจส่วนตัว / ค้าขาย',
      date: `${year}-${month}-07`,
      note: 'รับงานฟรีแลนซ์ออกแบบสื่อ',
      paymentMethod: 'transfer',
    },
    {
      userId,
      type: 'expense',
      amount: 1990,
      category: 'ช้อปปิ้งและของใช้',
      date: `${year}-${month}-09`,
      note: 'อุปกรณ์ทำงานและของใช้ในบ้าน',
      paymentMethod: 'credit_card',
    },
    {
      userId,
      type: 'expense',
      amount: 2500,
      category: 'การออมและการลงทุน',
      date: `${year}-${month}-10`,
      note: 'DCA กองทุนรวมดัชนีหุ้น',
      paymentMethod: 'transfer',
    },
    {
      userId,
      type: 'expense',
      amount: 590,
      category: 'ความบันเทิง / ท่องเที่ยว',
      date: `${year}-${month}-12`,
      note: 'ดูภาพยนตร์และขนมกับเพื่อน',
      paymentMethod: 'credit_card',
    },
    {
      userId,
      type: 'expense',
      amount: 420,
      category: 'สุขภาพและการรักษา',
      date: `${year}-${month}-15`,
      note: 'วิตามินบำรุงและยาสามัญประจำบ้าน',
      paymentMethod: 'transfer',
    }
  ];
}
