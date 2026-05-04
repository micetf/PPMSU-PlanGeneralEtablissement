/**
 * @fileoverview Barre latérale principale — catalogue des symboles PPMS par catégorie
 * Permet de sélectionner un symbole à placer ou un outil de tracé.
 */
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import {
    PPMS_CATEGORIES,
    CATEGORY_LABELS,
    ELEMENT_TYPES,
    getSymbolsByCategory,
    getSymbolByKey,
} from "../../constants/ppmsLegend";
import { CategorySection } from "./CategorySection";

/** Ordre d'affichage des catégories dans la toolbar */
const CATEGORY_ORDER = [
    PPMS_CATEGORIES.ACCES_SITE,
    PPMS_CATEGORIES.ACCES_BATIMENT_PIETON,
    PPMS_CATEGORIES.ACCES_BATIMENT_VEHICULE,
    PPMS_CATEGORIES.SORTIES_SECOURS,
    PPMS_CATEGORIES.MISE_EN_SURETE,
    PPMS_CATEGORIES.RASSEMBLEMENT,
    PPMS_CATEGORIES.DELIMITATION,
    PPMS_CATEGORIES.ANNOTATION,
    PPMS_CATEGORIES.ORIENTATION,
];

/**
 * Bouton d'outil global (sélection, etc.)
 * @param {{ icon: string, label: string, active: boolean, onClick: Function }} props
 */
function ToolButton({ icon, label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            aria-pressed={active}
            title={label}
            className={[
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                active
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
        >
            <span aria-hidden="true">{icon}</span>
            <span>{label}</span>
        </button>
    );
}

ToolButton.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

/**
 * Barre latérale de légende PPMS
 * @param {{ className?: string }} props
 */
export function LegendToolbar({ className }) {
    const { state, actions } = useApp();
    const symbolsByCategory = getSymbolsByCategory();

    const handleSelectSymbol = (key) => {
        const symbol = getSymbolByKey(key);
        if (!symbol) return;

        if (symbol.type === ELEMENT_TYPES.CONTOUR) {
            // Seul CONTOUR déclenche l'outil de tracé
            // ZMS est désormais SYMBOL → outil place
            actions.selectSymbol(key);
            actions.setTool("draw");
        } else {
            actions.selectSymbol(key);
        }
    };

    const isSelectTool = state.ui.selectedTool === "select";

    return (
        <aside
            className={[
                "flex flex-col bg-white border-r border-slate-200",
                "w-52 shrink-0 overflow-y-auto",
                className ?? "",
            ].join(" ")}
            aria-label="Outils de légende PPMS"
        >
            {/* En-tête toolbar */}
            <div className="px-3 py-3 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-700">
                    Légende PPMS
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Fascicule 2 — Eduscol
                </p>
            </div>

            {/* Outils globaux */}
            <div className="px-2 py-2 border-b border-slate-200 flex flex-col gap-1">
                <ToolButton
                    icon="↖"
                    label="Sélectionner"
                    active={isSelectTool}
                    onClick={() => actions.setTool("select")}
                />
            </div>

            {/* Catalogue par catégorie */}
            <div className="flex-1 overflow-y-auto">
                {CATEGORY_ORDER.map((catKey) => {
                    const symbols = symbolsByCategory[catKey];
                    if (!symbols?.length) return null;
                    return (
                        <CategorySection
                            key={catKey}
                            label={CATEGORY_LABELS[catKey]}
                            symbols={symbols}
                            selectedKey={state.ui.selectedSymbolKey}
                            onSelect={handleSelectSymbol}
                        />
                    );
                })}
            </div>

            {/* Pied de toolbar — info outil actif */}
            {state.ui.selectedSymbolKey && (
                <div className="px-3 py-2 border-t border-slate-200 bg-blue-50">
                    <p className="text-[10px] text-blue-600 font-medium">
                        Cliquez sur le plan pour placer l'élément
                    </p>
                    <button
                        type="button"
                        onClick={() => actions.setTool("select")}
                        className="mt-1 text-[10px] text-blue-400 hover:text-blue-600
                       underline focus:outline-none focus-visible:ring-1
                       focus-visible:ring-blue-400 rounded"
                    >
                        Annuler
                    </button>
                </div>
            )}
        </aside>
    );
}

LegendToolbar.propTypes = {
    className: PropTypes.string,
};

LegendToolbar.defaultProps = {
    className: "",
};
