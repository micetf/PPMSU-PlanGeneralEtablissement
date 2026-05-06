/**
 * @fileoverview Fournisseur du contexte applicatif global
 */
import { useReducer, useCallback } from "react";
import { AppContext } from "./appContext";
import { appReducer, initialState, ACTION_TYPES } from "../reducers/appReducer";
import { getSymbolByKey, ELEMENT_TYPES } from "../constants/ppmsLegend";
import { getNiveauSymbolByKey } from "../constants/niveauxLegend";
import { storeImage, retrieveImage, removeImage } from "../utils/imageStore";
import { importProject as parseImportFile } from "../utils/projectIO";

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // ── NAVIGATION ─────────────────────────────────────────────────────────────

    const setModule = useCallback((module) => {
        dispatch({ type: ACTION_TYPES.SET_MODULE, payload: module });
    }, []);

    // ── PLAN GÉNÉRAL — IMAGE ───────────────────────────────────────────────────

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

    // ── PLAN GÉNÉRAL — LÉGENDE ─────────────────────────────────────────────────

    const addLegendItem = useCallback((symbolKey, x, y) => {
        const symbol = getSymbolByKey(symbolKey);
        if (!symbol) return;
        const defaultSize =
            symbol.shape === "pentagon"
                ? 80
                : symbol.type === ELEMENT_TYPES.TEXTE
                  ? 14
                  : 48;
        dispatch({
            type: ACTION_TYPES.ADD_LEGEND_ITEM,
            payload: {
                symbolKey,
                x,
                y,
                type: symbol.type,
                label: symbol.label,
                width: defaultSize,
                height: defaultSize,
            },
        });
    }, []);

    const updateLegendItem = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_LEGEND_ITEM,
            payload: { id, ...changes },
        });
    }, []);

    const removeLegendItem = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.REMOVE_LEGEND_ITEM, payload: id }),
        []
    );

    const duplicateLegendItem = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.DUPLICATE_LEGEND_ITEM, payload: id }),
        []
    );

    // ── PLAN GÉNÉRAL — CONTOURS ────────────────────────────────────────────────

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

    const addContourPoint = useCallback((id, point) => {
        dispatch({
            type: ACTION_TYPES.ADD_CONTOUR_POINT,
            payload: { id, point },
        });
    }, []);

    const closeContourPath = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.CLOSE_CONTOUR_PATH, payload: id }),
        []
    );

    const updateContourPath = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_CONTOUR_PATH,
            payload: { id, ...changes },
        });
    }, []);

    const removeContourPath = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.REMOVE_CONTOUR_PATH, payload: id }),
        []
    );

    const updateContourPoint = useCallback((id, index, point) => {
        dispatch({
            type: ACTION_TYPES.UPDATE_CONTOUR_POINT,
            payload: { id, index, point },
        });
    }, []);

    // ── PLAN DES NIVEAUX — NIVEAUX ─────────────────────────────────────────────

    const addNiveau = useCallback((nom) => {
        dispatch({ type: ACTION_TYPES.PN_ADD_NIVEAU, payload: { nom } });
    }, []);

    const removeNiveau = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.PN_REMOVE_NIVEAU, payload: id }),
        []
    );

    const updateNiveau = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.PN_UPDATE_NIVEAU,
            payload: { id, ...changes },
        });
    }, []);

    const setActiveNiveau = useCallback((id) => {
        dispatch({ type: ACTION_TYPES.PN_SET_ACTIVE_NIVEAU, payload: id });
    }, []);

    const loadNiveauImage = useCallback((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () =>
                dispatch({
                    type: ACTION_TYPES.PN_LOAD_IMAGE,
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

    // ── PLAN DES NIVEAUX — LÉGENDE ─────────────────────────────────────────────

    const addNiveauLegendItem = useCallback((symbolKey, coords) => {
        const symbol = getNiveauSymbolByKey(symbolKey);
        if (!symbol) return;
        dispatch({
            type: ACTION_TYPES.PN_ADD_LEGEND_ITEM,
            payload: { symbolKey, type: symbol.type, ...coords },
        });
    }, []);

    const updateNiveauLegendItem = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.PN_UPDATE_LEGEND_ITEM,
            payload: { id, ...changes },
        });
    }, []);

    const removeNiveauLegendItem = useCallback(
        (id) =>
            dispatch({
                type: ACTION_TYPES.PN_REMOVE_LEGEND_ITEM,
                payload: id,
            }),
        []
    );

    const duplicateNiveauLegendItem = useCallback(
        (id) =>
            dispatch({
                type: ACTION_TYPES.PN_DUPLICATE_LEGEND_ITEM,
                payload: id,
            }),
        []
    );

    // ── PLAN DES NIVEAUX — CONTOURS ────────────────────────────────────────────

    const startNiveauContourPath = useCallback((symbolKey, firstPoint) => {
        const symbol = getNiveauSymbolByKey(symbolKey);
        if (!symbol) return;
        dispatch({
            type: ACTION_TYPES.PN_ADD_CONTOUR_PATH,
            payload: {
                symbolKey,
                firstPoint,
                nom: symbol.label ?? "Zone de mise en sûreté",
                color: symbol.color,
                strokeWidth: symbol.strokeWidth ?? 3,
                strokeStyle: symbol.strokeStyle ?? "solid",
                fillColor: symbol.fillColor ?? "transparent",
                fillOpacity: symbol.fillOpacity ?? 0,
            },
        });
    }, []);

    const addNiveauContourPoint = useCallback((id, point) => {
        dispatch({
            type: ACTION_TYPES.PN_ADD_CONTOUR_POINT,
            payload: { id, point },
        });
    }, []);

    const closeNiveauContourPath = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.PN_CLOSE_CONTOUR_PATH, payload: id }),
        []
    );

    const updateNiveauContourPath = useCallback((id, changes) => {
        dispatch({
            type: ACTION_TYPES.PN_UPDATE_CONTOUR_PATH,
            payload: { id, ...changes },
        });
    }, []);

    const removeNiveauContourPath = useCallback(
        (id) =>
            dispatch({
                type: ACTION_TYPES.PN_REMOVE_CONTOUR_PATH,
                payload: id,
            }),
        []
    );

    const updateNiveauContourPoint = useCallback((id, index, point) => {
        dispatch({
            type: ACTION_TYPES.PN_UPDATE_CONTOUR_POINT,
            payload: { id, index, point },
        });
    }, []);

    // ── PLAN DES NIVEAUX — PHOTOS ──────────────────────────────────────────────

    /**
     * @param {File} file
     * @returns {Promise<string>} id de la photo créée
     */
    const addNiveauPhoto = useCallback((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const id = crypto.randomUUID();
                dispatch({
                    type: ACTION_TYPES.PN_ADD_PHOTO,
                    payload: { id, fileName: file.name, src: e.target.result },
                });
                resolve(id);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const removeNiveauPhoto = useCallback(
        (id) =>
            dispatch({ type: ACTION_TYPES.PN_REMOVE_PHOTO, payload: id }),
        []
    );

    const setNiveauRotation = useCallback(
        (rotation) =>
            dispatch({
                type: ACTION_TYPES.PN_SET_NIVEAU_ROTATION,
                payload: ((rotation % 360) + 360) % 360,
            }),
        []
    );

    // ── UI ─────────────────────────────────────────────────────────────────────

    const setTool = useCallback(
        (tool) =>
            dispatch({ type: ACTION_TYPES.SET_SELECTED_TOOL, payload: tool }),
        []
    );

    const selectSymbol = useCallback(
        (key) =>
            dispatch({ type: ACTION_TYPES.SET_SELECTED_SYMBOL, payload: key }),
        []
    );

    const selectItem = useCallback(
        (id) => dispatch({ type: ACTION_TYPES.SET_SELECTED_ITEM, payload: id }),
        []
    );

    const setZoom = useCallback(
        (zoom) => dispatch({ type: ACTION_TYPES.SET_ZOOM, payload: zoom }),
        []
    );

    const setPan = useCallback(
        (offset) => dispatch({ type: ACTION_TYPES.SET_PAN, payload: offset }),
        []
    );

    // ── PERSISTANCE ────────────────────────────────────────────────────────────

    const saveProject = useCallback(async () => {
        try {
            const projectId = state.project.id;

            // Sérialise l'état sans les src images (stockées séparément en IndexedDB)
            const planGeneralWithoutSrc = {
                ...state.planGeneral,
                image: { ...state.planGeneral.image, src: null },
            };
            const planNiveauxWithoutSrc = {
                ...state.planNiveaux,
                niveaux: state.planNiveaux.niveaux.map((n) => ({
                    ...n,
                    image: { ...n.image, src: null },
                    photos: n.photos.map((p) => ({ ...p, src: null })),
                })),
            };

            const snapshot = {
                version: "2.0",
                savedAt: new Date().toISOString(),
                project: state.project,
                planGeneral: planGeneralWithoutSrc,
                planNiveaux: planNiveauxWithoutSrc,
            };

            localStorage.setItem(
                `ppms_project_${projectId}`,
                JSON.stringify(snapshot)
            );

            // Sauvegarde image Plan Général
            if (state.planGeneral.image.src) {
                await storeImage(projectId, state.planGeneral.image);
            }

            // Sauvegarde images des niveaux
            for (const niveau of state.planNiveaux.niveaux) {
                if (niveau.image.src) {
                    await storeImage(`${projectId}_nv_${niveau.id}`, niveau.image);
                }
                for (const photo of niveau.photos) {
                    if (photo.src) {
                        await storeImage(
                            `${projectId}_photo_${photo.id}`,
                            { src: photo.src, fileName: photo.fileName }
                        );
                    }
                }
            }

            // Index projets
            const index = JSON.parse(
                localStorage.getItem("ppms_projects") ?? "[]"
            );
            const updated = index.filter((p) => p.id !== projectId);
            updated.unshift({
                id: projectId,
                name: state.project.name,
                schoolName: state.project.schoolName,
                savedAt: snapshot.savedAt,
                fileName: state.planGeneral.image.fileName,
            });
            localStorage.setItem("ppms_projects", JSON.stringify(updated));

            dispatch({ type: ACTION_TYPES.MARK_SAVED });
            return { success: true };
        } catch (err) {
            console.error("[AppProvider] Erreur de sauvegarde :", err);
            return { success: false, error: err.message };
        }
    }, [state]);

    const loadProject = useCallback(async (projectId) => {
        try {
            const raw = localStorage.getItem(`ppms_project_${projectId}`);
            if (!raw)
                return {
                    success: false,
                    error: "Projet introuvable en mémoire locale",
                };

            const snapshot = JSON.parse(raw);

            // Support ancien format v1
            if (snapshot.version === "1.0" || !snapshot.version) {
                return _loadLegacyProject(snapshot, projectId, dispatch);
            }

            // Format v2 — restore images from IndexedDB
            const pgImage =
                (await retrieveImage(projectId)) ??
                (snapshot.planGeneral?.image?.src
                    ? snapshot.planGeneral.image
                    : null);

            if (!pgImage?.src && snapshot.planGeneral?.image?.fileName) {
                // Plan Général sans image : OK si on est en planNiveaux
            }

            const niveaux = await Promise.all(
                (snapshot.planNiveaux?.niveaux ?? []).map(async (n) => {
                    const img = await retrieveImage(`${projectId}_nv_${n.id}`);
                    const photos = await Promise.all(
                        (n.photos ?? []).map(async (p) => {
                            const stored = await retrieveImage(
                                `${projectId}_photo_${p.id}`
                            );
                            return { ...p, src: stored?.src ?? null };
                        })
                    );
                    return { ...n, image: img ?? n.image, photos };
                })
            );

            const projectState = {
                project: snapshot.project,
                planGeneral: {
                    ...snapshot.planGeneral,
                    image: pgImage ?? snapshot.planGeneral?.image ?? { src: null, naturalWidth: 0, naturalHeight: 0, fileName: "" },
                },
                planNiveaux: { ...snapshot.planNiveaux, niveaux },
            };

            dispatch({
                type: ACTION_TYPES.LOAD_PROJECT,
                payload: projectState,
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }, []);

    const importProject = useCallback(async (file) => {
        const result = await parseImportFile(file);
        if (!result.success) return result;

        const { data } = result;
        const newId = crypto.randomUUID();

        // Support format legacy v1
        if (!data.planGeneral) {
            const projectState = {
                project: { ...data.project, id: newId },
                planGeneral: {
                    image: data.image,
                    legendItems: data.legendItems ?? [],
                    contourPaths: data.contourPaths ?? [],
                },
                planNiveaux: { niveaux: [], activeNiveauId: null },
            };
            try {
                await storeImage(newId, data.image);
            } catch {
                // image conservée en mémoire
            }
            dispatch({
                type: ACTION_TYPES.LOAD_PROJECT,
                payload: projectState,
            });
            return { success: true };
        }

        // Format v2
        const projectState = {
            project: { ...data.project, id: newId },
            planGeneral: data.planGeneral,
            planNiveaux: data.planNiveaux ?? { niveaux: [], activeNiveauId: null },
        };
        try {
            if (data.planGeneral?.image?.src) {
                await storeImage(newId, data.planGeneral.image);
            }
        } catch {
            // image conservée en mémoire
        }
        dispatch({ type: ACTION_TYPES.LOAD_PROJECT, payload: projectState });
        return { success: true };
    }, []);

    const deleteProject = useCallback(async (projectId) => {
        localStorage.removeItem(`ppms_project_${projectId}`);
        const index = JSON.parse(localStorage.getItem("ppms_projects") ?? "[]");
        localStorage.setItem(
            "ppms_projects",
            JSON.stringify(index.filter((p) => p.id !== projectId))
        );
        await removeImage(projectId);
        // Nettoyage images niveaux : on ne connaît pas les IDs ici,
        // mais les orphelins en IndexedDB ne posent pas de problème fonctionnel.
    }, []);

    const listProjects = useCallback(
        () => JSON.parse(localStorage.getItem("ppms_projects") ?? "[]"),
        []
    );

    const resetProject = useCallback(
        () => dispatch({ type: ACTION_TYPES.RESET_PROJECT }),
        []
    );

    const setProjectInfo = useCallback((info) => {
        dispatch({ type: ACTION_TYPES.SET_PROJECT_INFO, payload: info });
    }, []);

    // ── Exposition ─────────────────────────────────────────────────────────────

    const actions = {
        // Navigation
        setModule,
        // Plan Général
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
        updateContourPoint,
        // Plan des Niveaux
        addNiveau,
        removeNiveau,
        updateNiveau,
        setActiveNiveau,
        loadNiveauImage,
        addNiveauLegendItem,
        updateNiveauLegendItem,
        removeNiveauLegendItem,
        duplicateNiveauLegendItem,
        startNiveauContourPath,
        addNiveauContourPoint,
        closeNiveauContourPath,
        updateNiveauContourPath,
        removeNiveauContourPath,
        updateNiveauContourPoint,
        addNiveauPhoto,
        removeNiveauPhoto,
        setNiveauRotation,
        // UI
        setTool,
        selectSymbol,
        selectItem,
        setZoom,
        setPan,
        // Persistance
        saveProject,
        loadProject,
        listProjects,
        deleteProject,
        resetProject,
        setProjectInfo,
        importProject,
    };

    return (
        <AppContext.Provider value={{ state, actions }}>
            {children}
        </AppContext.Provider>
    );
}

/**
 * Charge un projet au format legacy v1 (avant refactorisation multi-module).
 */
async function _loadLegacyProject(snapshot, projectId, dispatch) {
    try {
        let image = await retrieveImage(projectId);
        if (!image && snapshot.image?.src) image = snapshot.image;
        if (!image) {
            return {
                success: false,
                error: "Image du projet introuvable — veuillez recharger le plan manuellement.",
            };
        }
        const projectState = {
            project: snapshot.project ?? {},
            planGeneral: {
                image,
                legendItems: snapshot.legendItems ?? [],
                contourPaths: snapshot.contourPaths ?? [],
            },
            planNiveaux: { niveaux: [], activeNiveauId: null },
        };
        dispatch({ type: ACTION_TYPES.LOAD_PROJECT, payload: projectState });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}
