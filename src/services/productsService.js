import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const productsRef = collection(db, 'products');

// =====================
// LISTEN
// =====================
export function listenToProducts(callback) {
  const q = query(productsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
      images: item.data().images || [],
    }));

    callback(products);
  });
}

// =====================
// GET SINGLE
// =====================
export async function getProduct(id) {
  const snapshot = await getDoc(doc(db, 'products', id));

  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  return {
    id: snapshot.id,
    ...data,
    images: data.images || [],
  };
}

async function uploadImagesToCloudinary(files, folder) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Missing Cloudinary config. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env'
    );
  }

  const uploads = Array.from(files).map(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Cloudinary upload failed');
    }

    return data.secure_url;
  });

  return Promise.all(uploads);
}

// =====================
// CLOUDINARY UPLOAD
// =====================
export async function uploadProductImages(files) {
  return uploadImagesToCloudinary(files, 'furniture-store/products');
}

export async function uploadHeroImage(file) {
  const [imageUrl] = await uploadImagesToCloudinary([file], 'furniture-store/hero');
  return imageUrl;
}

// =====================
// CREATE
// =====================
export async function createProduct(product) {
  return addDoc(productsRef, {
    title: product.title,
    description: product.description,
    price: Number(product.price),
    images: product.images || [], 
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// =====================
// UPDATE
// =====================
export async function updateProduct(id, product) {
  return updateDoc(doc(db, 'products', id), {
    title: product.title,
    description: product.description,
    price: Number(product.price),
    images: product.images || [],
    updatedAt: serverTimestamp(),
  });
}

// =====================
// DELETE
// =====================
export async function deleteProduct(id) {
  return deleteDoc(doc(db, 'products', id));
}
