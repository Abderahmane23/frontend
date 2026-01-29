// services/api.js
import { AppConfig } from '../config.js';

/**
 * Fetch products from the API with pagination
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Products per page (default: 15)
 * @returns {Promise<{data: Array, pagination: Object}>}
 */
export async function fetchProducts(page = 1, limit = 15) {
  try {
    const url = `${AppConfig.api('/pieces')}?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    // Assure que chaque produit a image_url
    const products = (json.data || []).map(p => {
      let imageUrl = 'https://via.placeholder.com/300?text=No+Image';
      
      // Si le backend fournit déjà image_url
      if (p.image_url) {
        imageUrl = p.image_url;
      } 
      // Sinon construire à partir de image_filename
      else if (p.image_filename) {
        imageUrl = AppConfig.image(p.image_filename);
      }

      return {
        ...p,
        image_url: imageUrl
      };
    });

    console.log(`✅ Page ${page}: ${products.length} produits chargés`);
    
    return {
      data: products,
      pagination: json.pagination || {
        page,
        limit,
        total: products.length,
        totalPages: 1,
        hasMore: false
      }
    };
  } catch (err) {
    console.error('❌ API fetchProducts error:', err);
    throw err;
  }
}

/**
 * Extract unique categories from products
 * Ne pas inclure 'all' dans la liste
 */
export function extractCategories(products) {
  const uniqueCategories = new Set(
    products
      .map(p => p.categorieId?.nom || p.categorie)
      .filter(Boolean)
  );
  
  return Array.from(uniqueCategories).sort();
}

/**
 * Filter products by category
 */
export function filterByCategory(products, category) {
  if (!category || category === 'all') return products;

  return products.filter(p => {
    const productCategory = p.categorieId?.nom || p.categorie;
    return productCategory === category;
  });
}

/**
 * Search products by name / description / code
 */
export function searchProducts(products, search) {
  if (!search || search.trim() === '') return products;

  const q = search.toLowerCase().trim();

  return products.filter(p => {
    const name = (p.product_name || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const code = (p.code_piece || '').toLowerCase();
    
    return name.includes(q) || desc.includes(q) || code.includes(q);
  });
}

/**
 * Utility to get image URL (optional, fallback)
 */
export function getProductImage(product) {
  if (product.image_url) {
    return product.image_url;
  }
  if (product.image_filename) {
    return `${AppConfig.API_BASE_URL}/images/products/${product.image_filename}`;
  }
  return 'https://via.placeholder.com/300?text=No+Image';
}

export async function fetchEngines() {
  const url = AppConfig.api('/engines');
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchEngineDetails(id) {
  const url = AppConfig.api(`/engines/${id}`);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchPiecesByEngine(id) {
  const url = AppConfig.api(`/engines/${id}/pieces`);
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchBestsellers() {
  const url = AppConfig.api('/bestsellers');
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data || [];
}
