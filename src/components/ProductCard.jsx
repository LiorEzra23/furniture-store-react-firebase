import { useState } from 'react';
import ProductModal from './ProductModal';
import { getCategoryLabel } from '../constants/categories';
import { getMainProductImage } from '../utils/productImages';

export default function ProductCard({ product, settings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) return null;

  const mainImage = getMainProductImage(product);
  const imageCount = product.images?.length || 0;
  const categoryLabel = getCategoryLabel(product.category);
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

          {categoryLabel && <span className="product-category">{categoryLabel}</span>}

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
