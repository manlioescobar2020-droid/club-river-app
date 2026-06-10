import { ImageSourcePropType } from 'react-native';

const DISCIPLINAS_IMAGES: Record<string, ImageSourcePropType> = {
  futbol:     { uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&q=80' },
  natacion:   { uri: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&q=80' },
  basquet:    require('../../assets/images/basquet.png'),
  basketball: require('../../assets/images/basquet.png'),
  voley:      require('../../assets/images/voley.png'),
  volleyball: require('../../assets/images/voley.png'),
  voleibol:   require('../../assets/images/voley.png'),
  tenis:      { uri: 'https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=400&q=80' },
  handball:   { uri: 'https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=400&q=80' },
  gimnasia:   { uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },
  atletismo:  { uri: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80' },
  newcom:     require('../../assets/images/newcon.png'),
  zumba:      require('../../assets/images/zumba.png'),
  default:    { uri: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=400&q=80' },
};

export function getDisciplinaImage(nombre: string): ImageSourcePropType {
  const key = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
  return DISCIPLINAS_IMAGES[key] ?? DISCIPLINAS_IMAGES.default;
}
