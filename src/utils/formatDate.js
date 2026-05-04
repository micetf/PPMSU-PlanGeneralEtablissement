/**
 * @fileoverview Utilitaire de formatage de dates
 */

/**
 * Formate une date ISO en affichage lisible (fr-FR)
 * @param {string} iso
 * @returns {string}
 */
export function formatDate(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}
