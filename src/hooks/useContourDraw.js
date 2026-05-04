/**
 * @fileoverview Hook de gestion du tracé de contours polygonaux
 * Clic = ajouter un point, double-clic = fermer le polygone
 */
import { useCallback, useState } from "react";
import { useApp } from "./useApp";
import { getSymbolByKey, ELEMENT_TYPES } from "../constants/ppmsLegend";

export function useContourDraw() {
    const { state, actions } = useApp();
    const [cursorPoint, setCursorPoint] = useState(null);

    /** Convertit un événement souris en coordonnées % image */
    const toImagePct = useCallback(
        (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const { zoom, panOffset } = state.ui;
            const { naturalWidth, naturalHeight } = state.image;
            const imgX = (e.clientX - rect.left - panOffset.x) / zoom;
            const imgY = (e.clientY - rect.top - panOffset.y) / zoom;
            return {
                x: (imgX / naturalWidth) * 100,
                y: (imgY / naturalHeight) * 100,
            };
        },
        [state.ui, state.image]
    );

    const handleCanvasMouseMove = useCallback(
        (e) => {
            const { selectedTool, activeDrawingPathId } = state.ui;
            if (selectedTool !== "draw" || !activeDrawingPathId) {
                setCursorPoint(null);
                return;
            }
            setCursorPoint(toImagePct(e));
        },
        [state.ui, toImagePct]
    );

    const handleCanvasClick = useCallback(
        (e) => {
            const { selectedTool, selectedSymbolKey, activeDrawingPathId } =
                state.ui;
            if (selectedTool !== "draw" || !selectedSymbolKey) return;

            const symbol = getSymbolByKey(selectedSymbolKey);
            if (!symbol) return;

            const isDrawType =
                symbol.type === ELEMENT_TYPES.CONTOUR ||
                symbol.type === ELEMENT_TYPES.ZONE;
            if (!isDrawType) return;

            const point = toImagePct(e);

            if (!activeDrawingPathId) {
                // Premier clic : crée le chemin ET pose le premier point immédiatement
                actions.startContourPath(selectedSymbolKey, point);
                return;
            }

            // Clics suivants : ajoute un point au chemin actif
            actions.addContourPoint(activeDrawingPathId, point);
        },
        [state.ui, actions, toImagePct]
    );

    const handleCanvasDblClick = useCallback(
        (e) => {
            e.preventDefault();
            const { activeDrawingPathId } = state.ui;
            if (!activeDrawingPathId) return;
            setCursorPoint(null);
            actions.closeContourPath(activeDrawingPathId);
        },
        [state.ui, actions]
    );

    return {
        cursorPoint,
        handleCanvasClick,
        handleCanvasDblClick,
        handleCanvasMouseMove,
    };
}
