import { useState } from 'react';
import { getValidMainImageIndex } from '../utils/productImages';

export default function ProductModal({ product, settings, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(() =>
    getValidMainImageIndex(product)
  );
  const images = product.images || [];
  const currentImage = images[currentImageIndex] || null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="modal-gallery-side">
          <div className="modal-main-image-box">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.title}
                className="modal-main-image"
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  height: '100%',
                  color: '#999',
                  fontSize: '18px',
                }}
              >
                אין תמונה זמינה
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  className="modal-arrow modal-arrow-left"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  className="modal-arrow modal-arrow-right"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="modal-thumbnails">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`modal-thumb ${
                    index === currentImageIndex ? 'active' : ''
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${product.title} - view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-product-info">
          <h2>{product.title}</h2>

          {product.price && (
            <div className="modal-price">₪{product.price}</div>
          )}

          <p>{product.description}</p>

          <div className="modal-actions">
            <a
              className="btn primary"
              href={`https://wa.me/${settings.whatsapp}?text=Interested in: ${product.title}`}
              target="_blank"
              rel="noreferrer"
            >
              שלח בקשה ב־WhatsApp
            </a>
            <a href={`tel:${settings.phone}`} className="btn secondary">
              📞 התקשרו אלינו
            </a>
          </div>

          <div className="modal-note">
            צרו קשר לפרטים על זמינות, מידות מותאמות, צבעים ואפשרויות משלוח.
          </div>
        </div>
      </div>
    </div>
  );
}
