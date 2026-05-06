/**
 * @fileoverview Catalogue des symboles du module Plan des Niveaux.
 */

export const NIVEAUX_ELEMENT_TYPES = {
    ZMS_ZONE: "zms_zone",   // contour polygonal ZMS
    FLECHE: "fleche",        // polyligne avec pointe de flèche
    PHOTO: "photo",          // photo autonome sur la planche
    TEXTE: "texte",          // annotation texte libre
};

export const NIVEAUX_SYMBOLS = [
    {
        key: "zms_zone",
        label: "Zone de mise en sûreté",
        category: "zms",
        type: NIVEAUX_ELEMENT_TYPES.ZMS_ZONE,
        color: "#43729D",
        fillColor: "#43729D",
        fillOpacity: 0.25,
        strokeStyle: "solid",
        strokeWidth: 3,
    },
    {
        key: "fleche_acces",
        label: "Flèche",
        category: "fleches",
        type: NIVEAUX_ELEMENT_TYPES.FLECHE,
        color: "#EA580C",
        strokeWidth: 3,
    },
    {
        key: "photo",
        label: "Photo",
        category: "photos",
        type: NIVEAUX_ELEMENT_TYPES.PHOTO,
        color: "#16A34A",
    },
    {
        key: "annotation",
        label: "Annotation",
        category: "annotations",
        type: NIVEAUX_ELEMENT_TYPES.TEXTE,
        color: "#FFFF00",
    },
];

export const NIVEAUX_CATEGORY_LABELS = {
    zms: "Zone de mise en sûreté",
    fleches: "Flèches",
    photos: "Photos",
    annotations: "Annotations",
};

export const NIVEAUX_SYMBOLS_BY_CATEGORY = {
    zms: NIVEAUX_SYMBOLS.filter((s) => s.category === "zms"),
    fleches: NIVEAUX_SYMBOLS.filter((s) => s.category === "fleches"),
    photos: NIVEAUX_SYMBOLS.filter((s) => s.category === "photos"),
    annotations: NIVEAUX_SYMBOLS.filter((s) => s.category === "annotations"),
};

export const getNiveauSymbolByKey = (key) =>
    NIVEAUX_SYMBOLS.find((s) => s.key === key);
