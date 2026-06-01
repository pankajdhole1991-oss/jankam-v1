// ============================================
// JANKAM — WORKER IMAGE LIBRARY
// 30+ curated images: Indian factories, women workers,
// office environments, safety, union meetings, Maharashtra
// ============================================

export interface WorkerImage {
  id: string;
  url: string;
  alt: string;
  category: 'hero' | 'factory' | 'women' | 'office' | 'safety' | 'union' | 'legal' | 'district' | 'testimonial' | 'banner';
}

export const images: WorkerImage[] = [
  // HERO
  {
    id: 'hero-1',
    url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=85&fit=crop',
    alt: 'Indian factory workers on production floor',
    category: 'hero',
  },

  // FACTORY WORKERS
  {
    id: 'factory-1',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop',
    alt: 'Worker operating industrial machinery',
    category: 'factory',
  },
  {
    id: 'factory-2',
    url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=800&q=80&fit=crop',
    alt: 'Workers in manufacturing facility',
    category: 'factory',
  },
  {
    id: 'factory-3',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop',
    alt: 'Industrial plant workers at work',
    category: 'factory',
  },
  {
    id: 'factory-4',
    url: 'https://images.unsplash.com/photo-1609252928379-5b5c5c64c548?w=800&q=80&fit=crop',
    alt: 'Workers assembling products',
    category: 'factory',
  },

  // WOMEN WORKERS
  {
    id: 'women-1',
    url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80&fit=crop',
    alt: 'Woman worker in professional setting',
    category: 'women',
  },
  {
    id: 'women-2',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&fit=crop',
    alt: 'Female worker empowerment',
    category: 'women',
  },
  {
    id: 'women-3',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80&fit=crop',
    alt: 'Women at workplace meeting',
    category: 'women',
  },
  {
    id: 'women-4',
    url: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=800&q=80&fit=crop',
    alt: 'Female supervisor at industrial site',
    category: 'women',
  },

  // OFFICE WORKERS
  {
    id: 'office-1',
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80&fit=crop',
    alt: 'Office workers in team meeting',
    category: 'office',
  },
  {
    id: 'office-2',
    url: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80&fit=crop',
    alt: 'Diverse team at work',
    category: 'office',
  },
  {
    id: 'office-3',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop',
    alt: 'Modern office work environment',
    category: 'office',
  },

  // SAFETY & INDUSTRIAL
  {
    id: 'safety-1',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop',
    alt: 'Workers with safety helmets on construction site',
    category: 'safety',
  },
  {
    id: 'safety-2',
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&fit=crop',
    alt: 'Industrial safety inspection',
    category: 'safety',
  },
  {
    id: 'safety-3',
    url: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80&fit=crop',
    alt: 'Factory safety officer',
    category: 'safety',
  },

  // UNION / COMMUNITY
  {
    id: 'union-1',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80&fit=crop',
    alt: 'Workers in community gathering',
    category: 'union',
  },
  {
    id: 'union-2',
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80&fit=crop',
    alt: 'Labour rights meeting',
    category: 'union',
  },
  {
    id: 'union-3',
    url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&q=80&fit=crop',
    alt: 'People united for workers rights',
    category: 'union',
  },

  // LEGAL / SUPPORT
  {
    id: 'legal-1',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80&fit=crop',
    alt: 'Legal consultation for workers',
    category: 'legal',
  },
  {
    id: 'legal-2',
    url: 'https://images.unsplash.com/photo-1521791055366-0d553872952f?w=800&q=80&fit=crop',
    alt: 'Worker receiving support and guidance',
    category: 'legal',
  },
  {
    id: 'legal-3',
    url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80&fit=crop',
    alt: 'Document review and complaint assistance',
    category: 'legal',
  },

  // DISTRICTS / MAHARASHTRA
  {
    id: 'district-mumbai',
    url: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&q=80&fit=crop',
    alt: 'Mumbai city workers',
    category: 'district',
  },
  {
    id: 'district-pune',
    url: 'https://images.unsplash.com/photo-1598020882550-8e0e4da77f0f?w=800&q=80&fit=crop',
    alt: 'Pune manufacturing hub',
    category: 'district',
  },
  {
    id: 'district-nashik',
    url: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80&fit=crop',
    alt: 'Nashik industrial zone',
    category: 'district',
  },

  // TESTIMONIALS
  {
    id: 'testimonial-1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop&crop=face',
    alt: 'Factory worker testimonial portrait',
    category: 'testimonial',
  },
  {
    id: 'testimonial-2',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80&fit=crop&crop=face',
    alt: 'Female worker success story',
    category: 'testimonial',
  },
  {
    id: 'testimonial-3',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&fit=crop&crop=face',
    alt: 'Office worker testimonial',
    category: 'testimonial',
  },
  {
    id: 'testimonial-4',
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80&fit=crop&crop=face',
    alt: 'Construction worker success story',
    category: 'testimonial',
  },

  // WOMEN SAFETY SECTION
  {
    id: 'women-safety-1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&q=80&fit=crop',
    alt: 'Women safety and empowerment at workplace',
    category: 'women',
  },
  {
    id: 'women-safety-2',
    url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=900&q=80&fit=crop',
    alt: 'Women workers support network',
    category: 'women',
  },

  // FOOTER BANNER
  {
    id: 'banner-1',
    url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&q=80&fit=crop',
    alt: 'JanKam movement — workers united',
    category: 'banner',
  },
];

export const getImageByCategory = (category: WorkerImage['category']): WorkerImage[] =>
  images.filter((img) => img.category === category);

export const getImageById = (id: string): WorkerImage | undefined =>
  images.find((img) => img.id === id);
