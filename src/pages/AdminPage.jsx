import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import {
  createProduct,
  deleteProduct,
  listenToProducts,
  updateProduct,
  uploadHeroImage,
  uploadProductImages,
} from '../services/productsService';
import { defaultSettings, saveSettings } from '../services/settingsService';
import { useSettings } from '../context/SettingsContext';

const emptyProduct = { title: '', description: '', price: '', images: [] };

export default function AdminPage() {
  const navigate = useNavigate();
  const settings = useSettings();

  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [heroImageFile, setHeroImageFile] = useState(null);
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

  function handleProductChange(event) {
    setProductForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  function handleImagesChange(event) {
    setImageFiles(Array.from(event.target.files || []));
  }

  function handleHeroImageChange(event) {
    setHeroImageFile(event.target.files?.[0] || null);
  }

  function removeExistingImage(indexToRemove) {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  }

  function resetProductForm() {
    setProductForm(emptyProduct);
    setEditingId(null);
    setImageFiles([]);
    setError('');
  }

  async function handleProductSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const uploadedImages =
        imageFiles.length > 0 ? await uploadProductImages(imageFiles) : [];

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        images: [...(productForm.images || []), ...uploadedImages],
      };

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
      images: product.images || [],
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
      const heroImageUrl = heroImageFile
        ? await uploadHeroImage(heroImageFile)
        : settingsForm.heroImageUrl;

      await saveSettings({ ...settingsForm, heroImageUrl });
      setHeroImageFile(null);
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
                  <div className="admin-image-item" key={image}>
                    <img src={image} alt="" />
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
            <p>{imageFiles.length} תמונות חדשות נבחרו</p>
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
            type="file"
            accept="image/*"
            onChange={handleHeroImageChange}
          />

          {heroImageFile && <p>תמונה חדשה נבחרה: {heroImageFile.name}</p>}

          {settingsForm.heroImageUrl && (
            <div className="admin-hero-preview">
              <img src={settingsForm.heroImageUrl} alt="תצוגה מקדימה לתמונת הרקע" />
              <a href={settingsForm.heroImageUrl} target="_blank" rel="noreferrer">
                קישור לתמונה הנוכחית
              </a>
            </div>
          )}

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
                <small>{product.images?.length || 0} תמונות</small>
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
