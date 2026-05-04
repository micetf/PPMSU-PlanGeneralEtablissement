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
 * Bouton d'outil global
 * @param {{ icon:string, label:string, active:boolean, onClick:Function }} props
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
 * Bandeau d'état de l'outil actif — affiché en bas de la toolbar
 * @param {{ tool:string, symbolKey:string|null, onCancel:Function }} props
 */
function ActiveToolBanner({ tool, symbolKey, onCancel }) {
    if (tool === "select" || !symbolKey) return null;

    const symbol = getSymbolByKey(symbolKey);
    if (!symbol) return null;

    const isDraw = tool === "draw";
    const message = isDraw
        ? "Cliquez pour poser les sommets"
        : "Cliquez sur le plan pour placer";

    const hint = isDraw
        ? "Clic sur le point de départ ou double-clic pour terminer"
        : "Appuyez sur Échap pour annuler";

    return (
        <div
            className={[
                "px-3 py-2 border-t border-slate-200",
                isDraw ? "bg-amber-50" : "bg-blue-50",
            ].join(" ")}
        >
            {/* Nom du symbole actif */}
            <p
                className={[
                    "text-[10px] font-semibold truncate mb-0.5",
                    isDraw ? "text-amber-700" : "text-blue-700",
                ].join(" ")}
            >
                {isDraw ? "✏️" : "📍"} {symbol.label}
            </p>

            {/* Instruction principale */}
            <p
                className={[
                    "text-[10px]",
                    isDraw ? "text-amber-600" : "text-blue-600",
                ].join(" ")}
            >
                {message}
            </p>

            {/* Astuce contextuelle */}
            <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>

            {/* Bouton annulation */}
            <button
                type="button"
                onClick={onCancel}
                className={[
                    "mt-1.5 text-[10px] underline focus:outline-none rounded",
                    "focus-visible:ring-1",
                    isDraw
                        ? "text-amber-500 hover:text-amber-700 focus-visible:ring-amber-400"
                        : "text-blue-400 hover:text-blue-600 focus-visible:ring-blue-400",
                ].join(" ")}
            >
                Annuler (Échap)
            </button>
        </div>
    );
}

ActiveToolBanner.propTypes = {
    tool: PropTypes.string.isRequired,
    symbolKey: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
};

ActiveToolBanner.defaultProps = {
    symbolKey: null,
};

/**
 * Barre latérale de légende PPMS
 */
export function LegendToolbar() {
    const { state, actions } = useApp();
    const symbolsByCategory = getSymbolsByCategory();
    const { selectedTool, selectedSymbolKey } = state.ui;

    const handleSelectSymbol = (key) => {
        const symbol = getSymbolByKey(key);
        if (!symbol) return;

        if (symbol.type === ELEMENT_TYPES.CONTOUR) {
            actions.selectSymbol(key);
            actions.setTool("draw");
        } else {
            actions.selectSymbol(key);
        }
    };

    const handleCancel = () => actions.setTool("select");

    return (
        <aside
            className="flex flex-col bg-white border-r border-slate-200
                 w-52 shrink-0 overflow-hidden"
            aria-label="Outils de légende PPMS"
        >
            {/* En-tête */}
            <div className="px-3 py-3 border-b border-slate-200 shrink-0">
                <h2 className="text-sm font-bold text-slate-700">
                    Légende PPMS
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Fascicule 2 — Eduscol
                </p>
            </div>

            {/* Outil sélection */}
            <div className="px-2 py-2 border-b border-slate-200 shrink-0">
                <ToolButton
                    icon="↖"
                    label="Sélectionner"
                    active={selectedTool === "select"}
                    onClick={handleCancel}
                />
            </div>

            {/* Catalogue — scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* Section outils de tracé — séparée visuellement */}
                <div className="border-b border-slate-200">
                    <p
                        className="px-3 py-1.5 text-[10px] font-semibold text-slate-400
                        uppercase tracking-wide bg-slate-50"
                    >
                        Outils de tracé
                    </p>
                    {[PPMS_CATEGORIES.DELIMITATION].map((catKey) => {
                        const symbols = symbolsByCategory[catKey];
                        if (!symbols?.length) return null;
                        return (
                            <CategorySection
                                key={catKey}
                                label={CATEGORY_LABELS[catKey]}
                                symbols={symbols}
                                selectedKey={selectedSymbolKey}
                                onSelect={handleSelectSymbol}
                            />
                        );
                    })}
                </div>

                {/* Section symboles ponctuels */}
                <div>
                    <p
                        className="px-3 py-1.5 text-[10px] font-semibold text-slate-400
                        uppercase tracking-wide bg-slate-50"
                    >
                        Symboles
                    </p>
                    {CATEGORY_ORDER.filter(
                        (k) => k !== PPMS_CATEGORIES.DELIMITATION
                    ).map((catKey) => {
                        const symbols = symbolsByCategory[catKey];
                        if (!symbols?.length) return null;
                        return (
                            <CategorySection
                                key={catKey}
                                label={CATEGORY_LABELS[catKey]}
                                symbols={symbols}
                                selectedKey={selectedSymbolKey}
                                onSelect={handleSelectSymbol}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Bandeau outil actif — en bas, toujours visible */}
            <div className="shrink-0">
                <ActiveToolBanner
                    tool={selectedTool}
                    symbolKey={selectedSymbolKey}
                    onCancel={handleCancel}
                />
            </div>
        </aside>
    );
}
