/**
 * Local IntentParser based on keywords + pattern scoring.
 * - Normalizes text (remove accents, lowercase)
 * - Scores intents based on keyword matches with weights
 * - Extracts simple entities (e.g., product for price queries)
 */

export type IntentResult = {
  intent: string;
  score: number; // 0..1
  entities?: Record<string, string>;
};

type IntentSpec = {
  name: string;
  keywords: string[];
  weight?: number; // relative importance
};

const DEFAULT_INTENTS: IntentSpec[] = [
  { name: 'menu', keywords: ['menu', 'menú', 'qué venden', 'qué hay', 'catalogo', 'platos', 'comidas', 'bebidas'], weight: 1 },
  { name: 'horario', keywords: ['hora', 'horario', 'abren', 'cierre', 'atienden'], weight: 1 },
  { name: 'ubicacion', keywords: ['dónde', 'ubicación', 'direccion', 'llegar', 'donde', 'ubicada'], weight: 1 },
  { name: 'reservar', keywords: ['reservar', 'reserva', 'reservación', 'mesa', 'agendar'], weight: 1 },
  { name: 'carrito', keywords: ['carrito', 'carro', 'agregar', 'añadir', 'add', 'ver carrito', 'mostrar carrito', 'mi carrito'], weight: 1 },
  { name: 'confirmar', keywords: ['confirmar', 'confirmar pedido', 'confirmar reserv', 'confirmar reserva', 'confirmarpedido', 'confirmarreserva'], weight: 1 },
  { name: 'precio', keywords: ['cuánto', 'cuesta', 'precio', 'vale', 'costo'], weight: 1 },
  { name: 'saludo', keywords: ['hola', 'buenos', 'buenas', 'qué tal', 'buen día', 'buenas noches'], weight: 0.2 },
];

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9:\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class IntentParser {
  private intents: IntentSpec[];

  constructor(intents: IntentSpec[] = DEFAULT_INTENTS) {
    this.intents = intents;
  }

  parse(text: string): IntentResult {
    const clean = normalize(text);

    // Quick rule: explicit price format "precio:pollo" or "precio: pollo"
    const priceInline = clean.match(/precio:\s*([a-z0-9\s]+)/i);
    if (priceInline) {
      const product = priceInline[1].trim();
      return { intent: 'precio', score: 1, entities: { product } };
    }

    // detect product after keywords like "precio de pollo" or "cuánto cuesta el pollo"
    const priceMatch = clean.match(/(?:precio|cuanto cuesta|cuanto|costa|cuesta)\s+(?:el|la|los|las|de)?\s*([a-z0-9\s]+)/i);
    if (priceMatch) {
      const product = priceMatch[1].trim();
      return { intent: 'precio', score: 0.95, entities: { product } };
    }

    // Score each intent by counting keyword matches
    const tokens = clean.split(' ').filter(Boolean);
    let best: IntentResult = { intent: 'ninguno', score: 0 };

    for (const intent of this.intents) {
      let matches = 0;
      for (const kw of intent.keywords) {
        // normalize keyword
        const nkw = normalize(kw);
        if (clean.includes(nkw)) matches += 1;
      }

      if (matches > 0) {
        // simple scoring: matches / token count * weight (bounded)
        const raw = (matches / Math.max(tokens.length, 1)) * (intent.weight ?? 1);
        const score = Math.min(1, raw);
        if (score > best.score) best = { intent: intent.name, score };
      }
    }

    // handle greeting-only messages
    if (best.score === 0) {
      // if the message is short and contains a greeting, return 'ninguno' with low confidence
      if (tokens.length <= 3 && /^(hola|buenos|buenas|hey|buen)$/.test(tokens[0] || '')) {
        return { intent: 'ninguno', score: 0.4 };
      }
      return { intent: 'ninguno', score: 0 };
    }

    return best;
  }

  // Small helper to add new intents at runtime
  addIntent(spec: IntentSpec) {
    this.intents.push(spec);
  }
}

export default IntentParser;
