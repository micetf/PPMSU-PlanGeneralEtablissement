/**
 * @fileoverview Fournisseur du contexte applicatif global
 */
import { useReducer, useCallback } from "react";
import { AppContext } from "./appContext";
import { appReducer, initialState, ACTION_TYPES } from "../reducers/appReducer";
import { getSymbolByKey } from "../constants/ppmsLegend";
import { storeImage, retrieveImage, removeImage } from "../utils/imageStore";

/**
 * Fournisseur du contexte applicatif
 * @param {{ children: React.ReactNode }} props
 */
export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // ── IMAGE ──────────────────────────────────────────────────────────────────

    /** @param {File} file */
    const loadImage = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () =>
                dispatch({
                    type: ACTION_TYPES.LOAD_IMAGE,
                    payload: {
                        src: e.target.result,
                        naturalWidth: img.naturalWidth,
                        naturalHeight: img.naturalHeight,
                        fileName: file.name,
                    },
                });
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }, []);

    // ── LÉGENDE ────────────────────────────────────────────────────────────────

    /**
     * @param {string} symbolKey
     * @param {number} x - % largeur image
     * @param {number} y - % hauteur image
     */
    const addLegendItem = useCallback((symbolKey, x, y) => {
        const symbol = getSymbolByKey(symbolKey);
        if (!symbol) return;
        dispatch({
            type: ACTION_TYPES.ADD_LEGEND_ITEM,
            payload: {
                symbolKey,
                x,
                y,
                type: symbol.type,
                label: symbol.label,
            },
        });
    }, []);

    /** @param {string} id @param {object} changes */
    const updateLegendItem = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_LEGEND_ITEM,
            payload: { id, ...changes },
        });
    }, []);

    /** @param {string} id */
    const removeLegendItem = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.REMOVE_LEGEND_ITEM, payload: id }),
        []
    );

    /** @param {string} id */
    const duplicateLegendItem = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.DUPLICATE_LEGEND_ITEM, payload: id }),
        []
    );

    // ── CONTOURS ───────────────────────────────────────────────────────────────

    /** @param {string} symbolKey */
    const startContourPath = useCallback((symbolKey, firstPoint) => {
        const symbol = getSymbolByKey(symbolKey);
        if (!symbol) return;
        dispatch({
            type: ACTION_TYPES.ADD_CONTOUR_PATH,
            payload: {
                symbolKey,
                firstPoint,
                color: symbol.color,
                strokeWidth: symbol.strokeWidth ?? 2,
                strokeStyle: symbol.strokeStyle ?? "solid",
                fillColor: symbol.fillColor ?? "transparent",
                fillOpacity: symbol.fillOpacity ?? 0,
            },
        });
    }, []);

    /** @param {string} pathId @param {{x:number, y:number}} point */
    const addContourPoint = useCallback((pathId, point) => {
        dispatch({
            type: ACTION_TYPES.ADD_CONTOUR_POINT,
            payload: { id: pathId, point },
        });
    }, []);

    /** @param {string} pathId */
    const closeContourPath = useCallback(
        (pathId) =>
            dispatch({
                type: ACTION_TYPES.CLOSE_CONTOUR_PATH,
                payload: pathId,
            }),
        []
    );

    /** @param {string} id @param {object} changes */
    const updateContourPath = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_CONTOUR_PATH,
            payload: { id, ...changes },
        });
    }, []);

    /** @param {string} id */
    const removeContourPath = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.REMOVE_CONTOUR_PATH, payload: id }),
        []
    );

    /** @param {string} pathId @param {number} index @param {{x:number,y:number}} point */
    const updateContourPoint = useCallback((pathId, index, point) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_CONTOUR_POINT,
            payload: { pathId, index, point },
        });
    }, []);

    // ── UI ─────────────────────────────────────────────────────────────────────

    /** @param {'select'|'place'|'draw'|'text'} tool */
    const setTool = useCallback(
        (tool) =>
            dispatch({ type: ACTION_TYPES.SET_SELECTED_TOOL, payload: tool }),
        []
    );

    /** @param {string} symbolKey */
    const selectSymbol = useCallback(
        (symbolKey) =>
            dispatch({
                type: ACTION_TYPES.SET_SELECTED_SYMBOL,
                payload: symbolKey,
            }),
        []
    );

    /** @param {string|null} id */
    const selectItem = useCallback(
        (id) => dispatch({ type: ACTION_TYPES.SET_SELECTED_ITEM, payload: id }),
        []
    );

    /** @param {number} zoom */
    const setZoom = useCallback(
        (zoom) => dispatch({ type: ACTION_TYPES.SET_ZOOM, payload: zoom }),
        []
    );

    /** @param {{ x: number, y: number }} offset */
    const setPan = useCallback(
        (offset) => dispatch({ type: ACTION_TYPES.SET_PAN, payload: offset }),
        []
    );

    // ── PERSISTANCE ────────────────────────────────────────────────────────────

    /**
     * Sauvegarde le projet : état en localStorage, image en IndexedDB
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const saveProject = useCallback(async () => {
        try {
            // Sépare l'image du reste — IndexedDB n'a pas de limite de quota
            const { image, ...stateWithoutImage } = state;
            const snapshot = {
                ...stateWithoutImage,
                version: "1.0",
                savedAt: new Date().toISOString(),
            };

            // Métadonnées en localStorage (légères)
            localStorage.setItem(
                `ppms_project_${state.project.id}`,
                JSON.stringify(snapshot)
            );

            // Image en IndexedDB (peut dépasser 5 Mo)
            await storeImage(state.project.id, image);

            // Mise à jour de l'index
            const index = JSON.parse(
                localStorage.getItem("ppms_projects") ?? "[]"
            );
            const updated = index.filter((p) => p.id !== state.project.id);
            updated.unshift({
                id: state.project.id,
                name: state.project.name,
                schoolName: state.project.schoolName,
                savedAt: snapshot.savedAt,
                fileName: state.image.fileName,
            });
            localStorage.setItem("ppms_projects", JSON.stringify(updated));
            dispatch({ type: ACTION_TYPES.MARK_SAVED });
            return { success: true };
        } catch (err) {
            console.error("[AppProvider] Erreur de sauvegarde :", err);
            return { success: false, error: err.message };
        }
    }, [state]);

    /**
     * Charge un projet depuis localStorage + IndexedDB
     * @param {string} projectId
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const loadProject = useCallback(async (projectId) => {
        try {
            const raw = localStorage.getItem(`ppms_project_${projectId}`);
            if (!raw)
                return {
                    success: false,
                    error: "Projet introuvable en mémoire locale",
                };

            const snapshot = JSON.parse(raw);

            // Récupère l'image depuis IndexedDB (nouveau format)
            let image = await retrieveImage(projectId);

            // Rétrocompatibilité : image dans le snapshot (ancien format localStorage)
            if (!image && snapshot.image?.src) image = snapshot.image;

            if (!image) {
                return {
                    success: false,
                    error: "Image du projet introuvable — veuillez recharger le plan manuellement.",
                };
            }

            // Reconstruit l'état complet sans les champs techniques de snapshot
            const projectState = { ...snapshot };
            delete projectState.version;
            delete projectState.savedAt;
            delete projectState.image;

            dispatch({
                type: ACTION_TYPES.LOAD_PROJECT,
                payload: { ...projectState, image },
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    /**
     * Supprime un projet de localStorage et son image d'IndexedDB
     * @param {string} projectId
     * @returns {Promise<void>}
     */
    const deleteProject = useCallback(async (projectId) => {
        localStorage.removeItem(`ppms_project_${projectId}`);
        const index = JSON.parse(localStorage.getItem("ppms_projects") ?? "[]");
        localStorage.setItem(
            "ppms_projects",
            JSON.stringify(index.filter((p) => p.id !== projectId))
        );
        await removeImage(projectId);
    }, []);

    /** @returns {Array} */
    const listProjects = useCallback(
        () => JSON.parse(localStorage.getItem("ppms_projects") ?? "[]"),
        []
    );

    const resetProject = useCallback(
        () => dispatch({ type: ACTION_TYPES.RESET_PROJECT }),
        []
    );

    /** @param {{ name?:string, schoolName?:string }} info */
    const setProjectInfo = useCallback((info) => {
        dispatch({ type: ACTION_TYPES.SET_PROJECT_INFO, payload: info });
    }, []);

    const actions = {
        loadImage,
        addLegendItem,
        updateLegendItem,
        removeLegendItem,
        duplicateLegendItem,
        startContourPath,
        addContourPoint,
        closeContourPath,
        updateContourPath,
        removeContourPath,
        setTool,
        selectSymbol,
        selectItem,
        setZoom,
        setPan,
        saveProject,
        loadProject,
        listProjects,
        deleteProject,
        resetProject,
        setProjectInfo,
        updateContourPoint,
    };

    return (
        <AppContext.Provider value={{ state, actions }}>
            {children}
        </AppContext.Provider>
    );
}
