import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const settingsDoc = doc(db, 'settings', 'site');

export const defaultSettings = {
  storeName: 'רהיטי הבית',
  heroTitle: 'רהיטים יפים לבית שלך',
  heroSubtitle: 'קטלוג רהיטים איכותיים להזמנה דרך WhatsApp או טלפון',
  heroImageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2200&q=80',
  phone: '0501234567',
  whatsapp: '972501234567',
  primaryColor: '#8B5E3C',
  secondaryColor: '#F7F1EA',
  textColor: '#222222',
};

export function listenToSettings(callback) {
  return onSnapshot(settingsDoc, (snapshot) => {
    callback(snapshot.exists() ? { ...defaultSettings, ...snapshot.data() } : defaultSettings);
  });
}

export async function saveSettings(settings) {
  return setDoc(settingsDoc, settings, { merge: true });
}
