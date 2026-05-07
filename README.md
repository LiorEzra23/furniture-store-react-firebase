# React Furniture Store - Firebase + Cloudinary

אתר קטלוג רהיטים עם דף לקוח ודף מנהל.

כולל:
- React + Vite
- Firebase Auth לכניסת מנהל
- Firestore לשמירת מוצרים והגדרות עיצוב
- Cloudinary להעלאת תמונות מהמחשב בלי Firebase Storage ובלי אשראי ב-Firebase

## התקנה

```bash
npm install
npm run dev
```

## Firebase

1. צור Firebase Project.
2. הוסף Web App והעתק את ערכי firebaseConfig.
3. הפעל Authentication > Email/Password.
4. צור משתמש מנהל דרך Authentication > Users > Add user.
5. הפעל Firestore Database.
6. ב-Firestore Rules שים:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    match /settings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Cloudinary

1. פתח חשבון Cloudinary.
2. ב-Dashboard העתק את ה-Cloud name.
3. עבור אל Settings > Upload.
4. תחת Upload presets צור preset חדש.
5. שנה Signing Mode ל-Unsigned.
6. שמור את שם ה-preset.

## קובץ .env

צור קובץ `.env` לפי `.env.example`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...
```

אחרי שינוי `.env` חייבים לעצור ולהפעיל מחדש:

```bash
npm run dev
```
