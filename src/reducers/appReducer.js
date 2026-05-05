/**
 * @fileoverview Reducer principal — pattern useReducer
 * Toutes les transitions d'état passent ici pour garantir l'immuabilité
 */

/** @enum {string} Types d'actions dispatchables */
export const ACTION_TYPES = {
    LOAD_IMAGE: "LOAD_IMAGE",
    CLEAR_IMAGE: "CLEAR_IMAGE",
    SET_PROJECT_INFO: "SET_PROJECT_INFO",
    LOAD_PROJECT: "LOAD_PROJECT",
    MARK_SAVED: "MARK_SAVED",
    RESET_PROJECT: "RESET_PROJECT",
    ADD_LEGEND_ITEM: "ADD_LEGEND_ITEM",
    UPDATE_LEGEND_ITEM: "UPDATE_LEGEND_ITEM",
    REMOVE_LEGEND_ITEM: "REMOVE_LEGEND_ITEM",
    DUPLICATE_LEGEND_ITEM: "DUPLICATE_LEGEND_ITEM",
    ADD_CONTOUR_PATH: "ADD_CONTOUR_PATH",
    ADD_CONTOUR_POINT: "ADD_CONTOUR_POINT",
    UPDATE_CONTOUR_PATH: "UPDATE_CONTOUR_PATH",
    CLOSE_CONTOUR_PATH: "CLOSE_CONTOUR_PATH",
    REMOVE_CONTOUR_PATH: "REMOVE_CONTOUR_PATH",
    UPDATE_CONTOUR_POINT: "UPDATE_CONTOUR_POINT",
    SET_SELECTED_TOOL: "SET_SELECTED_TOOL",
    SET_SELECTED_SYMBOL: "SET_SELECTED_SYMBOL",
    SET_SELECTED_ITEM: "SET_SELECTED_ITEM",
    SET_ZOOM: "SET_ZOOM",
    SET_PAN: "SET_PAN",
};

/**
 * @typedef {Object} AppState
 * @property {{id:string|null, name:string, schoolName:string, createdAt:string|null, updatedAt:string|null}} project
 * @property {{src:string|null, naturalWidth:number, naturalHeight:number, fileName:string}} image
 * @property {Array}  legendItems
 * @property {Array}  contourPaths
 * @property {{selectedTool:string, selectedSymbolKey:string|null, selectedItemId:string|null, activeDrawingPathId:string|null, zoom:number, panOffset:{x:number,y:number}, isDirty:boolean}} ui
 */

/** @type {AppState} */
export const initialState = {
    project: {
        id: null,
        name: "Nouveau PPMS",
        schoolName: "",
        createdAt: null,
        updatedAt: null,
    },
    image: {
        src: null,
        naturalWidth: 0,
        naturalHeight: 0,
        fileName: "",
    },
    legendItems: [],
    contourPaths: [],
    ui: {
        selectedTool: "select",
        selectedSymbolKey: null,
        selectedItemId: null,
        activeDrawingPathId: null,
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        isDirty: false,
    },
};

/**
 * Nettoie un tracé actif non fermé :
 * ferme proprement s'il a ≥ 3 points, supprime sinon.
 * @param {Array} contourPaths
 * @param {string|null} activeDrawingPathId
 * @returns {Array}
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
 * Reducer pur — aucun effet de bord
 * @param {AppState} state
 * @param {{type: string, payload?: any}} action
 * @returns {AppState}
 */
