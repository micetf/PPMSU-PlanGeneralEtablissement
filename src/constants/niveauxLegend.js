/**
 * @fileoverview Catalogue des symboles du module Plan des Niveaux.
 * Distinct de ppmsLegend.js qui couvre le Plan Général.
 */

/** @enum {string} Types d'éléments Plan des Niveaux */
export const NIVEAUX_ELEMENT_TYPES = {
    ZMS_ZONE: "zms_zone",           // contour polygonal ZMS
    FLECHE: "fleche",               // flèche 2 points numérotée
    MARQUEUR_PHOTO: "marqueur_photo", // cercle numéroté + photo associée
    TEXTE: "texte",                 // annotation texte libre
};

/**
 * @typedef {Object} NiveauSymbol
 * @property {string}  key
 * @property {string}  label
 * @property {string}  type           - valeur de NIVEAUX_ELEMENT_TYPES
 * @property {string}  color          - couleur principale (hex)
 * @property {string}  [fillColor]
 * @property {number}  [fillOpacity]
 * @property {string}  [strokeStyle]  - 'solid' | 'dashed'
 * @property {number}  [strokeWidth]
 * @property {string}  description
 */

/** @type {NiveauSymbol[]} */
export const NIVEAUX_SYMBOLS = [
    {
        key: "zms_zone",
        label: "Zone de mise en sûreté",
        type: NIVEAUX_ELEMENT_TYPES.ZMS_ZONE,
        color: "#43729D",
        fillColor: "#43729D",
        fillOpacity: 0.25,
        strokeStyle: "solid",
        strokeWidth: 3,
        description: "Délimite précisément une ZMS sur le plan d'intervention",
    },
    {
        key: "fleche_acces",
        label: "Accès",
        type: NIVEAUX_ELEMENT_TYPES.FLECHE,
        color: "#EA580C",
        strokeWidth: 3,
        description: "Flèche indiquant un accès (porte, entrée)",
    },
    {
        key: "fleche_escalier",
        label: "Escalier",
        type: NIVEAUX_ELEMENT_TYPES.FLECHE,
        color: "#9333EA",
        strokeWidth: 3,
        description: "Flèche indiquant un escalier",
    },
    {
        key: "marqueur_photo",
        label: "Photo",
        type: NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO,
        color: "#16A34A",
        description: "Marqueur numéroté renvoyant à une photo de terrain",
    },
    {
        key: "annotation",
        label: "Annotation",
        type: NIVEAUX_ELEMENT_TYPES.TEXTE,
        color: "#FFFF00",
        description: "Texte libre positionnable sur le plan",
    },
];

/** @type {Object.<string, string>} */
export const NIVEAUX_CATEGORY_LABELS = {
    zms: "Zone de mise en sûreté",
    fleches: "Flèches",
    marqueurs: "Marqueurs & Annotations",
};

/** Regroupement des symboles par catégorie pour l'interface */
export const NIVEAUX_SYMBOLS_BY_CATEGORY = {
    zms: NIVEAUX_SYMBOLS.filter((s) => s.type === NIVEAUX_ELEMENT_TYPES.ZMS_ZONE),
    fleches: NIVEAUX_SYMBOLS.filter((s) => s.type === NIVEAUX_ELEMENT_TYPES.FLECHE),
    marqueurs: NIVEAUX_SYMBOLS.filter(
        (s) =>
            s.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO ||
            s.type === NIVEAUX_ELEMENT_TYPES.TEXTE
    ),
};

/**
 * Retourne un symbole par sa clé unique
 * @param {string} key
 * @returns {NiveauSymbol | undefined}
 */
export const getNiveauSymbolByKey = (key) =>
    NIVEAUX_SYMBOLS.find((s) => s.key === key);
