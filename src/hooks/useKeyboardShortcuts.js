/**
 * @fileoverview Raccourcis clavier globaux du workspace (Plan Général + Plan des Niveaux)
 *
 * Escape :
 *   - mode draw + tracé actif → nettoie le tracé (géré par le reducer)
 *   - mode place/arrow        → retour à select
 *   - mode select + sélection → désélectionne
 *
 * Delete / Backspace :
 *   - élément sélectionné     → supprime l'élément (module-aware)
 */
import { useEffect } from "react";
import { useApp } from "./useApp";

export function useKeyboardShortcuts() {
    const { state, actions } = useApp();

    useEffect(() => {
        const handler = (e) => {
            const tag = document.activeElement?.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea") return;

            const { selectedTool, selectedItemId, activeDrawingPathId, moduleActif } =
                state.ui;

            // ── Escape ────────────────────────────────────────────────────────
            if (e.key === "Escape") {
                e.preventDefault();
                if (
                    (selectedTool === "draw" || selectedTool === "arrow") &&
                    activeDrawingPathId
                ) {
                    actions.setTool("select");
                    return;
                }
                if (selectedTool === "place" || selectedTool === "arrow") {
                    actions.setTool("select");
                    return;
                }
                if (selectedItemId) {
                    actions.selectItem(null);
                    return;
                }
            }

            // ── Supprimer l'élément sélectionné ──────────────────────────────
            if (e.key === "Delete" || e.key === "Backspace") {
                if (!selectedItemId) return;
                e.preventDefault();

                if (moduleActif === "planGeneral") {
                    const isLegend = state.planGeneral.legendItems.some(
                        (i) => i.id === selectedItemId
                    );
                    const isContour = state.planGeneral.contourPaths.some(
                        (p) => p.id === selectedItemId
                    );
                    if (isLegend) actions.removeLegendItem(selectedItemId);
                    if (isContour) actions.removeContourPath(selectedItemId);
                } else if (moduleActif === "planNiveaux") {
                    const activeId = state.planNiveaux.activeNiveauId;
                    const activeNiveau = state.planNiveaux.niveaux.find(
                        (n) => n.id === activeId
                    );
                    if (activeNiveau) {
                        const isLegend = activeNiveau.legendItems.some(
                            (i) => i.id === selectedItemId
                        );
                        const isContour = activeNiveau.contourPaths.some(
                            (p) => p.id === selectedItemId
                        );
                        if (isLegend)
                            actions.removeNiveauLegendItem(selectedItemId);
                        if (isContour)
                            actions.removeNiveauContourPath(selectedItemId);
                    }
                }
                actions.selectItem(null);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [
        state.ui,
        state.planGeneral.legendItems,
        state.planGeneral.contourPaths,
        state.planNiveaux,
        actions,
    ]);
}
