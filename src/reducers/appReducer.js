/**
 * @fileoverview Reducer principal — pattern useReducer
 * Toutes les transitions d'état passent ici pour garantir l'immuabilité
 */

/** @enum {string} Types d'actions dispatchables */
export const ACTION_TYPES = {
    // ── Navigation modules ───────────────────────────────────────────────────
    SET_MODULE: "SET_MODULE",
    // ── Projet ───────────────────────────────────────────────────────────────
    SET_PROJECT_INFO: "SET_PROJECT_INFO",
    LOAD_PROJECT: "LOAD_PROJECT",
    MARK_SAVED: "MARK_SAVED",
    RESET_PROJECT: "RESET_PROJECT",
    // ── Plan Général — Image ─────────────────────────────────────────────────
    LOAD_IMAGE: "LOAD_IMAGE",
    CLEAR_IMAGE: "CLEAR_IMAGE",
    // ── Plan Général — Légende ───────────────────────────────────────────────
    ADD_LEGEND_ITEM: "ADD_LEGEND_ITEM",
    UPDATE_LEGEND_ITEM: "UPDATE_LEGEND_ITEM",
    REMOVE_LEGEND_ITEM: "REMOVE_LEGEND_ITEM",
    DUPLICATE_LEGEND_ITEM: "DUPLICATE_LEGEND_ITEM",
    // ── Plan Général — Contours ──────────────────────────────────────────────
    ADD_CONTOUR_PATH: "ADD_CONTOUR_PATH",
    ADD_CONTOUR_POINT: "ADD_CONTOUR_POINT",
    UPDATE_CONTOUR_PATH: "UPDATE_CONTOUR_PATH",
    CLOSE_CONTOUR_PATH: "CLOSE_CONTOUR_PATH",
    REMOVE_CONTOUR_PATH: "REMOVE_CONTOUR_PATH",
    UPDATE_CONTOUR_POINT: "UPDATE_CONTOUR_POINT",
    // ── Plan des Niveaux — Niveaux ───────────────────────────────────────────
    PN_ADD_NIVEAU: "PN_ADD_NIVEAU",
    PN_REMOVE_NIVEAU: "PN_REMOVE_NIVEAU",
    PN_UPDATE_NIVEAU: "PN_UPDATE_NIVEAU",
    PN_SET_ACTIVE_NIVEAU: "PN_SET_ACTIVE_NIVEAU",
    PN_LOAD_IMAGE: "PN_LOAD_IMAGE",
    // ── Plan des Niveaux — Légende ───────────────────────────────────────────
    PN_ADD_LEGEND_ITEM: "PN_ADD_LEGEND_ITEM",
    PN_UPDATE_LEGEND_ITEM: "PN_UPDATE_LEGEND_ITEM",
    PN_REMOVE_LEGEND_ITEM: "PN_REMOVE_LEGEND_ITEM",
    PN_DUPLICATE_LEGEND_ITEM: "PN_DUPLICATE_LEGEND_ITEM",
    // ── Plan des Niveaux — Contours (ZMS) ───────────────────────────────────
    PN_ADD_CONTOUR_PATH: "PN_ADD_CONTOUR_PATH",
    PN_ADD_CONTOUR_POINT: "PN_ADD_CONTOUR_POINT",
    PN_UPDATE_CONTOUR_PATH: "PN_UPDATE_CONTOUR_PATH",
    PN_CLOSE_CONTOUR_PATH: "PN_CLOSE_CONTOUR_PATH",
    PN_REMOVE_CONTOUR_PATH: "PN_REMOVE_CONTOUR_PATH",
    PN_UPDATE_CONTOUR_POINT: "PN_UPDATE_CONTOUR_POINT",
    // ── Plan des Niveaux — Photos ────────────────────────────────────────────
    PN_ADD_PHOTO: "PN_ADD_PHOTO",
    PN_REMOVE_PHOTO: "PN_REMOVE_PHOTO",
    PN_SET_NIVEAU_ROTATION: "PN_SET_NIVEAU_ROTATION",
    // ── UI ───────────────────────────────────────────────────────────────────
    SET_SELECTED_TOOL: "SET_SELECTED_TOOL",
    SET_SELECTED_SYMBOL: "SET_SELECTED_SYMBOL",
    SET_SELECTED_ITEM: "SET_SELECTED_ITEM",
    SET_ZOOM: "SET_ZOOM",
    SET_PAN: "SET_PAN",
};

