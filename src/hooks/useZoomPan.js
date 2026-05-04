/**
 * @fileoverview Hook de gestion du zoom et du déplacement du canvas
 * Zoom à la molette centré sur le curseur, pan au clic-glisser
 */
import { useCallback, useRef } from "react";
import { useApp } from "./useApp";

/**
 * @returns {{
 *   handleWheel: Function,
 *   handleMouseDown: Function,
 *   handleMouseMove: Function,
 *   handleMouseUp: Function,
 * }}
 */
export function useZoomPan() {
    const { state, actions } = useApp();
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });
    const panOrigin = useRef({ x: 0, y: 0 });

    /** Zoom centré sur la position du curseur */
    const handleWheel = useCallback(
        (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 0.9;
            const nextZoom = Math.max(
                0.25,
                Math.min(5, state.ui.zoom * factor)
            );

            // Maintient le point sous le curseur fixe pendant le zoom
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const { x, y } = state.ui.panOffset;

            actions.setZoom(nextZoom);
            actions.setPan({
                x: mouseX - (mouseX - x) * (nextZoom / state.ui.zoom),
                y: mouseY - (mouseY - y) * (nextZoom / state.ui.zoom),
            });
        },
        [state.ui.zoom, state.ui.panOffset, actions]
    );

    const handleMouseDown = useCallback(
        (e) => {
            if (e.button !== 1 && !(e.button === 0 && e.altKey)) return;
            e.preventDefault();
            isPanning.current = true;
            panStart.current = { x: e.clientX, y: e.clientY };
            panOrigin.current = { ...state.ui.panOffset };
        },
        [state.ui.panOffset]
    );

    const handleMouseMove = useCallback(
        (e) => {
            if (!isPanning.current) return;
            actions.setPan({
                x: panOrigin.current.x + (e.clientX - panStart.current.x),
                y: panOrigin.current.y + (e.clientY - panStart.current.y),
            });
        },
        [actions]
    );

    const handleMouseUp = useCallback(() => {
        isPanning.current = false;
    }, []);

    return { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp };
}
