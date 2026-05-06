/**
 * @fileoverview Hook de tracé de contours polygonaux pour le module Plan des Niveaux
 * Adapté de useContourDraw.js — opère sur le niveau actif.
 */
import { useCallback, useState } from "react";
import { useApp } from "./useApp";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../constants/niveauxLegend";
import { eventToNiveauPct, isNearFirstPointRotated } from "../utils/niveauCoords";

export function useNiveauContourDraw() {
    const { state, actions } = useApp();
    const [cursorPoint, setCursorPoint] = useState(null);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const toImagePct = useCallback(
        (e) => eventToNiveauPct(e, activeNiveau, state.ui),
        [state.ui, activeNiveau]
    );

    const isNearFirstPoint = useCallback(
        (e, firstPoint) => isNearFirstPointRotated(e, firstPoint, activeNiveau, state.ui),
        [state.ui, activeNiveau]
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
            const { selectedTool, selectedSymbolKey, activeDrawingPathId } = state.ui;
            if (selectedTool !== "draw" || !selectedSymbolKey) return;

            const symbol = getNiveauSymbolByKey(selectedSymbolKey);
            if (!symbol || symbol.type !== NIVEAUX_ELEMENT_TYPES.ZMS_ZONE) return;

            const point = toImagePct(e);
            if (!point) return;

            if (!activeDrawingPathId) {
                actions.startNiveauContourPath(selectedSymbolKey, point);
                return;
            }

            const activePath = activeNiveau?.contourPaths.find(
                (p) => p.id === activeDrawingPathId
            );
            if (
                activePath &&
                activePath.points.length >= 3 &&
                isNearFirstPoint(e, activePath.points[0])
            ) {
                setCursorPoint(null);
                actions.closeNiveauContourPath(activeDrawingPathId);
                return;
            }

            actions.addNiveauContourPoint(activeDrawingPathId, point);
        },
        [state.ui, activeNiveau, actions, toImagePct, isNearFirstPoint]
    );

    const handleCanvasDblClick = useCallback(
        (e) => {
            e.preventDefault();
            const { activeDrawingPathId } = state.ui;
            if (!activeDrawingPathId) return;
            setCursorPoint(null);
            actions.closeNiveauContourPath(activeDrawingPathId);
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
