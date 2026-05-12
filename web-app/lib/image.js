/**
 * Auto-Optimization & Smart-Resizing Utility
 * Designed for the DRIVE Mauritius Marketplace
 */

const ASPECT_RATIO = 16 / 10; 
// The CORRECT Supabase Project URL from .env.local
const SUPABASE_PROJECT_URL = 'https://kudlhuakeegskajyxwxo.supabase.co';
const FALLBACK_IMAGE = '/assets/hero_bg.png';

export const optimizeImage = (url) => {
  if (!url || url === '') return FALLBACK_IMAGE;

  // 1. Handle Local Public Assets
  if (url.startsWith('/assets/') || url.startsWith('assets/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return cleanPath;
  }

  // 2. Handle Supabase Storage URLs (Static or Dynamic)
  if (url.includes('supabase.co')) {
    return url;
  }

  // 3. Handle Relative Paths from Admin Uploads
  if (url.startsWith('/storage/v1/object/public/')) {
    return `${SUPABASE_PROJECT_URL}${url}`;
  }

  // 4. Handle Bucket Names directly (e.g. "car-assets/image.png")
  if (!url.startsWith('http') && url.includes('/')) {
    return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${url}`;
  }

  // 5. Handle raw filenames if possible
  if (!url.startsWith('http') && !url.includes('/')) {
     return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/car-assets/${url}`;
  }

  return url;
};

/**
 * React Image Component with Auto-Adjust Logic
 */
export const SmartImage = ({ src, alt, className = "", ...props }) => {
  const optimizedSrc = optimizeImage(src);

  return (
    <div className={`relative overflow-hidden bg-transparent ${className}`} style={{ aspectRatio: ASPECT_RATIO }}>
      <img
        src={optimizedSrc}
        alt={alt}
        className="w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-110"
        loading="lazy"
        onError={(e) => {
          if (e.target.src !== FALLBACK_IMAGE) {
            e.target.src = FALLBACK_IMAGE;
            e.target.className = "w-full h-full object-cover opacity-20 grayscale";
          }
        }}
        {...props}
      />
    </div>
  );
};