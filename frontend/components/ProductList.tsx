"use client";

import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../lib/api";

const FALLBACK_IMAGE = "/no-image.svg";

const formatPrice = (price: string) => {
  const value = String(price || "").trim();
  if (!value) return "Rs 0";

  const numericPart = value
    .replace(/^(rs\.?\s*|₹)\s*/i, "")
    .replace(/,/g, "")
    .trim();
  const amount = Number(numericPart);

  if (Number.isFinite(amount)) {
    const decimalDigits = (numericPart.split(".")[1] || "").length;
    const formatted = new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: decimalDigits > 0 ? Math.min(decimalDigits, 2) : 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs ${formatted}`;
  }

  return /^(rs\.?\s*|₹)/i.test(value) ? value : `Rs ${value}`;
};

type ProductImage = {
  id: number;
  image_data_url: string;
  image_order: number;
};

type Product = {
  id: number;
  title: string;
  category: string;
  artisan: string | null;
  price: string;
  image_url: string | null;
  image_data_urls: ProductImage[];
  description: string | null;
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow p-3 sm:p-5 flex flex-col items-center border border-teal-100 gap-2 sm:gap-3" style={{ minHeight: 280 }}>
      <div className="skeleton w-32 sm:w-44 h-32 sm:h-44 rounded-xl" />
      <div className="skeleton w-3/4 h-3 sm:h-4 rounded" />
      <div className="skeleton w-1/2 h-2 sm:h-3 rounded" />
      <div className="skeleton w-1/3 h-3 sm:h-4 rounded" />
      <div className="skeleton w-20 sm:w-24 h-7 sm:h-8 rounded-full mt-auto" />
    </div>
  );
}

type ImageModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

function ImageModal({ product, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !product) return null;

  const images = product.image_data_urls && product.image_data_urls.length > 0 ? product.image_data_urls : [];
  const currentImage = images.length > 0 ? images[currentIndex]?.image_data_url : FALLBACK_IMAGE;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setZoomLevel(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setZoomLevel(1);
  };

  const handleImageWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => Math.min(4, Math.max(1, Number((prev + delta).toFixed(2)))));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-teal-100">
          <div className="flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-teal-800">{product.title}</h2>
            <p className="text-sm text-teal-600 mt-1">{product.artisan || "Handcrafted Collection"}</p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Image Viewer */}
        <div className="flex-1 flex items-center justify-center bg-teal-50 relative overflow-hidden p-3 sm:p-6">
          <div
            onWheel={handleImageWheelZoom}
            className="h-full w-full flex items-center justify-center overflow-auto"
          >
            <img
              src={currentImage}
              alt={`${product.title} - Image ${currentIndex + 1}`}
              className={`max-h-full max-w-full object-contain rounded-lg transition-transform duration-150 ${zoomLevel > 1 ? "cursor-zoom-out" : "cursor-zoom-in"}`}
              style={{ transform: `scale(${zoomLevel})` }}
              onDoubleClick={resetZoom}
            />
          </div>

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-black/60 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold">
            {Math.round(zoomLevel * 100)}%
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-teal-600/80 hover:bg-teal-700 text-white p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-teal-600/80 hover:bg-teal-700 text-white p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-black/60 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Thumbnail Navigation */}
              <div className="absolute bottom-2 left-2 right-14 sm:bottom-4 sm:left-4 sm:right-4 flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setZoomLevel(1);
                    }}
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === currentIndex
                        ? "border-teal-600 ring-2 ring-teal-400"
                        : "border-teal-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img.image_data_url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-teal-100 bg-teal-50">
          <div className="mb-4">
            <p className="text-base sm:text-lg font-semibold text-teal-700 mb-2">{formatPrice(product.price)}</p>
            {product.description && (
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            )}
          </div>
          <a
            href="#contact"
            onClick={onClose}
            className="block w-full px-6 py-3 rounded-full bg-teal-600 text-white text-center font-semibold hover:bg-teal-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg !no-underline"
          >
            Enquire Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState("ALL");
  const [imageIndices, setImageIndices] = useState<{ [productId: number]: number }>({});
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/products`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.detail || "Unable to load products");
        }
        setProducts(data.products || []);
        // Initialize image indices for carousel
        const indices: { [productId: number]: number } = {};
        (data.products || []).forEach((product: Product) => {
          indices[product.id] = 0;
        });
        setImageIndices(indices);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load products");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Carousel auto-rotation effect (only for cards, not when modal is open)
  useEffect(() => {
    if (isModalOpen) return; // Don't auto-rotate when modal is open

    const interval = setInterval(() => {
      setImageIndices((prev) => {
        const updated = { ...prev };
        products.forEach((product) => {
          if (product.image_data_urls && product.image_data_urls.length > 0) {
            updated[product.id] = (updated[product.id] || 0) + 1;
            if (updated[product.id] >= product.image_data_urls.length) {
              updated[product.id] = 0;
            }
          }
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products, isModalOpen]);

  const categories = useMemo(() => {
    const dynamic = Array.from(new Set(products.map((product) => product.category))).sort();
    return ["ALL", ...dynamic];
  }, [products]);

  const filtered = selected === "ALL" ? products : products.filter(p => p.category === selected);

  const getProductImage = (product: Product): string => {
    if (product.image_data_urls && product.image_data_urls.length > 0) {
      const currentIndex = imageIndices[product.id] || 0;
      return product.image_data_urls[currentIndex]?.image_data_url || FALLBACK_IMAGE;
    }
    return product.image_url || FALLBACK_IMAGE;
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Category filter pills */}
      <div className="flex gap-2 justify-start sm:justify-center mb-6 sm:mb-10 overflow-x-auto pb-2">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setSelected(cat)}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`animate-fade-in-up px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-semibold transition-all duration-200 border-2 whitespace-nowrap active:scale-95 ${
              selected === cat
                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200"
                : "bg-white text-teal-600 border-teal-200 hover:bg-teal-50 hover:border-teal-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skeleton loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 text-center mb-8">
          {errorMessage}
        </div>
      )}

      {/* Product grid */}
      {!isLoading && !errorMessage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-teal-100 animate-fade-in-up overflow-hidden transition-all duration-300 flex flex-col h-full"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {/* Image Container */}
              <div
                className="relative w-full aspect-square overflow-hidden bg-teal-50 cursor-pointer group"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Category Badge */}
                <span className="absolute top-3 right-3 bg-teal-600/95 text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wider shadow-lg">
                  {product.category}
                </span>
                
                {/* Image Counter */}
                {product.image_data_urls && product.image_data_urls.length > 1 && (
                  <>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {(imageIndices[product.id] || 0) + 1}/{product.image_data_urls.length}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
                      <div className="bg-white/90 backdrop-blur-sm text-teal-800 px-4 py-2 rounded-lg text-center">
                        <p className="text-sm font-bold">Click to view</p>
                        <p className="text-xs mt-0.5">all images</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="p-3 sm:p-6 flex flex-col flex-grow">
                {/* Title */}
                <h3 className="font-bold text-base sm:text-lg text-teal-800 mb-1 sm:mb-2 line-clamp-2 leading-tight">
                  {product.title}
                </h3>

                {/* Artisan */}
                <p className="text-[10px] sm:text-xs font-semibold text-teal-500 uppercase tracking-wide mb-2 sm:mb-4 opacity-80">
                  {product.artisan || "Handcrafted Collection"}
                </p>

                {/* Description */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-zinc-600 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-3 sm:mb-6 pt-2 sm:pt-3 border-t border-teal-100">
                  <p className="text-lg sm:text-2xl font-bold text-teal-700">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Enquire Button */}
                <a
                  href="#contact"
                  className="mt-auto w-full px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-teal-600 text-white text-center font-bold text-xs sm:text-sm hover:bg-teal-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg !no-underline"
                >
                  Enquire Now →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !errorMessage && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-4xl mb-3">✦</p>
          <p className="font-medium">No products in this category yet.</p>
        </div>
      )}

      {/* Marquee ticker */}
      <div className="mt-14 overflow-hidden border-y border-teal-100 py-3 bg-teal-50/60">
        <div className="animate-marquee whitespace-nowrap text-teal-600 font-medium text-sm inline-block">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              Sarees &nbsp;✦&nbsp; Dresses &nbsp;✦&nbsp; Accessories &nbsp;✦&nbsp; Gift Items &nbsp;✦&nbsp;
              Handloom &nbsp;✦&nbsp; Embroidery &nbsp;✦&nbsp; Bridal &nbsp;✦&nbsp; Festive &nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal product={selectedProduct} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
