/**
 * @fileoverview Panneau de propriétés de l'élément sélectionné
 */
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useSelectedItem } from "../../hooks/useSelectedItem";
import { NumberField, TextField, SliderField } from "./PropertiesField";
import { getSymbolByKey, ELEMENT_TYPES } from "../../constants/ppmsLegend";

// ── Sous-composants ──────────────────────────────────────────────────────────

/**
 * Bouton d'action (Supprimer / Dupliquer)
 * @param {{ label:string, onClick:Function, variant:"danger"|"secondary" }} props
 */
function ActionButton({ label, onClick, variant }) {
    const base =
        "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors " +
        "focus:outline-none focus-visible:ring-2";
    const variants = {
        danger: `${base} bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-400`,
        secondary: `${base} bg-slate-100 text-slate-600 hover:bg-slate-200 focus-visible:ring-slate-400`,
    };
    return (
        <button type="button" onClick={onClick} className={variants[variant]}>
            {label}
        </button>
    );
}

ActionButton.propTypes = {
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(["danger", "secondary"]).isRequired,
};

/**
 * Contrôle de taille — ratio toujours verrouillé.
 * Pour un élément texte, item.width est interprété comme une taille de police.
 *
 * @param {{ item:object, isTexte:boolean, onChange:Function }} props
 */
function SizeControl({ item, isTexte, onChange }) {
    const ratio = item.height > 0 ? item.width / item.height : 1;

    if (isTexte) {
        return (
            <NumberField
                label="Taille de police"
                value={item.width}
                min={10}
                max={96}
                step={2}
                unit="px"
                onChange={(w) => onChange({ width: w, height: w })}
            />
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            <NumberField
                label="Largeur"
                value={item.width}
                min={16}
                max={800}
                onChange={(w) =>
                    onChange({ width: w, height: Math.round(w / ratio) })
                }
                unit="px"
            />
            <NumberField
                label="Hauteur"
                value={item.height}
                min={16}
                max={800}
                onChange={(h) =>
                    onChange({ height: h, width: Math.round(h * ratio) })
                }
                unit="px"
            />
        </div>
    );
}

SizeControl.propTypes = {
    item: PropTypes.object.isRequired,
    isTexte: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};

SizeControl.defaultProps = { isTexte: false };

/**
 * Contrôle de rotation — slider + boutons de valeurs rapides.
 * @param {{ value:number, onChange:Function }} props
 */
function RotationControl({ value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    Rotation
                </span>
                <span className="text-[10px] text-slate-400">
                    {Math.round(value)}°
                </span>
            </div>
            <input
                type="range"
                value={value}
                min={0}
                max={360}
                step={1}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-blue-500"
                aria-label="Rotation en degrés"
            />
            <div className="grid grid-cols-4 gap-1 mt-0.5">
                {[0, 90, 180, 270].map((deg) => (
                    <button
                        key={deg}
                        type="button"
                        onClick={() => onChange(deg)}
                        className={[
                            "py-1 rounded text-[10px] transition-colors",
                            "focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400",
                            Math.round(value) === deg
                                ? "bg-blue-100 text-blue-600 font-medium"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                        ].join(" ")}
                    >
                        {deg}°
                    </button>
                ))}
            </div>
        </div>
    );
}

RotationControl.propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

// ── Panneaux par type d'élément ──────────────────────────────────────────────

/**
 * Propriétés d'un élément de légende (symbole placé).
 * Distingue annotation (texte libre), zone ZMS (pentagone) et symbole image.
 *
 * @param {{ item:object }} props
 */
function LegendItemProperties({ item }) {
    const { actions } = useApp();
    const symbol = getSymbolByKey(item.symbolKey);
    const update = (changes) => actions.updateLegendItem(item.id, changes);

    const isTexte = item.type === ELEMENT_TYPES.TEXTE;
    const isPentagon = symbol?.shape === "pentagon";

    return (
        <div className="flex flex-col gap-4">
            {/* Texte de l'annotation — uniquement pour les éléments de type texte */}
            {isTexte && (
                <TextField
                    label="Texte affiché"
                    value={item.label ?? ""}
                    placeholder="Saisir une annotation…"
                    onChange={(v) => update({ label: v })}
                />
            )}

            {/* Identifiant de zone — uniquement pour les zones ZMS (pentagone) */}
            {isPentagon && (
                <TextField
                    label="Identifiant de zone"
                    value={item.label ?? ""}
                    placeholder="ex : Salle 12 — 28 élèves"
                    onChange={(v) => update({ label: v })}
                />
            )}

            <SizeControl item={item} isTexte={isTexte} onChange={update} />

            <RotationControl
                value={item.rotation}
                onChange={(v) => update({ rotation: v })}
            />

            <SliderField
                label="Opacité"
                value={item.opacity}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => update({ opacity: v })}
            />
        </div>
    );
}

LegendItemProperties.propTypes = {
    item: PropTypes.object.isRequired,
};

/**
 * Propriétés d'un tracé de contour.
 * @param {{ item:object }} props
 */
function ContourProperties({ item }) {
    const { actions } = useApp();
    const update = (changes) => actions.updateContourPath(item.id, changes);

    return (
        <div className="flex flex-col gap-3">
            <NumberField
                label="Épaisseur"
                value={item.strokeWidth}
                min={1}
                max={20}
                onChange={(v) => update({ strokeWidth: v })}
                unit="px"
            />
            <SliderField
                label="Opacité remplissage"
                value={item.fillOpacity ?? 0}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => update({ fillOpacity: v })}
            />
            <p className="text-[10px] text-slate-400">
                {item.points.length} point{item.points.length > 1 ? "s" : ""}
                {item.closed ? " · fermé" : " · en cours"}
            </p>
        </div>
    );
}

ContourProperties.propTypes = { item: PropTypes.object.isRequired };

// ── Panneau principal ────────────────────────────────────────────────────────

/**
 * Panneau de propriétés flottant — affiché quand un élément est sélectionné.
 */
export function PropertiesPanel() {
    const { actions } = useApp();
    const { item, type, symbol } = useSelectedItem();

    if (!item) return null;

    const handleDelete = () => {
        if (type === "legend") actions.removeLegendItem(item.id);
        if (type === "contour") actions.removeContourPath(item.id);
        actions.selectItem(null);
    };

    const handleDuplicate = () => {
        if (type === "legend") actions.duplicateLegendItem(item.id);
    };

    return (
        <aside
            className="absolute top-4 right-4 z-20 w-56 bg-white rounded-2xl shadow-xl
                       border border-slate-200 flex flex-col overflow-hidden"
            aria-label="Propriétés de l'élément"
        >
            {/* En-tête */}
            <div
                className="flex items-center justify-between px-4 py-3
                           border-b border-slate-100 shrink-0"
            >
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                        {symbol?.label ?? "Élément"}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                        {type}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => actions.selectItem(null)}
                    aria-label="Fermer le panneau"
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full
                               text-slate-400 hover:bg-slate-100 hover:text-slate-600
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                    ✕
                </button>
            </div>

            {/* Corps */}
            <div className="px-4 py-3 flex flex-col gap-3 overflow-y-auto max-h-[70vh]">
                {type === "legend" && <LegendItemProperties item={item} />}
                {type === "contour" && <ContourProperties item={item} />}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2 shrink-0">
                {type === "legend" && (
                    <ActionButton
                        label="Dupliquer"
                        onClick={handleDuplicate}
                        variant="secondary"
                    />
                )}
                <ActionButton
                    label="Supprimer"
                    onClick={handleDelete}
                    variant="danger"
                />
            </div>
        </aside>
    );
}
