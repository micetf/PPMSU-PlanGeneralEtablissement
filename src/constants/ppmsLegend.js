/**
 * @fileoverview Catalogue officiel des symboles PPMS Unifié — Fascicule 2 (Eduscol)
 * ✅ Validé contre le document legendes.docx fourni par l'autorité pédagogique.
 *
 * Les images référencées (imageFile) doivent être placées dans public/symbols/
 */

/** @enum {string} Catégories fonctionnelles PPMS — libellés officiels du fascicule */
export const PPMS_CATEGORIES = {
    ACCES_SITE: "acces_site",
    ACCES_BATIMENT_PIETON: "acces_batiment_pieton",
    ACCES_BATIMENT_VEHICULE: "acces_batiment_vehicule",
    SORTIES_SECOURS: "sorties_secours",
    MISE_EN_SURETE: "mise_en_surete",
    RASSEMBLEMENT: "rassemblement",
    ANNOTATION: "annotation",
    DELIMITATION: "delimitation",
    ORIENTATION: "orientation",
};

/** @enum {string} Types de rendu d'un élément sur le canvas */
export const ELEMENT_TYPES = {
    SYMBOL: "symbol",
    CONTOUR: "contour",
    ZONE: "zone",
    TEXTE: "texte",
    COMPOSE: "compose",
};

/**
 * @typedef {Object} PPMSSymbol
 * @property {string}  key           - Identifiant unique (snake_case)
 * @property {string}  category      - Clé de PPMS_CATEGORIES
 * @property {string}  label         - Libellé officiel du fascicule
 * @property {string}  type          - Valeur de ELEMENT_TYPES
 * @property {string}  [imageFile]   - Nom du fichier dans public/symbols/
 * @property {string}  [color]       - Couleur principale (hex)
 * @property {string}  [fillColor]   - Couleur de fond (hex)
 * @property {number}  [fillOpacity] - Opacité du fond (0–1)
 * @property {string}  [strokeStyle] - 'solid' | 'dashed'
 * @property {number}  [strokeWidth] - Épaisseur de trait (px)
 * @property {string}  [shape]       - Forme prédéfinie : 'pentagon' | 'north_arrow'
 * @property {string}  description   - Description pédagogique
 */

/** @type {PPMSSymbol[]} */
export const PPMS_SYMBOLS = [
    // ── ACCÈS AU SITE ──────────────────────────────────────────────────────────
    {
        key: "acces_principal_vehicule_site",
        category: PPMS_CATEGORIES.ACCES_SITE,
        label: "Accès principal véhicule",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_principal_vehicule_site.png",
        description:
            "Accès principal des véhicules sur le site de l'établissement",
    },
    {
        key: "acces_secondaire_vehicule_site",
        category: PPMS_CATEGORIES.ACCES_SITE,
        label: "Accès secondaire véhicule",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_secondaire_vehicule_site.png",
        description:
            "Accès secondaire des véhicules sur le site de l'établissement",
    },
    {
        key: "acces_principal_pieton_site",
        category: PPMS_CATEGORIES.ACCES_SITE,
        label: "Accès principal piéton",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_principal_pieton_site.png",
        description:
            "Accès principal des piétons sur le site de l'établissement",
    },
    {
        key: "acces_secondaire_pieton_site",
        category: PPMS_CATEGORIES.ACCES_SITE,
        label: "Accès secondaire piéton",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_secondaire_pieton_site.png",
        description:
            "Accès secondaire des piétons sur le site de l'établissement",
    },

    // ── ACCÈS PIÉTONS AU BÂTIMENT ──────────────────────────────────────────────
    {
        key: "acces_principal_pieton_batiment",
        category: PPMS_CATEGORIES.ACCES_BATIMENT_PIETON,
        label: "Accès principal",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_principal_pieton_batiment.png",
        description:
            "Accès principal des piétons à un bâtiment de l'établissement",
    },
    {
        key: "acces_secondaire_pieton_batiment",
        category: PPMS_CATEGORIES.ACCES_BATIMENT_PIETON,
        label: "Accès secondaire",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_secondaire_pieton_batiment.png",
        description:
            "Accès secondaire des piétons à un bâtiment de l'établissement",
    },

    // ── ACCÈS VÉHICULE AU BÂTIMENT ─────────────────────────────────────────────
    {
        key: "acces_principal_vehicule_batiment",
        category: PPMS_CATEGORIES.ACCES_BATIMENT_VEHICULE,
        label: "Accès principal",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_principal_vehicule_batiment.png",
        description:
            "Accès principal des véhicules à un bâtiment de l'établissement",
    },
    {
        key: "acces_secondaire_vehicule_batiment",
        category: PPMS_CATEGORIES.ACCES_BATIMENT_VEHICULE,
        label: "Accès secondaire",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "acces_secondaire_vehicule_batiment.png",
        description:
            "Accès secondaire des véhicules à un bâtiment de l'établissement",
    },

    // ── SORTIES DE SECOURS ─────────────────────────────────────────────────────
    {
        key: "sortie_secours",
        category: PPMS_CATEGORIES.SORTIES_SECOURS,
        label: "Sortie de secours",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "sortie_secours.png",
        description: "Sortie de secours d'un bâtiment de l'établissement",
    },

    // ── ZONES DE MISE EN SÛRETÉ ────────────────────────────────────────────────
    {
        key: "zone_mise_en_surete",
        category: PPMS_CATEGORIES.MISE_EN_SURETE,
        label: "Zone de mise en sûreté",
        type: ELEMENT_TYPES.SYMBOL, // ← était ELEMENT_TYPES.ZONE
        shape: "pentagon",
        color: "#43729D",
        strokeWidth: 2,
        strokeStyle: "solid",
        fillColor: "#43729D",
        fillOpacity: 0.25,
        description:
            "Zone de mise en sûreté des élèves (forme pentagone officielle)",
    },

    // ── POINT DE RASSEMBLEMENT EXTÉRIEUR ───────────────────────────────────────
    {
        key: "point_rassemblement_exterieur",
        category: PPMS_CATEGORIES.RASSEMBLEMENT,
        label: "Point de rassemblement extérieur",
        type: ELEMENT_TYPES.SYMBOL,
        imageFile: "point_rassemblement_exterieur.png",
        description:
            "Point de rassemblement hors de l'enceinte de l'établissement",
    },

    // ── ANNOTATIONS ────────────────────────────────────────────────────────────
    {
        key: "annotation",
        category: PPMS_CATEGORIES.ANNOTATION,
        label: "Annotation",
        type: ELEMENT_TYPES.TEXTE,
        color: "#FFFF00",
        description: "Étiquette de texte libre (texte jaune, ombre noire)",
    },

    // ── DÉLIMITATION DU SITE ───────────────────────────────────────────────────
    {
        key: "delimitation_site",
        category: PPMS_CATEGORIES.DELIMITATION,
        label: "Délimitation du site",
        type: ELEMENT_TYPES.CONTOUR,
        color: "#FF0000",
        strokeStyle: "dashed",
        strokeWidth: 2,
        description:
            "Contour délimitant l'emprise du site scolaire (tirets rouges)",
    },

    // ── ORIENTATION DU PLAN ────────────────────────────────────────────────────
    {
        key: "orientation_plan",
        category: PPMS_CATEGORIES.ORIENTATION,
        label: "Orientation du plan",
        type: ELEMENT_TYPES.COMPOSE,
        shape: "north_arrow",
        description:
            "Rose des vents indiquant le Nord (cercle gris + flèche rouge)",
    },
];

