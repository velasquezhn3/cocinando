export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

export const MENU: Product[] = [
  { id: 'choripan', name: 'Choripán de Res Asado', price: 380, category: 'Entradas', image: 'menu1' },
  { id: 'sampler', name: 'Sampler de Chorizo', price: 390, category: 'Entradas', image: 'menu1' },
  { id: 'carpaccio', name: 'Carpaccio de Res', price: 370, category: 'Entradas' },
  { id: 'provoleta', name: 'Provoleta Asada', price: 315, category: 'Entradas' },
  { id: 'furti', name: 'Furtición de Frijoles', price: 265, category: 'Entradas' },

  { id: 'entraña', name: 'Entraña', price: 1095, category: 'Cortes' },
  { id: 'puyazo', name: 'Puyazo', price: 890, category: 'Cortes' },
  { id: 'newyork', name: 'New York', price: 995, category: 'Cortes' },
  { id: 'ribeye', name: 'Rib eye', price: 1130, category: 'Cortes' },
  { id: 'cowboy', name: 'Cowboy Steak', price: 2200, category: 'Cortes' },
  { id: 'asadotira', name: 'Asado de tira', price: 815, category: 'Cortes' },

  { id: 'pollo_naranja', name: 'Pollo Asado con Salsa de Naranja', price: 490, category: 'Pollo' },
  { id: 'pollo_provenzal', name: 'Pollo Asado Provenzal', price: 475, category: 'Pollo' },

  { id: 'costilla_cerdo', name: 'Costilla de Cerdo Ahumada', price: 695, category: 'Cerdo' },

  { id: 'papas', name: 'Papas Fritas', price: 75, category: 'Complementos' },
  { id: 'elote', name: 'Elote Asado', price: 75, category: 'Complementos' },

  { id: 'parrillada4', name: 'Parrillada para 4', price: 2500, category: 'Parrilladas' },
  { id: 'parrilladap4', name: 'Parrillada para 4 Premium', price: 3400, category: 'Parrilladas' },
  { id: 'parrillada6', name: 'Parrillada para 6', price: 3950, category: 'Parrilladas' },
  { id: 'parrilladap6', name: 'Parrillada para 6 Premium', price: 5100, category: 'Parrilladas' },

  { id: 'piña', name: 'Piña Caramelizada con Ron y Canela', price: 220, category: 'Postres' },
];

export function findProduct(term: string): Product | undefined {
  const t = term.toLowerCase().trim();
  return MENU.find(p => p.id.toLowerCase() === t || p.name.toLowerCase().includes(t));
}

export default MENU;
