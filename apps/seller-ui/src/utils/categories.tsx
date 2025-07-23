export const shopCategories = [
  { value: "artwork", label: "Artwork" },
  { value: "paintings", label: "Paintings" },
  { value: "sculptures", label: "Sculptures" },
  { value: "wall-decor", label: "Wall Decor" },
  { value: "handmade-crafts", label: "Handmade Crafts" },
  { value: "ceramics", label: "Ceramics & Pottery" },
  { value: "woodwork", label: "Woodwork" },
  { value: "furniture", label: "Furniture" },
  { value: "lighting", label: "Lamps & Lighting" },
  { value: "textiles", label: "Textile & Fabric Art" },
  { value: "jewelry", label: "Artisan Jewelry" },
  { value: "home-decor", label: "Home Decor" },
  { value: "garden-decor", label: "Garden & Outdoor Decor" },
  { value: "stationery", label: "Art Stationery" },
  { value: "prints", label: "Art Prints" },
  { value: "custom-orders", label: "Custom Orders" },
  { value: "festive-items", label: "Festive & Seasonal Items" },
  { value: "eco-friendly", label: "Eco-Friendly Products" },
  { value: "spiritual", label: "Spiritual & Religious Art" }
];


type ShopCategory = {
  value: string;
  label: {
    en: string;
    hi?: string; 
  };
  subcategories?: {
    value: string;
    label: {
      en: string;
      hi?: string;
    };
  }[];
};


// export const shopCategories: ShopCategory[] = [
//   {
//     value: "artist",
//     label: { en: "Artist", hi: "कलाकार" },
//     subcategories: [
//       { value: "painter", label: { en: "Painter", hi: "चित्रकार" } },
//       { value: "illustrator", label: { en: "Illustrator", hi: "चित्रण कलाकार" } },
//       { value: "printmaker", label: { en: "Printmaker", hi: "मुद्रण कलाकार" } },
//     ],
//   },
//   {
//     value: "craftsman",
//     label: { en: "Craftsman", hi: "हस्तशिल्प कारीगर" },
//     subcategories: [
//       { value: "handmade-paper", label: { en: "Handmade Paper", hi: "हस्तनिर्मित कागज" } },
//       { value: "bamboo-art", label: { en: "Bamboo Art", hi: "बाँस कला" } },
//     ],
//   },
//   {
//     value: "furniture-maker",
//     label: { en: "Furniture Maker", hi: "फर्नीचर निर्माता" },
//     subcategories: [
//       { value: "wood-furniture", label: { en: "Wood Furniture", hi: "लकड़ी का फर्नीचर" } },
//       { value: "upcycled-furniture", label: { en: "Upcycled Furniture", hi: "पुनर्नवीनीकृत फर्नीचर" } },
//     ],
//   },
//   {
//     value: "ceramicist",
//     label: { en: "Ceramicist", hi: "सिरेमिक कलाकार" },
//     subcategories: [
//       { value: "pottery", label: { en: "Pottery", hi: "मिट्टी के बर्तन" } },
//       { value: "clay-models", label: { en: "Clay Models", hi: "मिट्टी की मूर्तियाँ" } },
//     ],
//   },
//   {
//     value: "jewelry-designer",
//     label: { en: "Jewelry Designer", hi: "आभूषण डिजाइनर" },
//     subcategories: [
//       { value: "metal-jewelry", label: { en: "Metal Jewelry", hi: "धातु आभूषण" } },
//       { value: "beaded-jewelry", label: { en: "Beaded Jewelry", hi: "मणियों का आभूषण" } },
//     ],
//   },
//   {
//     value: "textile-designer",
//     label: { en: "Textile Designer", hi: "वस्त्र डिज़ाइनर" },
//     subcategories: [
//       { value: "handloom", label: { en: "Handloom", hi: "हैंडलूम" } },
//       { value: "block-printing", label: { en: "Block Printing", hi: "ब्लॉक प्रिंटिंग" } },
//     ],
//   },
//   {
//     value: "lighting-designer",
//     label: { en: "Lighting Designer", hi: "लाइटिंग डिज़ाइनर" },
//     subcategories: [
//       { value: "lamp-maker", label: { en: "Lamp Maker", hi: "लैंप निर्माता" } },
//       { value: "decorative-lights", label: { en: "Decorative Lights", hi: "सजावटी लाइट्स" } },
//     ],
//   },
//   {
//     value: "eco-artist",
//     label: { en: "Eco-Friendly Creator", hi: "पर्यावरण अनुकूल निर्माता" },
//     subcategories: [
//       { value: "recycled-art", label: { en: "Recycled Art", hi: "पुनर्नवीनीकृत कला" } },
//       { value: "organic-materials", label: { en: "Organic Materials", hi: "जैविक सामग्री" } },
//     ],
//   },
//   {
//     value: "spiritual-designer",
//     label: { en: "Spiritual Art Seller", hi: "आध्यात्मिक कला विक्रेता" },
//     subcategories: [
//       { value: "mandala-art", label: { en: "Mandala Art", hi: "मंडला कला" } },
//       { value: "religious-sculptures", label: { en: "Religious Sculptures", hi: "धार्मिक मूर्तियाँ" } },
//     ],
//   }
// ];