/**
 * Retourne les symboles regroupés par catégorie
 * @returns {Object.<string, PPMSSymbol[]>}
 */
export const getSymbolsByCategory = () =>
    PPMS_SYMBOLS.reduce((acc, symbol) => {
        if (!acc[symbol.category]) acc[symbol.category] = [];
        acc[symbol.category].push(symbol);
        return acc;
    }, {});

/**
 * Retourne un symbole par sa clé unique
 * @param {string} key
 * @returns {PPMSSymbol | undefined}
 */
export const getSymbolByKey = (key) => PPMS_SYMBOLS.find((s) => s.key === key);

/**
 * Libellés français officiels des catégories (issus du fascicule 2)
 * @type {Object.<string, string>}
 */
export const CATEGORY_LABELS = {
    [PPMS_CATEGORIES.ACCES_SITE]: "Accès au site",
    [PPMS_CATEGORIES.ACCES_BATIMENT_PIETON]: "Accès piétons au bâtiment",
    [PPMS_CATEGORIES.ACCES_BATIMENT_VEHICULE]: "Accès véhicule au bâtiment",
    [PPMS_CATEGORIES.SORTIES_SECOURS]: "Sorties de secours du bâtiment",
    [PPMS_CATEGORIES.MISE_EN_SURETE]: "Zones de mise en sûreté",
    [PPMS_CATEGORIES.RASSEMBLEMENT]: "Point de rassemblement extérieur",
    [PPMS_CATEGORIES.ANNOTATION]: "Annotations",
    [PPMS_CATEGORIES.DELIMITATION]: "Délimitation du site",
    [PPMS_CATEGORIES.ORIENTATION]: "Orientation du plan",
};

/**
 * Résolution native des images officielles (px)
 * Utilisé par WorkspaceCanvas pour afficher sans distorsion
 * @type {Object.<string, {w: number, h: number}>}
 */
export const IMAGE_NATIVE_SIZES = {
    acces_principal_vehicule_site: { w: 45, h: 32 },
    acces_secondaire_vehicule_site: { w: 29, h: 34 },
    acces_principal_pieton_site: { w: 45, h: 32 },
    acces_secondaire_pieton_site: { w: 29, h: 34 },
    acces_principal_pieton_batiment: { w: 45, h: 32 },
    acces_secondaire_pieton_batiment: { w: 29, h: 33 },
    acces_principal_vehicule_batiment: { w: 45, h: 32 },
    acces_secondaire_vehicule_batiment: { w: 29, h: 34 },
    sortie_secours: { w: 29, h: 34 },
    point_rassemblement_exterieur: { w: 119, h: 119 },
};
