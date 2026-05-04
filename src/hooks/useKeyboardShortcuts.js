/**
 * @fileoverview Raccourcis clavier globaux du workspace
 *
 * Escape :
 *   - mode draw + tracé actif → nettoie le tracé (géré par le reducer)
 *   - mode place              → retour à select
 *   - mode select + sélection → désélectionne
 *
 * Delete / Backspace :
 *   - élément sélectionné     → supprime l'élément
 */
import { useEffect } from "react";
import { useApp } from "./useApp";

export function useKeyboardShortcuts() {
    const { state, actions } = useApp();

    useEffect(() => {
        const handler = (e) => {
            // Ne pas interférer avec la saisie dans les inputs/textareas
            const tag = document.activeElement?.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea") return;

            const { selectedTool, selectedItemId, activeDrawingPathId } =
                state.ui;

            // ── Escape ────────────────────────────────────────────────────────────
            if (e.key === "Escape") {
                e.preventDefault();

                if (selectedTool === "draw" && activeDrawingPathId) {
                    // cleanActiveDrawing est appelé dans le reducer via SET_SELECTED_TOOL
                    actions.setTool("select");
                    return;
                }
                if (selectedTool === "place") {
                    actions.setTool("select");
                    return;
                }
                if (selectedItemId) {
                    actions.selectItem(null);
                    return;
                }
            }

            // ── Supprimer l'élément sélectionné ───────────────────────────────────
            if (e.key === "Delete" || e.key === "Backspace") {
                if (!selectedItemId) return;
                e.preventDefault();

                const isLegend = state.legendItems.some(
                    (i) => i.id === selectedItemId
                );
                const isContour = state.contourPaths.some(
                    (p) => p.id === selectedItemId
                );

                if (isLegend) actions.removeLegendItem(selectedItemId);
                if (isContour) actions.removeContourPath(selectedItemId);
                actions.selectItem(null);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [state.ui, state.legendItems, state.contourPaths, actions]);
}
