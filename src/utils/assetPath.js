/**
 * @fileoverview Résolution des chemins d'assets statiques
 * Utilise import.meta.env.BASE_URL pour être compatible avec
 * tout chemin de déploiement (racine ou sous-répertoire).
 *
 * En dev  : BASE_URL = '/'
 * En prod : BASE_URL = '/PPMSU-PlanGeneralEcole/'
 */

/**
 * Retourne l'URL absolue d'un pictogramme PPMS
 * @param {string} fileName - nom du fichier (ex: 'sortie_secours.png')
 * @returns {string}
 */
export function symbolUrl(fileName) {
    return `${import.meta.env.BASE_URL}symbols/${fileName}`;
}
