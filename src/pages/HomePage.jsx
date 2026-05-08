import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { listenToProducts } from '../services/productsService';
import { CATEGORY_OPTIONS } from '../constants/categories';

export default function HomePage() {
  const settings = useSettings();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const heroImageUrl =
    settings.heroImageUrl ||
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2200&q=80';

  const availableCategories = useMemo(() => {
    const productCategories = new Set(products.map((product) => product.category).filter(Boolean));
    return CATEGORY_OPTIONS.filter((category) => productCategories.has(category.value));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [products, selectedCategory]);

  useEffect(() => {
    const unsubscribe = listenToProducts((nextProducts) => {
      setProducts(nextProducts);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (
      selectedCategory !== 'all' &&
      !availableCategories.some((category) => category.value === selectedCategory)
    ) {
      setSelectedCategory('all');
    }
  }, [availableCategories, selectedCategory]);

  return (
    <main>
      <header className="site-header">
        <a href="/" className="brand">
          <span>{settings.storeName}</span>
        </a>

        <a href="#contact" className="header-contact-link">
          יצירת קשר
        </a>
      </header>

      <section
        className="hero"
        style={{ '--hero-image': `url("${heroImageUrl}")` }}
      >
        <div className="hero-content">
          <span className="eyebrow">קטלוג רהיטים להזמנה ישירה</span>
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroSubtitle}</p>

          <div className="hero-actions">
            <a className="btn primary" href="#catalog">
              צפייה בקטלוג
            </a>

            <a
              className="btn secondary"
              href={`https://wa.me/${settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>

      </section>

      <section className="store-benefits">
        <div>
          <strong>בחירה לפי תמונות</strong>
          <span>כל מוצר מוצג עם גלריה ברורה</span>
        </div>
        <div>
          <strong>הזמנה ישירה</strong>
          <span>פנייה מהירה דרך WhatsApp או טלפון</span>
        </div>
        <div>
          <strong>קטלוג מתעדכן</strong>
          <span>מוצרים חדשים מתווספים בקלות</span>
        </div>
      </section>

      <section className="products-section" id="catalog">
        <div className="section-heading">
          <span className="eyebrow">{settings.catalogEyebrow}</span>
          <h2>{settings.catalogTitle}</h2>
          <p>{settings.catalogDescription}</p>
        </div>

        {!productsLoading && availableCategories.length > 0 && (
          <div className="category-filter" aria-label="סינון לפי קטגוריה">
            <button
              type="button"
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              הכל
            </button>

            {availableCategories.map((category) => (
              <button
                type="button"
                className={selectedCategory === category.value ? 'active' : ''}
                onClick={() => setSelectedCategory(category.value)}
                key={category.value}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        {productsLoading ? (
          <div className="products-grid" aria-label="טוען מוצרים">
            {Array.from({ length: 6 }).map((_, index) => (
              <article className="product-card product-skeleton" key={index}>
                <div className="skeleton-image" />
                <div className="product-content">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                  <div className="product-bottom">
                    <div className="skeleton-line skeleton-price" />
                    <div className="skeleton-button" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="empty-state">עדיין לא נוספו מוצרים.</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        )}
      </section>

      <section className="contact-box" id="contact">
        <span className="eyebrow">צרו קשר</span>
        <h2>רוצים לשמוע פרטים?</h2>
        <p>שלחו לנו הודעה ב־WhatsApp או התקשרו אלינו, ונעזור עם זמינות, מידות ופרטים נוספים.</p>

        <div className="contact-actions">
          <a
            className="btn primary"
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noreferrer"
          >
            פתח שיחת WhatsApp
          </a>

          <a href={`tel:${settings.phone}`} className="btn secondary">
            📞 {settings.phone}
          </a>
        </div>
      </section>
    </main>
  );
}
