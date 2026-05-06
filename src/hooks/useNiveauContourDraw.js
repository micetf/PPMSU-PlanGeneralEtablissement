/**
 * @fileoverview Hook de tracé de contours polygonaux pour le module Plan des Niveaux
 * Adapté de useContourDraw.js — opère sur le niveau actif.
 */
import { useCallback, useState } from "react";
import { useApp } from "./useApp";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../constants/niveauxLegend";

const SNAP_RADIUS_PX = 12;

export function useNiveauContourDraw() {
    const { state, actions } = useApp();
    const [cursorPoint, setCursorPoint] = useState(null);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const toImagePct = useCallback(
        (e) => {
            if (!activeNiveau) return null;
            const rect = e.currentTarget.getBoundingClientRect();
            const { zoom, panOffset } = state.ui;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            const imgX = (e.clientX - rect.left - panOffset.x) / zoom;
            const imgY = (e.clientY - rect.top - panOffset.y) / zoom;
            return {
                x: (imgX / naturalWidth) * 100,
                y: (imgY / naturalHeight) * 100,
            };
        },
        [state.ui, activeNiveau]
    );

    const isNearFirstPoint = useCallback(
        (e, firstPoint) => {
            if (!activeNiveau) return false;
            const rect = e.currentTarget.getBoundingClientRect();
            const { zoom, panOffset } = state.ui;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            const firstPxX =
                (firstPoint.x / 100) * naturalWidth * zoom + panOffset.x + rect.left;
            const firstPxY =
                (firstPoint.y / 100) * naturalHeight * zoom + panOffset.y + rect.top;
            return Math.hypot(e.clientX - firstPxX, e.clientY - firstPxY) <= SNAP_RADIUS_PX;
        },
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
