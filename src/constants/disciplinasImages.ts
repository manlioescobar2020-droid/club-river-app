const DISCIPLINAS_IMAGES: Record<string, string> = {
  futbol:    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80',
  natacion:  'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80',
  basquet:   'https://images.unsplash.com/photo-1546519638405-a9d1b14af44b?w=400&q=80',
  basketball:'https://images.unsplash.com/photo-1546519638405-a9d1b14af44b?w=400&q=80',
  voley:     'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
  volleyball:'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&q=80',
  tenis:     'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=400&q=80',
  handball:  'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=400&q=80',
  gimnasia:  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80',
  atletismo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
  default:   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
};

export function getDisciplinaImage(nombre: string): string {
  const key = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  return DISCIPLINAS_IMAGES[key] ?? DISCIPLINAS_IMAGES.default;
}
