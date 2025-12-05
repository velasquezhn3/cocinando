// formatDate.ts
// Utilidad para formatear fechas en distintos estilos

/**
 * Formatea una fecha a string legible.
 * @param date Fecha a formatear
 * @param locale Idioma (por defecto 'es-ES')
 * @returns Fecha formateada
 */
export function formatDate(date: Date, locale: string = 'es-ES'): string {
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}