export function appReducer(state, action) {
    const { type, payload } = action;

    switch (type) {
        // ── IMAGE ────────────────────────────────────────────────────────────────
        case ACTION_TYPES.LOAD_IMAGE:
            return {
                ...state,
                image: { ...payload },
                project: {
                    ...state.project,
                    id: state.project.id ?? crypto.randomUUID(),
                    createdAt:
                        state.project.createdAt ?? new Date().toISOString(),
                },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.CLEAR_IMAGE:
            return { ...initialState };

        // ── PROJET ───────────────────────────────────────────────────────────────
        case ACTION_TYPES.SET_PROJECT_INFO:
            return {
                ...state,
                project: { ...state.project, ...payload },
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.LOAD_PROJECT:
            return { ...payload, ui: { ...initialState.ui } };

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
            return { ...initialState };

        // ── LÉGENDE ITEMS ────────────────────────────────────────────────────────
        case ACTION_TYPES.ADD_LEGEND_ITEM:
            return {
                ...state,
                legendItems: [
                    ...state.legendItems,
                    {
                        rotation: 0,
                        label: "",
                        labelVisible: true,
                        opacity: 1,
                        width: 48,
                        height: 48,
                        zIndex: state.legendItems.length + 1,
                        ...payload,
                        id: crypto.randomUUID(),
                    },
                ],
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_LEGEND_ITEM:
            return {
                ...state,
                legendItems: state.legendItems.map((item) =>
                    item.id === payload.id ? { ...item, ...payload } : item
                ),
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.REMOVE_LEGEND_ITEM:
            return {
                ...state,
                legendItems: state.legendItems.filter(
                    (item) => item.id !== payload
                ),
                ui: {
                    ...state.ui,
                    selectedItemId:
                        state.ui.selectedItemId === payload
                            ? null
                            : state.ui.selectedItemId,
                    isDirty: true,
                },
            };

        case ACTION_TYPES.DUPLICATE_LEGEND_ITEM: {
            const src = state.legendItems.find((i) => i.id === payload);
            if (!src) return state;
            const copy = {
                ...src,
                id: crypto.randomUUID(),
                x: src.x + 2,
                y: src.y + 2,
                zIndex: state.legendItems.length + 1,
            };
            return {
                ...state,
                legendItems: [...state.legendItems, copy],
                ui: { ...state.ui, selectedItemId: copy.id, isDirty: true },
            };
        }

        // ── CONTOURS ─────────────────────────────────────────────────────────────
        case ACTION_TYPES.ADD_CONTOUR_PATH: {
            const { firstPoint, ...rest } = payload;
            const newPath = {
                ...rest,
                id: crypto.randomUUID(),
                points: firstPoint ? [firstPoint] : [],
                closed: false,
                isDrawing: true,
            };
            return {
                ...state,
                contourPaths: [...state.contourPaths, newPath],
                ui: {
                    ...state.ui,
                    activeDrawingPathId: newPath.id,
                    isDirty: true,
                },
            };
        }

        case ACTION_TYPES.ADD_CONTOUR_POINT:
            return {
                ...state,
                contourPaths: state.contourPaths.map((p) =>
                    p.id === payload.id
                        ? { ...p, points: [...p.points, payload.point] }
                        : p
                ),
            };

        case ACTION_TYPES.CLOSE_CONTOUR_PATH:
            return {
                ...state,
                contourPaths: state.contourPaths.map((p) =>
                    p.id === payload
                        ? { ...p, closed: true, isDrawing: false }
                        : p
                ),
                ui: { ...state.ui, activeDrawingPathId: null, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_CONTOUR_PATH:
            return {
                ...state,
                contourPaths: state.contourPaths.map((p) =>
                    p.id === payload.id ? { ...p, ...payload } : p
                ),
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.REMOVE_CONTOUR_PATH:
            return {
                ...state,
                contourPaths: state.contourPaths.filter(
                    (p) => p.id !== payload
                ),
                ui: { ...state.ui, isDirty: true },
            };

        case ACTION_TYPES.UPDATE_CONTOUR_POINT:
            return {
                ...state,
                contourPaths: state.contourPaths.map((p) =>
                    p.id === payload.pathId
                        ? {
                              ...p,
                              points: p.points.map((pt, i) =>
                                  i === payload.index ? payload.point : pt
                              ),
                          }
                        : p
                ),
                ui: { ...state.ui, isDirty: true },
            };

        // ── UI ───────────────────────────────────────────────────────────────────
        case ACTION_TYPES.SET_SELECTED_TOOL: {
            const cleaned = cleanActiveDrawing(
                state.contourPaths,
                state.ui.activeDrawingPathId
            );
            return {
                ...state,
                contourPaths: cleaned,
                ui: {
                    ...state.ui,
                    selectedTool: payload,
                    selectedItemId: null,
                    activeDrawingPathId: null,
                    // Réinitialise la sélection de symbole quand on revient à select
                    selectedSymbolKey:
                        payload === "select"
                            ? null
                            : state.ui.selectedSymbolKey,
                },
            };
        }

        case ACTION_TYPES.SET_SELECTED_SYMBOL: {
            const cleaned = cleanActiveDrawing(
                state.contourPaths,
                state.ui.activeDrawingPathId
            );
            return {
                ...state,
                contourPaths: cleaned,
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
            return {
                ...state,
                ui: { ...state.ui, selectedItemId: payload },
            };

        case ACTION_TYPES.SET_ZOOM:
            return {
                ...state,
                ui: { ...state.ui, zoom: Math.max(0.25, Math.min(5, payload)) },
            };

        case ACTION_TYPES.SET_PAN:
            return {
                ...state,
                ui: { ...state.ui, panOffset: payload },
            };

        default:
            console.warn(`[appReducer] Action inconnue : ${type}`);
            return state;
    }
}
