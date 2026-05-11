/**
 * @fileoverview Hook de dessin des flèches (polyligne multi-clic).
 * Chaque clic ajoute un sommet. Double-clic finalise la polyligne.
 * Utilise un ref pour accès synchrone aux points lors du double-clic
 * (le navigateur déclenche click×2 puis dblclick dans cet ordre).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "./useApp";
import { getNiveauSymbolByKey } from "../constants/niveauxLegend";
import { eventToNiveauPct } from "../utils/niveauCoords";

export function useArrowDraw() {
    const { state, actions } = useApp();
    const [points, setPoints] = useState([]);
    const pointsRef = useRef([]);
    const [cursorPos, setCursorPos] = useState(null);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const toImagePct = useCallback(
        (e) => eventToNiveauPct(e, activeNiveau, state.ui),
        [state.ui, activeNiveau]
    );

    useEffect(() => {
        if (state.ui.selectedTool !== "arrow") {
            pointsRef.current = [];
            setPoints([]);
            setCursorPos(null);
        }
    }, [state.ui.selectedTool]);

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

            const point = toImagePct(e);
            if (!point) return;

            const next = [...pointsRef.current, point];
            pointsRef.current = next;
            setPoints(next);
        },
        [state.ui, toImagePct]
    );

    const handleCanvasDblClick = useCallback(
        () => {
            const { selectedTool, selectedSymbolKey } = state.ui;
            if (selectedTool !== "arrow" || !selectedSymbolKey) return;

            // Le navigateur a déjà déclenché click×2 avant dblclick,
            // donc pointsRef a 2 points en trop. On retire le dernier.
            const finalPoints = pointsRef.current.slice(0, -1);

            pointsRef.current = [];
            setPoints([]);
            setCursorPos(null);

            if (finalPoints.length < 2) return;

            const symbol = getNiveauSymbolByKey(selectedSymbolKey);
            if (!symbol) return;

            actions.addNiveauLegendItem(selectedSymbolKey, {
                points: finalPoints,
            });
        },
        [state.ui, actions]
    );

    const reset = useCallback(() => {
        pointsRef.current = [];
        setPoints([]);
        setCursorPos(null);
    }, []);

    return {
        arrowPoints: points,
        arrowCursorPos: cursorPos,
        handleCanvasClick,
        handleCanvasMouseMove,
        handleCanvasDblClick,
        reset,
    };
}
