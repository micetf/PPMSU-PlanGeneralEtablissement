/**
 * @fileoverview Hook de gestion du tracé de contours polygonaux
 * Clic = ajouter un point, double-clic ou clic sur point départ = fermer
 */
import { useCallback, useState } from "react";
import { useApp } from "./useApp";
import { getSymbolByKey, ELEMENT_TYPES } from "../constants/ppmsLegend";

/** Rayon de snap vers le point de départ (px écran) */
const SNAP_RADIUS_PX = 12;

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

    /**
     * Vérifie si le clic est proche du premier point du tracé actif
     * La comparaison se fait en pixels écran pour un snap cohérent quel que soit le zoom
     * @param {MouseEvent} e
     * @param {{x:number, y:number}} firstPoint - coordonnées % image
     * @returns {boolean}
     */
    const isNearFirstPoint = useCallback(
        (e, firstPoint) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const { zoom, panOffset } = state.ui;
            const { naturalWidth, naturalHeight } = state.image;

            // Convertit le premier point % → px écran
            const firstPxX =
                (firstPoint.x / 100) * naturalWidth * zoom +
                panOffset.x +
                rect.left;
            const firstPxY =
                (firstPoint.y / 100) * naturalHeight * zoom +
                panOffset.y +
                rect.top;

            const dist = Math.hypot(e.clientX - firstPxX, e.clientY - firstPxY);
            return dist <= SNAP_RADIUS_PX;
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

            // Premier clic : crée le chemin ET pose le premier point
            if (!activeDrawingPathId) {
                actions.startContourPath(selectedSymbolKey, point);
                return;
            }

            // Vérifie si le clic est proche du premier point (snap to close)
            const activePath = state.contourPaths.find(
                (p) => p.id === activeDrawingPathId
            );
            if (
                activePath &&
                activePath.points.length >= 3 &&
                isNearFirstPoint(e, activePath.points[0])
            ) {
                // Fermeture automatique par snap sur le point de départ
                setCursorPoint(null);
                actions.closeContourPath(activeDrawingPathId);
                return;
            }

            // Clic normal : ajoute un point
            actions.addContourPoint(activeDrawingPathId, point);
        },
        [state.ui, state.contourPaths, actions, toImagePct, isNearFirstPoint]
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
