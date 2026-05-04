/**
 * @fileoverview Hook générique de drag-and-drop
 * Le drag ne démarre qu'après un déplacement de DRAG_THRESHOLD_PX pixels.
 * Un simple clic ne déclenche pas le drag et ne change pas le curseur.
 *
 * @param {{ onMove: (dx:number, dy:number) => void, onEnd?: () => void }} options
 * @returns {{ onDragStart: (e: MouseEvent) => void }}
 */
import { useCallback, useEffect, useRef } from "react";

/** Seuil en px avant que le drag soit considéré actif */
const DRAG_THRESHOLD_PX = 5;

export function useDrag({ onMove, onEnd }) {
    const origin = useRef({ x: 0, y: 0 });
    const pressed = useRef(false); // mousedown reçu
    const dragging = useRef(false); // seuil franchi
    const onMoveRef = useRef(onMove);
    const onEndRef = useRef(onEnd);

    useEffect(() => {
        onMoveRef.current = onMove;
    }, [onMove]);
    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);

    const handleMove = useRef((e) => {
        if (!pressed.current) return;
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;

        // Activation du drag uniquement après le seuil
        if (!dragging.current) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
            dragging.current = true;
            document.body.style.cursor = "grabbing";
        }

        onMoveRef.current?.(dx, dy);
    }).current;

    const handleUp = useRef(() => {
        const wasDragging = dragging.current;
        pressed.current = false;
        dragging.current = false;
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleUp);
        if (wasDragging) onEndRef.current?.();
    }).current;

    const onDragStart = useCallback(
        (e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            // Pas de preventDefault — l'événement click doit pouvoir se déclencher
            pressed.current = true;
            dragging.current = false;
            origin.current = { x: e.clientX, y: e.clientY };
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
        },
        [handleMove, handleUp]
    );

    return { onDragStart };
}
