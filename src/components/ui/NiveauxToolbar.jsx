/**
 * @fileoverview Barre latérale droite — outils du module Plan des Niveaux.
 * ZMS polygonaux, flèches (polylignes), photos planche, annotations.
 */
import { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import {
    NIVEAUX_SYMBOLS_BY_CATEGORY,
    NIVEAUX_CATEGORY_LABELS,
    NIVEAUX_ELEMENT_TYPES,
    getNiveauSymbolByKey,
} from "../../constants/niveauxLegend";

function SymbolButton({ symbol, isActive, onClick }) {
    return (
        <button
            type="button"
            onClick={() => onClick(symbol.key)}
            title={symbol.description || symbol.label}
            aria-pressed={isActive}
            className={[
                "flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-left",
                "transition-colors duration-150 focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-blue-400",
                isActive
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:bg-slate-100",
            ].join(" ")}
        >
            <span
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.6)" : symbol.color,
                }}
                aria-hidden="true"
            />
            {symbol.label}
        </button>
    );
}

SymbolButton.propTypes = {
    symbol: PropTypes.object.isRequired,
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

function ActiveToolBanner({ tool, symbolKey, onCancel }) {
    if (tool === "select" || !symbolKey) return null;

    const symbol = getNiveauSymbolByKey(symbolKey);
    if (!symbol) return null;

    const isDraw = tool === "draw";
    const isArrow = tool === "arrow";

    let icon = "📍";
    let message = "Cliquez sur le plan pour placer";
    let hint = "Appuyez sur Échap pour annuler";

    if (isDraw) {
        icon = "✏️";
        message = "Cliquez pour poser les sommets";
        hint = "Clic sur le 1er point ou double-clic pour terminer";
    } else if (isArrow) {
        icon = "↗";
        message = "Cliquez pour ajouter des points";
        hint = "Double-clic pour terminer la flèche";
    }

    const bg = isDraw
        ? "bg-amber-50 border-t border-amber-100"
        : isArrow
          ? "bg-purple-50 border-t border-purple-100"
          : "bg-blue-50 border-t border-blue-100";
    const textPrimary = isDraw
        ? "text-amber-700"
        : isArrow
          ? "text-purple-700"
          : "text-blue-700";
    const textSecondary = isDraw
        ? "text-amber-600"
        : isArrow
          ? "text-purple-600"
          : "text-blue-600";
    const cancelColor = isDraw
        ? "text-amber-400 hover:text-amber-700"
        : isArrow
          ? "text-purple-400 hover:text-purple-700"
          : "text-blue-400 hover:text-blue-700";

    return (
        <div className={`px-3 py-2 ${bg}`}>
            <p className={`text-[10px] font-semibold truncate mb-0.5 ${textPrimary}`}>
                {icon} {symbol.label}
            </p>
            <p className={`text-[10px] ${textSecondary}`}>{message}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>
            <button
                type="button"
                onClick={onCancel}
                className={`mt-1.5 text-[10px] underline focus:outline-none rounded ${cancelColor}`}
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
ActiveToolBanner.defaultProps = { symbolKey: null };

export function NiveauxToolbar() {
    const { state, actions } = useApp();
    const { selectedTool, selectedSymbolKey } = state.ui;
    const photoInputRef = useRef(null);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );
    const rotation = activeNiveau?.rotation ?? 0;

    const handlePhotoFileSelect = useCallback(
        async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = "";

            // Lire le fichier une seule fois pour dimensions et stockage
            const src = await new Promise((resolve) => {
                const fr = new FileReader();
                fr.onload = (ev) => resolve(ev.target.result);
                fr.readAsDataURL(file);
            });

            const img = await new Promise((resolve) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.src = src;
            });

            const aspectRatio = img.naturalHeight / img.naturalWidth;
            const photoId = actions.addNiveauPhotoFromDataUrl(file.name, src);

            // Placer la photo à droite du plan d'intervention
            actions.addNiveauLegendItem("photo", {
                photoId,
                x: 112,
                y: 5,
                widthPct: 28,
                aspectRatio,
            });
        },
        [actions]
    );

    const handleSelectSymbol = (key) => {
        const symbol = getNiveauSymbolByKey(key);
        if (!symbol) return;

        if (symbol.type === NIVEAUX_ELEMENT_TYPES.PHOTO) {
            photoInputRef.current?.click();
            return;
        }

        actions.selectSymbol(key);
        if (symbol.type === NIVEAUX_ELEMENT_TYPES.ZMS_ZONE) {
            actions.setTool("draw");
        } else if (symbol.type === NIVEAUX_ELEMENT_TYPES.FLECHE) {
            actions.setTool("arrow");
        } else {
            actions.setTool("place");
        }
    };

    const handleCancel = () => actions.setTool("select");

    return (
        <aside
            className="flex flex-col bg-white border-l border-slate-200
                       w-48 shrink-0 overflow-hidden"
            aria-label="Outils Plan des Niveaux"
        >
            <div className="px-3 py-3 border-b border-slate-200 shrink-0">
                <h2 className="text-sm font-bold text-slate-700">Outils</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">Plan des Niveaux</p>
            </div>

            {/* Rotation du plan */}
            {activeNiveau?.image?.src && (
                <div className="px-3 py-2 border-b border-slate-200 shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Rotation
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => actions.setNiveauRotation(rotation - 90)}
                            title="Pivoter à gauche (−90°)"
                            className="flex-1 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600
                                       hover:bg-slate-200 transition-colors focus:outline-none
                                       focus-visible:ring-2 focus-visible:ring-blue-400"
                            aria-label="Pivoter à gauche"
                        >
                            ↺
                        </button>
                        <span className="text-[10px] text-slate-400 w-8 text-center shrink-0">
                            {rotation}°
                        </span>
                        <button
                            type="button"
                            onClick={() => actions.setNiveauRotation(rotation + 90)}
                            title="Pivoter à droite (+90°)"
                            className="flex-1 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-600
                                       hover:bg-slate-200 transition-colors focus:outline-none
                                       focus-visible:ring-2 focus-visible:ring-blue-400"
                            aria-label="Pivoter à droite"
                        >
                            ↻
                        </button>
                    </div>
                </div>
            )}

            {/* Outil sélection */}
            <div className="px-2 py-2 border-b border-slate-200 shrink-0">
                <button
                    type="button"
                    onClick={handleCancel}
                    aria-pressed={selectedTool === "select"}
                    className={[
                        "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm",
                        "transition-colors focus:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-blue-400",
                        selectedTool === "select"
                            ? "bg-blue-500 text-white"
                            : "text-slate-600 hover:bg-slate-100",
                    ].join(" ")}
                >
                    <span aria-hidden="true">↖</span>
                    Sélectionner
                </button>
            </div>

            {/* Catalogue par catégorie */}
            <div className="flex-1 overflow-y-auto">
                {Object.entries(NIVEAUX_SYMBOLS_BY_CATEGORY).map(
                    ([catKey, symbols]) => (
                        <div
                            key={catKey}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            <p
                                className="px-3 py-1.5 text-[10px] font-semibold text-slate-400
                                           uppercase tracking-wide bg-slate-50"
                            >
                                {NIVEAUX_CATEGORY_LABELS[catKey]}
                            </p>
                            <div className="px-2 py-1 flex flex-col gap-0.5">
                                {symbols.map((symbol) => (
                                    <SymbolButton
                                        key={symbol.key}
                                        symbol={symbol}
                                        isActive={selectedSymbolKey === symbol.key}
                                        onClick={handleSelectSymbol}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="shrink-0">
                <ActiveToolBanner
                    tool={selectedTool}
                    symbolKey={selectedSymbolKey}
                    onCancel={handleCancel}
                />
            </div>

            {/* Input fichier caché pour les photos */}
            <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileSelect}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </aside>
    );
}
