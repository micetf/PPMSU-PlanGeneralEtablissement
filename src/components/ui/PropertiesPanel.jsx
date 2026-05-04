/**
 * @fileoverview Panneau de propriétés de l'élément sélectionné
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useSelectedItem } from "../../hooks/useSelectedItem";
import { ELEMENT_TYPES } from "../../constants/ppmsLegend";
import { NumberField, TextField, SliderField } from "./PropertiesField";

/**
 * Bouton d'action
 */
function ActionButton({ label, onClick, variant }) {
    const base =
        "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors \
                focus:outline-none focus-visible:ring-2";
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
 * Contrôle taille avec ratio verrouillé
 * @param {{ item:object, onChange:Function }} props
 */
function SizeControl({ item, onChange }) {
    const [locked, setLocked] = useState(true);
    const ratio = item.height > 0 ? item.width / item.height : 1;

    const handleWidth = (w) => {
        onChange({
            width: w,
            height: locked ? Math.round(w / ratio) : item.height,
        });
    };

    const handleHeight = (h) => {
        onChange({
            height: h,
            width: locked ? Math.round(h * ratio) : item.width,
        });
    };

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    Taille
                </span>
                {/* Bouton verrou ratio */}
                <button
                    type="button"
                    onClick={() => setLocked((v) => !v)}
                    title={
                        locked
                            ? "Ratio verrouillé — cliquer pour déverrouiller"
                            : "Ratio libre — cliquer pour verrouiller"
                    }
                    className={[
                        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
                        "focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400",
                        locked
                            ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                            : "text-slate-400 bg-slate-100 hover:bg-slate-200",
                    ].join(" ")}
                    aria-pressed={locked}
                    aria-label={
                        locked
                            ? "Déverrouiller le ratio"
                            : "Verrouiller le ratio"
                    }
                >
                    {locked ? "🔒" : "🔓"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <NumberField
                    label="L"
                    value={item.width}
                    min={16}
                    max={800}
                    onChange={handleWidth}
                    unit="px"
                />
                <NumberField
                    label="H"
                    value={item.height}
                    min={16}
                    max={800}
                    onChange={handleHeight}
                    unit="px"
                />
            </div>
        </div>
    );
}

SizeControl.propTypes = {
    item: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

/**
 * Contrôle rotation — slider + champ numérique
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

            {/* Slider 0–360 */}
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

            {/* Boutons de rotation rapide */}
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

/**
 * Propriétés d'un élément de légende
 */
function LegendItemProperties({ item, symbol }) {
    const { actions } = useApp();
    const update = (changes) => actions.updateLegendItem(item.id, changes);

    return (
        <div className="flex flex-col gap-4">
            {/* Étiquette */}
            <TextField
                label="Étiquette"
                value={item.label ?? ""}
                placeholder={symbol?.label ?? ""}
                onChange={(v) => update({ label: v })}
            />

            {/* Taille avec ratio verrouillé */}
            <SizeControl item={item} onChange={update} />

            {/* Rotation */}
            <RotationControl
                value={item.rotation}
                onChange={(v) => update({ rotation: v })}
            />

            {/* Opacité */}
            <SliderField
                label="Opacité"
                value={item.opacity}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => update({ opacity: v })}
            />

            {/* Affichage étiquette */}
            {item.type !== ELEMENT_TYPES.TEXTE && (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={item.labelVisible}
                        onChange={(e) =>
                            update({ labelVisible: e.target.checked })
                        }
                        className="rounded accent-blue-500"
                    />
                    <span className="text-xs text-slate-600">
                        Afficher l'étiquette
                    </span>
                </label>
            )}
        </div>
    );
}

LegendItemProperties.propTypes = {
    item: PropTypes.object.isRequired,
    symbol: PropTypes.object,
};

LegendItemProperties.defaultProps = { symbol: null };

/**
 * Propriétés d'un tracé de contour
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

/**
 * Panneau principal
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
                {type === "legend" && (
                    <LegendItemProperties item={item} symbol={symbol} />
                )}
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
