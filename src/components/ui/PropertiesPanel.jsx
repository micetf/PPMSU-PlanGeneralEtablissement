/**
 * @fileoverview Panneau de propriétés de l'élément sélectionné (module-aware)
 */
import { useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useSelectedItem } from "../../hooks/useSelectedItem";
import { NumberField, TextField, SliderField } from "./PropertiesField";
import { ELEMENT_TYPES } from "../../constants/ppmsLegend";
import { NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

// ── Bouton d'action ──────────────────────────────────────────────────────────

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

// ── Contrôles communs ────────────────────────────────────────────────────────

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
        <SliderField
            label="Taille"
            value={item.width}
            min={30}
            max={100}
            step={1}
            unit=" px"
            onChange={(w) =>
                onChange({ width: w, height: Math.round(w / ratio) })
            }
        />
    );
}

SizeControl.propTypes = {
    item: PropTypes.object.isRequired,
    isTexte: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
};
SizeControl.defaultProps = { isTexte: false };

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

// ── Plan Général — Légende ────────────────────────────────────────────────────

function LegendItemProperties({ item, symbol, onUpdate }) {
    const update = (changes) => onUpdate(item.id, changes);
    const isTexte = item.type === ELEMENT_TYPES.TEXTE;
    const isPentagon = symbol?.shape === "pentagon";

    return (
        <div className="flex flex-col gap-4">
            {isTexte && (
                <TextField
                    label="Texte affiché"
                    value={item.label ?? ""}
                    placeholder="Saisir une annotation…"
                    onChange={(v) => update({ label: v })}
                />
            )}
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
                value={item.rotation ?? 0}
                onChange={(v) => update({ rotation: v })}
            />
            <SliderField
                label="Opacité"
                value={item.opacity ?? 1}
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
    symbol: PropTypes.object,
    onUpdate: PropTypes.func.isRequired,
};
LegendItemProperties.defaultProps = { symbol: null };

function ContourProperties({ item, onUpdate }) {
    const update = (changes) => onUpdate(item.id, changes);
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

ContourProperties.propTypes = {
    item: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

// ── Plan des Niveaux — Zone ZMS ──────────────────────────────────────────────

function NiveauZMSProperties({ item, onUpdate }) {
    const update = (changes) => onUpdate(item.id, changes);
    return (
        <div className="flex flex-col gap-3">
            <TextField
                label="Nom de la zone"
                value={item.nom ?? "Zone de mise en sûreté"}
                placeholder="ex : Zone A - RDC"
                onChange={(v) => update({ nom: v })}
            />
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    Couleur du périmètre
                </span>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={item.color ?? "#43729D"}
                        onChange={(e) =>
                            update({ color: e.target.value, fillColor: e.target.value })
                        }
                        className="w-8 h-8 rounded cursor-pointer border border-slate-200"
                        aria-label="Couleur du périmètre"
                    />
                    <span className="text-xs text-slate-500 font-mono">
                        {item.color ?? "#43729D"}
                    </span>
                </div>
            </div>
            <NumberField
                label="Épaisseur du périmètre"
                value={item.strokeWidth ?? 3}
                min={1}
                max={20}
                onChange={(v) => update({ strokeWidth: v })}
                unit="px"
            />
            <SliderField
                label="Opacité remplissage"
                value={item.fillOpacity ?? 0.25}
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

NiveauZMSProperties.propTypes = {
    item: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

// ── Plan des Niveaux — Photo associée ────────────────────────────────────────

function PhotoAssociee({ photoId, activeNiveau, onUpdate, onRemove }) {
    const fileInputRef = useRef(null);
    const { actions } = useApp();
    const photo = activeNiveau?.photos.find((p) => p.id === photoId);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const newPhotoId = await actions.addNiveauPhoto(file);
        onUpdate({ photoId: newPhotoId });
        e.target.value = "";
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                Photo associée
            </span>
            {photo ? (
                <div className="flex flex-col gap-1">
                    <img
                        src={photo.src}
                        alt={photo.fileName}
                        className="w-full rounded-lg object-cover max-h-28 border border-slate-200"
                    />
                    <p className="text-[10px] text-slate-400 truncate">
                        {photo.fileName}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            actions.removeNiveauPhoto(photoId);
                            onRemove();
                        }}
                        className="text-[10px] text-red-400 hover:text-red-600 text-left"
                    >
                        Supprimer la photo
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 rounded-lg border border-dashed border-slate-300
                               text-[10px] text-slate-400 hover:border-blue-300 hover:text-blue-500
                               transition-colors focus:outline-none"
                >
                    📷 Associer une photo
                </button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}

PhotoAssociee.propTypes = {
    photoId: PropTypes.string,
    activeNiveau: PropTypes.object,
    onUpdate: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};
PhotoAssociee.defaultProps = { photoId: null, activeNiveau: null };

// ── Plan des Niveaux — Panneaux ───────────────────────────────────────────────

function FlecheProperties({ item, onUpdate, activeNiveau }) {
    const update = (changes) => onUpdate(item.id, changes);
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide shrink-0">
                    Numéro
                </span>
                <span className="text-sm font-bold text-slate-700">
                    {item.numero ?? "—"}
                </span>
            </div>
            <SliderField
                label="Opacité"
                value={item.opacity ?? 1}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => update({ opacity: v })}
            />
            <PhotoAssociee
                photoId={item.photoId}
                activeNiveau={activeNiveau}
                onUpdate={update}
                onRemove={() => update({ photoId: null })}
            />
        </div>
    );
}

FlecheProperties.propTypes = {
    item: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    activeNiveau: PropTypes.object,
};
FlecheProperties.defaultProps = { activeNiveau: null };

function MarqueurPhotoProperties({ item, onUpdate, activeNiveau }) {
    const update = (changes) => onUpdate(item.id, changes);
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide shrink-0">
                    Numéro
                </span>
                <span className="text-sm font-bold text-slate-700">
                    {item.numero ?? "—"}
                </span>
            </div>
            <TextField
                label="Étiquette"
                value={item.label ?? ""}
                placeholder="ex : Escalier principal"
                onChange={(v) => update({ label: v })}
            />
            <SliderField
                label="Opacité"
                value={item.opacity ?? 1}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => update({ opacity: v })}
            />
            <PhotoAssociee
                photoId={item.photoId}
                activeNiveau={activeNiveau}
                onUpdate={update}
                onRemove={() => update({ photoId: null })}
            />
        </div>
    );
}

MarqueurPhotoProperties.propTypes = {
    item: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    activeNiveau: PropTypes.object,
};
MarqueurPhotoProperties.defaultProps = { activeNiveau: null };

function NiveauTexteProperties({ item, onUpdate }) {
    const update = (changes) => onUpdate(item.id, changes);
    return (
        <div className="flex flex-col gap-4">
            <TextField
                label="Texte affiché"
                value={item.label ?? ""}
                placeholder="Saisir une annotation…"
                onChange={(v) => update({ label: v })}
            />
            <NumberField
                label="Taille de police"
                value={item.width ?? 14}
                min={10}
                max={96}
                step={2}
                unit="px"
                onChange={(w) => update({ width: w, height: w })}
            />
            <SliderField
                label="Opacité"
                value={item.opacity ?? 1}
                min={0.1}
                max={1}
                step={0.05}
                onChange={(v) => update({ opacity: v })}
            />
        </div>
    );
}

NiveauTexteProperties.propTypes = {
    item: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

// ── Panneau principal ────────────────────────────────────────────────────────

export function PropertiesPanel() {
    const { state, actions } = useApp();
    const { item, type, symbol } = useSelectedItem();
    const { moduleActif } = state.ui;

    if (!item) return null;

    const isNiveaux = moduleActif === "planNiveaux";

    const activeNiveau = isNiveaux
        ? state.planNiveaux.niveaux.find(
              (n) => n.id === state.planNiveaux.activeNiveauId
          )
        : null;

    const handleUpdateLegend = (id, changes) =>
        isNiveaux
            ? actions.updateNiveauLegendItem(id, changes)
            : actions.updateLegendItem(id, changes);

    const handleUpdateContour = (id, changes) =>
        isNiveaux
            ? actions.updateNiveauContourPath(id, changes)
            : actions.updateContourPath(id, changes);

    const handleDelete = () => {
        if (type === "legend") {
            isNiveaux
                ? actions.removeNiveauLegendItem(item.id)
                : actions.removeLegendItem(item.id);
        }
        if (type === "contour") {
            isNiveaux
                ? actions.removeNiveauContourPath(item.id)
                : actions.removeContourPath(item.id);
        }
        actions.selectItem(null);
    };

    const handleDuplicate = () => {
        if (type !== "legend") return;
        isNiveaux
            ? actions.duplicateNiveauLegendItem(item.id)
            : actions.duplicateLegendItem(item.id);
    };

    const panelLabel = isNiveaux
        ? item.type === NIVEAUX_ELEMENT_TYPES.FLECHE
            ? `Flèche n°${item.numero ?? ""}`
            : item.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO
              ? `Photo n°${item.numero ?? ""}`
              : symbol?.label ?? "Élément"
        : symbol?.label ?? "Élément";

    const canDuplicate =
        type === "legend" && item.type !== NIVEAUX_ELEMENT_TYPES.FLECHE;

    return (
        <aside
            className="absolute top-4 right-4 z-20 w-56 bg-white rounded-2xl shadow-xl
                       border border-slate-200 flex flex-col overflow-hidden"
            aria-label="Propriétés de l'élément"
        >
            {/* En-tête */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">
                        {panelLabel}
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
                {/* Plan Général */}
                {!isNiveaux && type === "legend" && (
                    <LegendItemProperties
                        item={item}
                        symbol={symbol}
                        onUpdate={handleUpdateLegend}
                    />
                )}
                {!isNiveaux && type === "contour" && (
                    <ContourProperties item={item} onUpdate={handleUpdateContour} />
                )}

                {/* Plan des Niveaux */}
                {isNiveaux && type === "legend" &&
                    item.type === NIVEAUX_ELEMENT_TYPES.FLECHE && (
                        <FlecheProperties
                            item={item}
                            onUpdate={handleUpdateLegend}
                            activeNiveau={activeNiveau}
                        />
                    )}
                {isNiveaux && type === "legend" &&
                    item.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO && (
                        <MarqueurPhotoProperties
                            item={item}
                            onUpdate={handleUpdateLegend}
                            activeNiveau={activeNiveau}
                        />
                    )}
                {isNiveaux && type === "legend" &&
                    item.type === NIVEAUX_ELEMENT_TYPES.TEXTE && (
                        <NiveauTexteProperties
                            item={item}
                            onUpdate={handleUpdateLegend}
                        />
                    )}
                {isNiveaux && type === "contour" && (
                    <NiveauZMSProperties item={item} onUpdate={handleUpdateContour} />
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-3 border-t border-slate-100 flex gap-2 shrink-0">
                {canDuplicate && (
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
