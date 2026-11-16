export const wardrobeCategories = [
  { id: 'sarees', label: 'Sarees & Ethnic', detail: 'Silk · heirloom · occasion', audience: 'Women', assetId: 'sareeGarment', position: [-9.15, 5.25, -8], rotation: [0, Math.PI / 2, 0], camera: [-4.2, 5.8, 4.5] },
  { id: 'lehenga', label: 'Lehengas & Gowns', detail: 'Drape · detail · ceremony', audience: 'Women', assetId: 'lehengaGarment', position: [0, 5.35, -13.55], rotation: [0, 0, 0], camera: [0, 6.8, 1.5] },
  { id: 'kurtis', label: 'Kurtis & Salwar', detail: 'Everyday · festive · ease', audience: 'Women', assetId: 'kurtaSetGarment', position: [-9.15, 5.25, 0], rotation: [0, Math.PI / 2, 0], camera: [-4.2, 5.8, 13] },
  { id: 'western-dresses', label: 'Western Dresses', detail: 'Modern silhouettes', audience: 'Women', assetId: 'westernDressGarment', position: [9.15, 5.25, -8], rotation: [0, -Math.PI / 2, 0], camera: [4.2, 5.8, 4.5] },
  { id: 'tops-shirts', label: 'Tops & Shirts', detail: 'Everyday · considered', audience: 'Women', assetId: 'topsGarment', position: [9.15, 5.25, 0], rotation: [0, -Math.PI / 2, 0], camera: [4.2, 5.8, 13] },
  { id: 'denim-trousers', label: 'Jeans & Trousers', detail: 'Denim · tailoring · fit', audience: 'Women', assetId: 'trousersGarment', position: [9.15, 5.25, 8], rotation: [0, -Math.PI / 2, 0], camera: [6, 5.8, 21] },
  { id: 'menswear', label: "Men's Clothing", detail: 'Tailoring · essentials', audience: 'Men', assetId: 'menswearGarment', position: [-9.15, 5.25, 8], rotation: [0, Math.PI / 2, 0], camera: [-5, 5.8, 22] },
  { id: 'jackets', label: 'Jackets & Blazers', detail: 'Layers · structure · craft', audience: 'Men', assetId: 'jacketGarment', position: [-9.15, 5.25, -3.5], rotation: [0, Math.PI / 2, 0], camera: [-4.2, 5.8, 9.5] },
  { id: 'accessories', label: 'Shoes & Accessories', detail: 'Shoes · bags · finishing touch', audience: 'All', assetId: 'handbagAccessory', assetIds: ['shoeAccessory', 'handbagAccessory', 'accessorySet'], position: [0, 2.75, 5.5], rotation: [0, 0, 0], camera: [0, 5.5, 19] },
]

export const wardrobeInspectionViews = ['front', 'side', 'back']

export const wardrobeZoneCameras = {
  overview: {
    position: [0, 5.4, 18.5],
    target: [0, 3.2, -2],
    label: 'Panoramic Overview',
  },
  indian: {
    position: [-4.2, 4.4, -4.5],
    target: [-8.8, 3.2, -4.5],
    label: 'Indian Ethnic Pavilion',
  },
  western: {
    position: [4.2, 4.4, -4.5],
    target: [8.8, 3.2, -4.5],
    label: 'Western Fashion Pavilion',
  },
  menswear: {
    position: [0, 4.4, -6.5],
    target: [0, 3.2, -14],
    label: "Men's Sartorial Atelier",
  },
  accessories: {
    position: [0, 3.8, 5.4],
    target: [0, 1.6, 1.2],
    label: 'Accessories & Island',
  },
  inspect: {
    position: [0, 2.6, 3.2],
    target: [0, 1.8, 0],
    label: '3D Garment Inspection',
  },
}

export const wardrobeCollections = [
  { id: 'all', label: 'All Collections' },
  { id: 'indian', label: 'Indian Ethnic' },
  { id: 'western', label: 'Western Ready-to-Wear' },
  { id: 'menswear', label: "Men's Sartorial" },
  { id: 'womens', label: "Women's Fashion" },
  { id: 'accessories', label: 'Shoes & Handbags' },
]

export const filterOptions = {
  categories: [
    'All Categories',
    'Lehengas',
    'Sarees',
    'Dresses',
    'Blazers & Jackets',
    'Sherwanis & Kurtas',
    'Suits & Tailoring',
    'Tops & Shirts',
    'Handbags & Accessories',
  ],
  occasions: [
    'All Occasions',
    'Wedding',
    'Diwali',
    'Gala',
    'Formal',
    'Festive',
    'Everyday',
  ],
  colors: [
    { id: 'all', label: 'All Colours', hex: null },
    { id: 'gold', label: 'Gold / Champagne', hex: '#d4af37' },
    { id: 'crimson', label: 'Crimson / Ruby', hex: '#8f1d2e' },
    { id: 'emerald', label: 'Emerald / Green', hex: '#1c4233' },
    { id: 'onyx', label: 'Onyx / Black', hex: '#1c1b18' },
    { id: 'ivory', label: 'Ivory / White', hex: '#faf7f2' },
    { id: 'navy', label: 'Navy / Blue', hex: '#16233b' },
    { id: 'rose', label: 'Rose / Blush', hex: '#d9b8b0' },
  ],
}
