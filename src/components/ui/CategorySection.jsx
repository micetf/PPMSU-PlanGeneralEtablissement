/**
 * @fileoverview Section pliable d'une catégorie de symboles dans la toolbar
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { SymbolPreview } from "./SymbolPreview";

/**
 * Bouton représentant un symbole sélectionnable
 * @param {{ symbol: object, isSelected: boolean, onSelect: Function }} props
 */
function SymbolButton({ symbol, isSelected, onSelect }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(symbol.key)}
            title={symbol.description}
            aria-label={symbol.label}
            aria-pressed={isSelected}
            className={[
                "flex flex-col items-center gap-1 p-2 rounded-xl w-full",
                "text-center transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                isSelected
                    ? "bg-blue-100 ring-2 ring-blue-400"
                    : "hover:bg-slate-100",
            ].join(" ")}
        >
            {/* Prévisualisation */}
            <div className="w-8 h-8 flex items-center justify-center">
                <SymbolPreview symbol={symbol} />
            </div>
            {/* Label tronqué */}
            <span className="text-[10px] leading-tight text-slate-600 line-clamp-2 w-full">
                {symbol.label}
            </span>
        </button>
    );
}

SymbolButton.propTypes = {
    symbol: PropTypes.object.isRequired,
    isSelected: PropTypes.bool.isRequired,
    onSelect: PropTypes.func.isRequired,
};

/**
 * Section pliable d'une catégorie
 * @param {{ label: string, symbols: object[], selectedKey: string|null, onSelect: Function }} props
 */
export function CategorySection({ label, symbols, selectedKey, onSelect }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="border-b border-slate-200 last:border-0">
            {/* En-tête de catégorie */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2
                   text-xs font-semibold text-slate-500 uppercase tracking-wide
                   hover:bg-slate-50 transition-colors
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                aria-expanded={open}
            >
                <span>{label}</span>
                <span
                    className="transition-transform duration-200 text-slate-400"
                    style={{
                        transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                    aria-hidden="true"
                >
                    ▾
                </span>
            </button>

            {/* Grille de symboles */}
            {open && (
                <div className="grid grid-cols-2 gap-1 px-2 pb-2">
                    {symbols.map((symbol) => (
                        <SymbolButton
                            key={symbol.key}
                            symbol={symbol}
                            isSelected={selectedKey === symbol.key}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

CategorySection.propTypes = {
    label: PropTypes.string.isRequired,
    symbols: PropTypes.arrayOf(PropTypes.object).isRequired,
    selectedKey: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
};

CategorySection.defaultProps = {
    selectedKey: null,
};
