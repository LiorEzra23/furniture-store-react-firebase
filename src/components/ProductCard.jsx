import { useState } from 'react';
import ProductModal from './ProductModal';

export default function ProductCard({ product, settings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) return null;

  const mainImage = product.images?.[0] || null;
  const imageCount = product.images?.length || 0;
  const formattedPrice = product.price
    ? `₪${Number(product.price).toLocaleString('he-IL')}`
    : 'צרו קשר';

  return (
    <>
      <article className="product-card">
        <button
          type="button"
          className="product-image-wrap"
          onClick={() => setIsModalOpen(true)}
          aria-label={`פתח פרטים עבור ${product.title}`}
        >
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="product-main-image"
              loading="lazy"
            />
          ) : (
            <div className="product-no-image">אין תמונה</div>
          )}

          {imageCount > 1 && (
            <span className="image-count-badge">
              📸 {imageCount} תמונות
            </span>
          )}

          <span className="quick-view-badge">צפייה מהירה</span>
        </button>

        <div className="product-content">
          <div className="product-title-row">
            <h3>{product.title}</h3>
          </div>

          {product.description && (
            <p className="product-short-description">
              {product.description}
            </p>
          )}

          <div className="product-bottom">
            <span className="product-price">{formattedPrice}</span>

            <button
              type="button"
              className="product-view-button"
              onClick={() => setIsModalOpen(true)}
            >
              צפה בפרטים
            </button>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <ProductModal
          product={product}
          settings={settings}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}