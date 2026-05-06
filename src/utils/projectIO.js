/**
 * @fileoverview Import/export de projets au format .ppmsu
 *
 * Format .ppmsu : JSON auto-contenu incluant l'image en base64.
 * Permet le partage entre postes sans dépendance serveur.
 *
 * @typedef {Object} PpmsuFile
 * @property {'ppmsu'}  format
 * @property {string}   version
 * @property {string}   exportedAt  - ISO 8601
 * @property {object}   project
 * @property {object}   image       - src en base64 inclus
 * @property {object[]} legendItems
 * @property {object[]} contourPaths
 */

const FORMAT_ID = "ppmsu";
const FORMAT_VERSION = "1.0";

// ── EXPORT ─────────────────────────────────────────────────────────────────

/**
 * Sérialise l'état applicatif en fichier .ppmsu et déclenche le téléchargement
 * @param {import('../reducers/appReducer').AppState} state
 * @returns {void}
 */
export function exportProject(state) {
    /** @type {PpmsuFile} */
    const payload = {
        format: FORMAT_ID,
        version: FORMAT_VERSION,
        exportedAt: new Date().toISOString(),
        project: state.project,
        planGeneral: state.planGeneral,
        planNiveaux: state.planNiveaux,
        // Champs legacy v1 pour rétrocompatibilité lecture
        image: state.planGeneral.image,
        legendItems: state.planGeneral.legendItems,
        contourPaths: state.planGeneral.contourPaths,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });

    const fileName = _buildFileName(state);
    _triggerDownload(blob, fileName);
}

/**
 * Construit le nom de fichier à partir du projet
 * @param {import('../reducers/appReducer').AppState} state
 * @returns {string}
 */
function _buildFileName(state) {
    const slug = [state.project.schoolName, state.project.name]
        .filter(Boolean)
        .join("-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 60);
    return `${slug || "projet"}.ppmsu`;
}

/**
 * Déclenche le téléchargement d'un Blob
 * @param {Blob} blob
 * @param {string} fileName
 */
function _triggerDownload(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

// ── IMPORT ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ImportResult
 * @property {boolean}    success
 * @property {PpmsuFile}  [data]    - données parsées si succès
 * @property {string}     [error]   - message d'erreur si échec
 */

/**
 * Lit et valide un fichier .ppmsu sélectionné par l'utilisateur
 * @param {File} file
 * @returns {Promise<ImportResult>}
 */
export async function importProject(file) {
    // Vérification du nom de fichier
    if (!file.name.endsWith(".ppmsu")) {
        return {
            success: false,
            error: "Format invalide — le fichier doit avoir l'extension .ppmsu",
        };
    }

    let raw;
    try {
        raw = await file.text();
    } catch {
        return { success: false, error: "Impossible de lire le fichier" };
    }

    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        return {
            success: false,
            error: "Fichier .ppmsu corrompu (JSON invalide)",
        };
    }

    const validationError = _validate(data);
    if (validationError) {
        return { success: false, error: validationError };
    }

    return { success: true, data };
}

/**
 * Valide la structure d'un fichier .ppmsu parsé
 * @param {any} data
 * @returns {string|null} message d'erreur ou null si valide
 */
function _validate(data) {
    if (data?.format !== FORMAT_ID) {
        return "Ce fichier n'est pas un projet PPMS Unifié (.ppmsu)";
    }
    if (!data.version) {
        return "Version manquante dans le fichier .ppmsu";
    }
    if (!data.image?.src) {
        return "Image manquante dans le fichier .ppmsu";
    }
    if (!Array.isArray(data.legendItems)) {
        return "Données de légende corrompues";
    }
    if (!Array.isArray(data.contourPaths)) {
        return "Données de contour corrompues";
    }
    return null;
}
