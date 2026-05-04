/**
 * @fileoverview Hook d'accès à l'élément sélectionné (symbole ou contour)
 * @returns {{ item: object|null, type: 'legend'|'contour'|null, symbol: object|null }}
 */
import { useApp } from "./useApp";
import { getSymbolByKey } from "../constants/ppmsLegend";

export function useSelectedItem() {
    const { state } = useApp();
    const { selectedItemId } = state.ui;

    if (!selectedItemId) return { item: null, type: null, symbol: null };

    const legendItem = state.legendItems.find((i) => i.id === selectedItemId);
    if (legendItem) {
        return {
            item: legendItem,
            type: "legend",
            symbol: getSymbolByKey(legendItem.symbolKey),
        };
    }

    const contourItem = state.contourPaths.find((p) => p.id === selectedItemId);
    if (contourItem) {
        return {
            item: contourItem,
            type: "contour",
            symbol: getSymbolByKey(contourItem.symbolKey),
        };
    }

    return { item: null, type: null, symbol: null };
}
