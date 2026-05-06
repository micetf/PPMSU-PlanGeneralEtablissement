/**
 * @fileoverview Hook de dessin des flèches (accès / escalier) en 2 clics.
 * Premier clic : pose le point de départ.
 * Deuxième clic : finalise la flèche et la crée dans l'état.
 */
import { useCallback, useState } from "react";
import { useApp } from "./useApp";
import { getNiveauSymbolByKey } from "../constants/niveauxLegend";
import { eventToNiveauPct } from "../utils/niveauCoords";

export function useArrowDraw() {
    const { state, actions } = useApp();
    const [pendingStart, setPendingStart] = useState(null); // { x, y } % image
    const [cursorPos, setCursorPos] = useState(null);       // { x, y } % image

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const toImagePct = useCallback(
        (e) => eventToNiveauPct(e, activeNiveau, state.ui),
        [state.ui, activeNiveau]
    );

    const handleCanvasMouseMove = useCallback(
        (e) => {
            if (state.ui.selectedTool !== "arrow") {
                setCursorPos(null);
                return;
            }
            setCursorPos(toImagePct(e));
        },
        [state.ui.selectedTool, toImagePct]
    );

    const handleCanvasClick = useCallback(
        (e) => {
            const { selectedTool, selectedSymbolKey } = state.ui;
            if (selectedTool !== "arrow" || !selectedSymbolKey) return;

            const symbol = getNiveauSymbolByKey(selectedSymbolKey);
            if (!symbol) return;

            const point = toImagePct(e);
            if (!point) return;

            if (!pendingStart) {
                // Premier clic : mémorise le point de départ
                setPendingStart(point);
            } else {
                // Deuxième clic : crée la flèche
                actions.addNiveauLegendItem(selectedSymbolKey, {
                    startX: pendingStart.x,
                    startY: pendingStart.y,
                    endX: point.x,
                    endY: point.y,
                });
                setPendingStart(null);
                setCursorPos(null);
            }
        },
        [state.ui, pendingStart, toImagePct, actions]
    );

    // Réinitialise si on change d'outil
    const reset = useCallback(() => {
        setPendingStart(null);
        setCursorPos(null);
    }, []);

    return {
        pendingStart,
        cursorPos,
        handleCanvasClick,
        handleCanvasMouseMove,
        reset,
    };
}
