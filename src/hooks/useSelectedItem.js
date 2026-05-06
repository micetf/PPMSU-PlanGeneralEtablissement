/**
 * @fileoverview Hook d'accès à l'élément sélectionné (module-aware)
 * @returns {{ item: object|null, type: 'legend'|'contour'|null, symbol: object|null }}
 */
import { useApp } from "./useApp";
import { getSymbolByKey } from "../constants/ppmsLegend";
import { getNiveauSymbolByKey } from "../constants/niveauxLegend";

export function useSelectedItem() {
    const { state } = useApp();
    const { selectedItemId, moduleActif } = state.ui;

    if (!selectedItemId) return { item: null, type: null, symbol: null };

    if (moduleActif === "planGeneral") {
        const legendItem = state.planGeneral.legendItems.find(
            (i) => i.id === selectedItemId
        );
        if (legendItem) {
            return {
                item: legendItem,
                type: "legend",
                symbol: getSymbolByKey(legendItem.symbolKey),
            };
        }

        const contourItem = state.planGeneral.contourPaths.find(
            (p) => p.id === selectedItemId
        );
        if (contourItem) {
            return {
                item: contourItem,
                type: "contour",
                symbol: getSymbolByKey(contourItem.symbolKey),
            };
        }
    }

    if (moduleActif === "planNiveaux") {
        const activeId = state.planNiveaux.activeNiveauId;
        const activeNiveau = state.planNiveaux.niveaux.find(
            (n) => n.id === activeId
        );
        if (activeNiveau) {
            const legendItem = activeNiveau.legendItems.find(
                (i) => i.id === selectedItemId
            );
            if (legendItem) {
                return {
                    item: legendItem,
                    type: "legend",
                    symbol: getNiveauSymbolByKey(legendItem.symbolKey),
                };
            }

            const contourItem = activeNiveau.contourPaths.find(
                (p) => p.id === selectedItemId
            );
            if (contourItem) {
                return {
                    item: contourItem,
                    type: "contour",
                    symbol: getNiveauSymbolByKey(contourItem.symbolKey),
                };
            }
        }
    }

    return { item: null, type: null, symbol: null };
}