/**
 * @typedef {'planGeneral'|'planNiveaux'|'coupuresFluides'|null} ModuleActif
 *
 * @typedef {Object} Niveau
 * @property {string}   id
 * @property {string}   nom
 * @property {{ src:string|null, naturalWidth:number, naturalHeight:number, fileName:string }} image
 * @property {Array}    legendItems
 * @property {Array}    contourPaths
 * @property {Array}    photos        — { id, fileName, src }
 *
 * @typedef {Object} AppState
 * @property {{ id:string|null, name:string, schoolName:string, createdAt:string|null, updatedAt:string|null }} project
 * @property {{ image:{src,naturalWidth,naturalHeight,fileName}, legendItems:Array, contourPaths:Array }} planGeneral
 * @property {{ niveaux:Niveau[], activeNiveauId:string|null }} planNiveaux
 * @property {{ moduleActif:ModuleActif, selectedTool:string, selectedSymbolKey:string|null,
 *              selectedItemId:string|null, activeDrawingPathId:string|null,
 *              zoom:number, panOffset:{x:number,y:number}, isDirty:boolean }} ui
 */

const EMPTY_IMAGE = {
    src: null,
    naturalWidth: 0,
    naturalHeight: 0,
    fileName: "",
};

/** @type {AppState} */
export const initialState = {
    project: {
        id: null,
        name: "Nouveau PPMS",
        schoolName: "",
        createdAt: null,
        updatedAt: null,
    },
    planGeneral: {
        image: { ...EMPTY_IMAGE },
        legendItems: [],
        contourPaths: [],
    },
    planNiveaux: {
        niveaux: [],
        activeNiveauId: null,
    },
    ui: {
        moduleActif: null,
        selectedTool: "select",
        selectedSymbolKey: null,
        selectedItemId: null,
        activeDrawingPathId: null,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        isDirty: false,
    },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Nettoie un tracé actif non fermé :
 * ferme proprement s'il a ≥ 3 points, supprime sinon.
 */
function cleanActiveDrawing(contourPaths, activeDrawingPathId) {
    if (!activeDrawingPathId) return contourPaths;
    const activePath = contourPaths.find((p) => p.id === activeDrawingPathId);
    if (!activePath || activePath.closed) return contourPaths;
    if (activePath.points.length >= 3) {
        return contourPaths.map((p) =>
            p.id === activeDrawingPathId
                ? { ...p, closed: true, isDrawing: false }
                : p
        );
    }
    return contourPaths.filter((p) => p.id !== activeDrawingPathId);
}

/**
 * Applique une transformation au niveau actif de planNiveaux.
 * @param {AppState} state
 * @param {(Niveau) => Niveau} fn
 * @returns {AppState}
 */
function updateActiveNiveau(state, fn) {
    const id = state.planNiveaux.activeNiveauId;
    if (!id) return state;
    return {
        ...state,
        planNiveaux: {
            ...state.planNiveaux,
            niveaux: state.planNiveaux.niveaux.map((n) =>
                n.id === id ? fn(n) : n
            ),
        },
        ui: { ...state.ui, isDirty: true },
    };
}


/**
 * Reducer pur — aucun effet de bord
 * @param {AppState} state
 * @param {{ type: string, payload?: any }} action
 * @returns {AppState}
 */
export function appReducer(state, action) {
    const { type, payload } = action;

    switch (type) {
        // ── NAVIGATION ───────────────────────────────────────────────────────
        case ACTION_TYPES.SET_MODULE:
            return {
                ...state,
                ui: {
                    ...state.ui,
                    moduleActif: payload,
                    selectedTool: "select",
                    selectedSymbolKey: null,
                    selectedItemId: null,
                    activeDrawingPathId: null,
                    zoom: 1,
                    panOffset: { x: 0, y: 0 },
                },
            };

        // ── PROJET ───────────────────────────────────────────────────────────
        case ACTION_TYPES.SET_PROJECT_INFO:
            return {
                ...state,
                project: { ...state.project, ...payload },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.LOAD_PROJECT:
            return {
                ...payload,
                ui: { ...initialState.ui, moduleActif: state.ui.moduleActif },
            };

        case ACTION_TYPES.MARK_SAVED:
            return {
                ...state,
                project: {
                    ...state.project,
                    updatedAt: new Date().toISOString(),
                },
                ui: { ...state.ui, isDirty: false },
            };

        case ACTION_TYPES.RESET_PROJECT:
            return {
                ...initialState,
                ui: { ...initialState.ui, moduleActif: state.ui.moduleActif },
            };

        // ── PLAN GÉNÉRAL — IMAGE ─────────────────────────────────────────────
        case ACTION_TYPES.LOAD_IMAGE:
            return {
                ...state,
                planGeneral: { ...state.planGeneral, image: { ...payload } },
                project: {
                    ...state.project,
                    id: state.project.id ?? crypto.randomUUID(),
                    createdAt:
                        state.project.createdAt ?? new Date().toISOString(),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.CLEAR_IMAGE:
            return {
                ...state,
                planGeneral: { ...initialState.planGeneral },
                ui: { ...state.ui, isDirty: true },
            };

        // ── PLAN GÉNÉRAL — LÉGENDE ───────────────────────────────────────────
        case ACTION_TYPES.ADD_LEGEND_ITEM:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    legendItems: [
                        ...state.planGeneral.legendItems,
                        {
                            rotation: 0,
                            label: "",
                            labelVisible: true,
                            opacity: 1,
                            width: 48,
                            height: 48,
                            zIndex: state.planGeneral.legendItems.length + 1,
                            ...payload,
                            id: crypto.randomUUID(),
                        },
                    ],
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_LEGEND_ITEM:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    legendItems: state.planGeneral.legendItems.map((item) =>
                        item.id === payload.id ? { ...item, ...payload } : item
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.REMOVE_LEGEND_ITEM:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    legendItems: state.planGeneral.legendItems.filter(
                        (i) => i.id !== payload
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.DUPLICATE_LEGEND_ITEM: {
            const source = state.planGeneral.legendItems.find(
                (i) => i.id === payload
            );
            if (!source) return state;
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    legendItems: [
                        ...state.planGeneral.legendItems,
                        {
                            ...source,
                            id: crypto.randomUUID(),
                            x: source.x + 2,
                            y: source.y + 2,
                        },
                    ],
                },
                ui: { ...state.ui, isDirty: true },
            };
        }

        // ── PLAN GÉNÉRAL — CONTOURS ──────────────────────────────────────────
        case ACTION_TYPES.ADD_CONTOUR_PATH: {
            const newId = crypto.randomUUID();
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: [
                        ...state.planGeneral.contourPaths,
                        { ...payload, id: newId, points: [payload.firstPoint] },
                    ],
                },
                ui: {
                    ...state.ui,
                    activeDrawingPathId: newId,
                    isDirty: true,
                },
            };
        }

        case ACTION_TYPES.ADD_CONTOUR_POINT:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: state.planGeneral.contourPaths.map((p) =>
                        p.id === payload.id
                            ? { ...p, points: [...p.points, payload.point] }
                            : p
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.CLOSE_CONTOUR_PATH:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: state.planGeneral.contourPaths.map((p) =>
                        p.id === payload
                            ? { ...p, closed: true, isDrawing: false }
                            : p
                    ),
                },
                ui: { ...state.ui, activeDrawingPathId: null, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_CONTOUR_PATH:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: state.planGeneral.contourPaths.map((p) =>
                        p.id === payload.id ? { ...p, ...payload } : p
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.REMOVE_CONTOUR_PATH:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: state.planGeneral.contourPaths.filter(
                        (p) => p.id !== payload
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_CONTOUR_POINT:
            return {
                ...state,
                planGeneral: {
                    ...state.planGeneral,
                    contourPaths: state.planGeneral.contourPaths.map((p) =>
                        p.id === payload.id
                            ? {
                                  ...p,
                                  points: p.points.map((pt, i) =>
                                      i === payload.index ? payload.point : pt
                                  ),
                              }
                            : p
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        // ── PLAN DES NIVEAUX — NIVEAUX ───────────────────────────────────────
        case ACTION_TYPES.PN_ADD_NIVEAU: {
            const newNiveau = {
                id: crypto.randomUUID(),
                nom: payload.nom || "Nouveau niveau",
                rotation: 0,
                image: { ...EMPTY_IMAGE },
                legendItems: [],
                contourPaths: [],
                photos: [],
            };
            return {
                ...state,
                planNiveaux: {
                    niveaux: [...state.planNiveaux.niveaux, newNiveau],
                    activeNiveauId: newNiveau.id,
                },
                project: {
                    ...state.project,
                    id: state.project.id ?? crypto.randomUUID(),
                    createdAt:
                        state.project.createdAt ?? new Date().toISOString(),
                },
                ui: { ...state.ui, isDirty: true },
            };
        }

        case ACTION_TYPES.PN_REMOVE_NIVEAU: {
            const remaining = state.planNiveaux.niveaux.filter(
                (n) => n.id !== payload
            );
            const activeId =
                state.planNiveaux.activeNiveauId === payload
                    ? (remaining[0]?.id ?? null)
                    : state.planNiveaux.activeNiveauId;
            return {
                ...state,
                planNiveaux: { niveaux: remaining, activeNiveauId: activeId },
                ui: { ...state.ui, isDirty: true },
            };
        }

        case ACTION_TYPES.PN_UPDATE_NIVEAU:
            return {
                ...state,
                planNiveaux: {
                    ...state.planNiveaux,
                    niveaux: state.planNiveaux.niveaux.map((n) =>
                        n.id === payload.id ? { ...n, ...payload } : n
                    ),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.PN_SET_ACTIVE_NIVEAU:
            return {
                ...state,
                planNiveaux: {
                    ...state.planNiveaux,
                    activeNiveauId: payload,
                },
                ui: {
                    ...state.ui,
                    selectedTool: "select",
                    selectedSymbolKey: null,
                    selectedItemId: null,
                    activeDrawingPathId: null,
                    zoom: 1,
                    panOffset: { x: 0, y: 0 },
                },
            };

        case ACTION_TYPES.PN_LOAD_IMAGE:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                image: { ...payload },
            }));

        // ── PLAN DES NIVEAUX — LÉGENDE ───────────────────────────────────────
        case ACTION_TYPES.PN_ADD_LEGEND_ITEM:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                legendItems: [
                    ...n.legendItems,
                    {
                        rotation: 0,
                        opacity: 1,
                        zIndex: n.legendItems.length + 1,
                        ...payload,
                        id: crypto.randomUUID(),
                    },
                ],
            }));

        case ACTION_TYPES.PN_UPDATE_LEGEND_ITEM:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                legendItems: n.legendItems.map((item) =>
                    item.id === payload.id ? { ...item, ...payload } : item
                ),
            }));

        case ACTION_TYPES.PN_REMOVE_LEGEND_ITEM:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                legendItems: n.legendItems.filter((i) => i.id !== payload),
            }));

        case ACTION_TYPES.PN_DUPLICATE_LEGEND_ITEM: {
            const activeId = state.planNiveaux.activeNiveauId;
            if (!activeId) return state;
            const activeN = state.planNiveaux.niveaux.find(
                (n) => n.id === activeId
            );
            if (!activeN) return state;
            const src = activeN.legendItems.find((i) => i.id === payload);
            if (!src) return state;
            return updateActiveNiveau(state, (n) => ({
                ...n,
                legendItems: [
                    ...n.legendItems,
                    {
                        ...src,
                        id: crypto.randomUUID(),
                        x: src.x != null ? src.x + 2 : undefined,
                        y: src.y != null ? src.y + 2 : undefined,
                    },
                ],
            }));
        }

        // ── PLAN DES NIVEAUX — CONTOURS ──────────────────────────────────────
        case ACTION_TYPES.PN_ADD_CONTOUR_PATH: {
            const newId = crypto.randomUUID();
            const updated = updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: [
                    ...n.contourPaths,
                    { ...payload, id: newId, points: [payload.firstPoint] },
                ],
            }));
            return {
                ...updated,
                ui: {
                    ...updated.ui,
                    activeDrawingPathId: newId,
                },
            };
        }

        case ACTION_TYPES.PN_ADD_CONTOUR_POINT:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: n.contourPaths.map((p) =>
                    p.id === payload.id
                        ? { ...p, points: [...p.points, payload.point] }
                        : p
                ),
            }));

        case ACTION_TYPES.PN_CLOSE_CONTOUR_PATH: {
            const updated = updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: n.contourPaths.map((p) =>
                    p.id === payload
                        ? { ...p, closed: true, isDrawing: false }
                        : p
                ),
            }));
            return {
                ...updated,
                ui: { ...updated.ui, activeDrawingPathId: null },
            };
        }

        case ACTION_TYPES.PN_UPDATE_CONTOUR_PATH:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: n.contourPaths.map((p) =>
                    p.id === payload.id ? { ...p, ...payload } : p
                ),
            }));

        case ACTION_TYPES.PN_REMOVE_CONTOUR_PATH:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: n.contourPaths.filter((p) => p.id !== payload),
            }));

        case ACTION_TYPES.PN_UPDATE_CONTOUR_POINT:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                contourPaths: n.contourPaths.map((p) =>
                    p.id === payload.id
                        ? {
                              ...p,
                              points: p.points.map((pt, i) =>
                                  i === payload.index ? payload.point : pt
                              ),
                          }
                        : p
                ),
            }));

        // ── PLAN DES NIVEAUX — PHOTOS ────────────────────────────────────────
        case ACTION_TYPES.PN_ADD_PHOTO:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                photos: [
                    ...n.photos,
                    { id: crypto.randomUUID(), ...payload },
                ],
            }));

        case ACTION_TYPES.PN_REMOVE_PHOTO:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                photos: n.photos.filter((p) => p.id !== payload),
                legendItems: n.legendItems.map((item) =>
                    item.photoId === payload
                        ? { ...item, photoId: null }
                        : item
                ),
            }));

        case ACTION_TYPES.PN_SET_NIVEAU_ROTATION:
            return updateActiveNiveau(state, (n) => ({
                ...n,
                rotation: payload,
            }));

        // ── UI ───────────────────────────────────────────────────────────────
        case ACTION_TYPES.SET_SELECTED_TOOL: {
            const pg = state.planGeneral;
            const cleaned = cleanActiveDrawing(
                pg.contourPaths,
                state.ui.activeDrawingPathId
            );
            return {
                ...state,
                planGeneral: { ...pg, contourPaths: cleaned },
                ui: {
                    ...state.ui,
                    selectedTool: payload,
                    selectedItemId: null,
                    activeDrawingPathId: null,
                    selectedSymbolKey:
                        payload === "select"
                            ? null
                            : state.ui.selectedSymbolKey,
                },
            };
        }

        case ACTION_TYPES.SET_SELECTED_SYMBOL: {
            const pg = state.planGeneral;
            const cleaned = cleanActiveDrawing(
                pg.contourPaths,
                state.ui.activeDrawingPathId
            );
            return {
                ...state,
                planGeneral: { ...pg, contourPaths: cleaned },
                ui: {
                    ...state.ui,
                    selectedSymbolKey: payload,
                    selectedTool: "place",
                    activeDrawingPathId: null,
                    selectedItemId: null,
                },
            };
        }

        case ACTION_TYPES.SET_SELECTED_ITEM:
            return { ...state, ui: { ...state.ui, selectedItemId: payload } };

        case ACTION_TYPES.SET_ZOOM:
            return {
                ...state,
                ui: { ...state.ui, zoom: Math.max(0.25, Math.min(5, payload)) },
            };

        case ACTION_TYPES.SET_PAN:
            return { ...state, ui: { ...state.ui, panOffset: payload } };

        default:
            console.warn(`[appReducer] Action inconnue : ${type}`);
            return state;
    }
}
