import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import {
  createProduct,
  deleteProduct,
  listenToProducts,
  updateProduct,
  uploadProductImages,
} from '../services/productsService';
import { defaultSettings, saveSettings } from '../services/settingsService';
import { useSettings } from '../context/SettingsContext';
import { CATEGORY_OPTIONS, getCategoryLabel } from '../constants/categories';
import { getValidMainImageIndex } from '../utils/productImages';

const emptyProduct = {
  title: '',
  description: '',
  price: '',
  category: '',
  images: [],
  mainImageIndex: 0,
};

export default function AdminPage() {
  const navigate = useNavigate();
  const settings = useSettings();

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [settingsForm, setSettingsForm] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/admin');
    });

    const unsubscribeProducts = listenToProducts(setProducts);

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, [navigate]);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  useEffect(() => {
    const previews = imageFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImagePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imageFiles]);

  function handleProductChange(event) {
    setProductForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  function handleImagesChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    setImageFiles(selectedFiles);

    setProductForm((prev) => {
      const nextImageCount = (prev.images?.length || 0) + selectedFiles.length;

      return {
        ...prev,
        mainImageIndex:
          Number(prev.mainImageIndex || 0) >= nextImageCount ? 0 : prev.mainImageIndex,
      };
    });
  }

  function setMainImage(index) {
    setProductForm((prev) => ({
      ...prev,
      mainImageIndex: index,
    }));
  }

  function removeExistingImage(indexToRemove) {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
      mainImageIndex:
        prev.mainImageIndex === indexToRemove
          ? 0
          : prev.mainImageIndex > indexToRemove
            ? prev.mainImageIndex - 1
            : prev.mainImageIndex,
    }));
  }

  function resetProductForm() {
    setProductForm(emptyProduct);
    setEditingId(null);
    setImageFiles([]);
    setImagePreviews([]);
    setError('');
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!productForm.category) {
        throw new Error('חובה לבחור קטגוריה למוצר');
      }

      const uploadedImages =
        imageFiles.length > 0 ? await uploadProductImages(imageFiles) : [];

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        images: [...(productForm.images || []), ...uploadedImages],
      };

      payload.mainImageIndex = getValidMainImageIndex(payload);

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetProductForm();
      event.target.reset();
    } catch (err) {
      console.error(err);
      setError(err?.message || 'שמירת המוצר נכשלה');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id);
    setProductForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      images: product.images || [],
      mainImageIndex: getValidMainImageIndex(product),
    });
    setImageFiles([]);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setSettingsLoading(true);
    setSettingsMessage('');

    try {
      await saveSettings(settingsForm);
      setSettingsMessage('העיצוב נשמר בהצלחה');
    } catch (err) {
      console.error(err);
      setSettingsMessage(err?.message || 'שמירת העיצוב נכשלה');
    } finally {
      setSettingsLoading(false);
    }
  }

  function handleSettingsChange(event) {
    setSettingsForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>ניהול אתר</h1>
        <div>
          <a href="/" className="btn secondary">
            צפייה באתר
          </a>
          <button className="btn danger" onClick={() => signOut(auth)}>
            יציאה
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <form className="panel" onSubmit={handleProductSubmit}>
          <h2>{editingId ? 'עריכת מוצר' : 'הוספת מוצר'}</h2>

          <label>שם מוצר</label>
          <input
            name="title"
            value={productForm.title}
            onChange={handleProductChange}
            required
          />

          <label>תיאור</label>
          <textarea
            name="description"
            value={productForm.description}
            onChange={handleProductChange}
            required
          />

          <label>מחיר</label>
          <input
            name="price"
            value={productForm.price}
            onChange={handleProductChange}
            type="number"
            required
          />

          <label>קטגוריה</label>
          <select
            name="category"
            value={productForm.category}
            onChange={handleProductChange}
            required
          >
            <option value="">בחרו קטגוריה</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <label>תמונות מהמחשב</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImagesChange}
          />

          {productForm.images?.length > 0 && (
            <>
              <p>תמונות קיימות</p>
              <div className="admin-image-preview">
                {productForm.images.map((image, index) => (
                  <div
                    className={`admin-image-item ${
                      index === Number(productForm.mainImageIndex || 0) ? 'selected-main' : ''
                    }`}
                    key={image}
                  >
                    <img src={image} alt="" />
                    <button
                      type="button"
                      className="admin-main-image-button"
                      onClick={() => setMainImage(index)}
                    >
                      {index === Number(productForm.mainImageIndex || 0)
                        ? 'תמונה ראשית'
                        : 'הפוך לראשית'}
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => removeExistingImage(index)}
                    >
                      הסר
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {imageFiles.length > 0 && (
            <>
              <p>תמונות חדשות לפני שמירה</p>
              <div className="admin-image-preview">
                {imagePreviews.map((preview, index) => {
                  const finalIndex = (productForm.images?.length || 0) + index;

                  return (
                    <div
                      className={`admin-image-item ${
                        finalIndex === Number(productForm.mainImageIndex || 0)
                          ? 'selected-main'
                          : ''
                      }`}
                      key={`${preview.name}-${preview.url}`}
                    >
                      <img src={preview.url} alt="" />
                      <span className="admin-new-image-badge">חדשה</span>
                      <button
                        type="button"
                        className="admin-main-image-button"
                        onClick={() => setMainImage(finalIndex)}
                      >
                        {finalIndex === Number(productForm.mainImageIndex || 0)
                          ? 'תמונה ראשית'
                          : 'הפוך לראשית'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {error && <p className="error">{error}</p>}

          <button className="btn primary" disabled={loading} type="submit">
            {loading ? 'שומר...' : editingId ? 'עדכן מוצר' : 'שמור מוצר'}
          </button>

          {editingId && (
            <button type="button" className="btn secondary" onClick={resetProductForm}>
              ביטול עריכה
            </button>
          )}
        </form>

        <form className="panel" onSubmit={handleSettingsSubmit}>
          <h2>עיצוב והגדרות</h2>

          <label>שם החנות</label>
          <input
            name="storeName"
            value={settingsForm.storeName || ''}
            onChange={handleSettingsChange}
          />

          <label>כותרת ראשית</label>
          <input
            name="heroTitle"
            value={settingsForm.heroTitle || ''}
            onChange={handleSettingsChange}
          />

          <label>תיאור ראשי</label>
          <textarea
            name="heroSubtitle"
            value={settingsForm.heroSubtitle || ''}
            onChange={handleSettingsChange}
          />

          <label>תמונת רקע ראשית</label>
          <input
            name="heroImageUrl"
            value={settingsForm.heroImageUrl || ''}
            onChange={handleSettingsChange}
            placeholder="https://..."
            type="url"
          />

          {settingsForm.heroImageUrl && (
            <div className="admin-hero-preview">
              <img src={settingsForm.heroImageUrl} alt="תצוגה מקדימה לתמונת הרקע" />
              <a href={settingsForm.heroImageUrl} target="_blank" rel="noreferrer">
                קישור לתמונה הנוכחית
              </a>
            </div>
          )}

          <label>טקסט קטן מעל הקטלוג</label>
          <input
            name="catalogEyebrow"
            value={settingsForm.catalogEyebrow || ''}
            onChange={handleSettingsChange}
          />

          <label>כותרת הקטלוג</label>
          <input
            name="catalogTitle"
            value={settingsForm.catalogTitle || ''}
            onChange={handleSettingsChange}
          />

          <label>תיאור הקטלוג</label>
          <textarea
            name="catalogDescription"
            value={settingsForm.catalogDescription || ''}
            onChange={handleSettingsChange}
          />

          <label>טלפון</label>
          <input
            name="phone"
            value={settingsForm.phone || ''}
            onChange={handleSettingsChange}
          />

          <label>WhatsApp בפורמט בינלאומי</label>
          <input
            name="whatsapp"
            value={settingsForm.whatsapp || ''}
            onChange={handleSettingsChange}
          />

          <div className="colors-row">
            <label>
              צבע ראשי
              <input
                name="primaryColor"
                type="color"
                value={settingsForm.primaryColor || '#8B5E3C'}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              צבע רקע
              <input
                name="secondaryColor"
                type="color"
                value={settingsForm.secondaryColor || '#F7F1EA'}
                onChange={handleSettingsChange}
              />
            </label>

            <label>
              צבע טקסט
              <input
                name="textColor"
                type="color"
                value={settingsForm.textColor || '#222222'}
                onChange={handleSettingsChange}
              />
            </label>
          </div>

          <button className="btn primary" disabled={settingsLoading} type="submit">
            {settingsLoading ? 'שומר...' : 'שמור עיצוב'}
          </button>

          {settingsMessage && <p>{settingsMessage}</p>}
        </form>
      </section>

      <section className="panel">
        <h2>מוצרים קיימים</h2>

        <div className="admin-products">
          {products.map((product) => (
            <div className="admin-product" key={product.id}>
              {product.images?.[0] && <img src={product.images[0]} alt="" />}

              <div>
                <strong>{product.title}</strong>
                <p>₪{Number(product.price).toLocaleString('he-IL')}</p>
                <small>
                  {getCategoryLabel(product.category) || 'ללא קטגוריה'} · {product.images?.length || 0} תמונות
                </small>
              </div>

              <button className="btn secondary" onClick={() => startEdit(product)}>
                עריכה
              </button>

              <button className="btn danger" onClick={() => deleteProduct(product.id)}>
                מחיקה
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
