/** 
 * Configuration - Development or Production
 * Uses Vite proxy in development (relative URLs), direct Beam Cloud URLs in production
 */

export const AppConfig = {
  ENV: import.meta.env.MODE || 'development',

  // ===== API =====
  // In development: use relative URL (Vite proxy handles it)
  // In production: use full Beam Cloud URL
  API_BASE_URL:
    import.meta.env.VITE_API_URL || 
    (import.meta.env.DEV 
      ? '' // Empty string for relative URLs in development (Vite proxy will handle it)
      : 'piecespoidslourdsguinee.com'),
  // ===== IMAGES =====
  // In development: use relative URL (Vite proxy handles it)
  // In production: use full Beam Cloud URL
  IMAGES_BASE_URL:
    import.meta.env.VITE_IMAGES_URL || 
    (import.meta.env.DEV
      ? '/images/products' // Relative URL in development (Vite proxy will handle it)
      : 'piecespoidslourdsguinee.com/images/products'),

  // ===== PAGINATION =====
  PRODUCTS_PER_PAGE: 10,
  LOAD_MORE_COUNT: 10,

  // ===== HELPERS =====
  
  /**
   * Construire l'URL complète d'une route API
   * @param {string} path - Ex: '/pieces' ou '/auth/login'
   * @returns {string} URL complète
   */
  api(path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.API_BASE_URL}/api${cleanPath}`;
  },

  /**
   * Construire l'URL d'une image de manière intelligente
   * @param {string} filename - Nom du fichier (ex: 'DZ95189586602.jpg')
   * @returns {string} URL complète de l'image
   */
  image(filename) {
    if (!filename) {
      return 'https://via.placeholder.com/300?text=No+Image';
    }

    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }

    return `${this.IMAGES_BASE_URL}/${filename}`;
  },

  /**
   * Formater le prix en francs guinéens
   * @param {number} price
   * @returns {string} Prix formaté (ex: "25 000 GNF")
   */
  formatPrice(price) {
    if (!price && price !== 0) return 'Prix non disponible';
    return `${new Intl.NumberFormat('fr-FR').format(price)} GNF`;
  }
};

// Log pour vérifier la configuration
console.log('🔧 AppConfig loaded:', {
  ENV: AppConfig.ENV,
  API_BASE_URL: AppConfig.API_BASE_URL,
  IMAGES_BASE_URL: AppConfig.IMAGES_BASE_URL,
  testApiUrl: AppConfig.api('/pieces'),
  testImageUrl: AppConfig.image('test.jpg')
});
