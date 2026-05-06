/**
 * @fileoverview Écran de configuration du module Plan des Niveaux.
 * Affiché quand aucun niveau n'existe ou que le niveau actif n'a pas d'image.
 */
import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { ModuleTabBar } from "./ModuleTabBar";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function AddNiveauForm({ onAdd }) {
    const [nom, setNom] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nom.trim()) return;
        onAdd(nom.trim());
        setNom("");
    };
    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du niveau (ex : RDC, Bâtiment A…)"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                autoFocus
            />
            <button
                type="submit"
                disabled={!nom.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white
                           hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors focus:outline-none focus-visible:ring-2
                           focus-visible:ring-blue-400"
            >
                Créer
            </button>
        </form>
    );
}

AddNiveauForm.propTypes = { onAdd: PropTypes.func.isRequired };

function NiveauDropZone({ onFile }) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = useCallback(
        (file) => {
            if (!file) return;
            setError(null);
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError("Format non supporté. Utilisez JPG, PNG ou WebP.");
                return;
            }
            if (file.size > MAX_SIZE_BYTES) {
                setError("Image trop lourde. Maximum : 10 Mo.");
                return;
            }
            onFile(file);
        },
        [onFile]
    );

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-xl">
            {error && (
                <div
                    role="alert"
                    className="flex items-center justify-between gap-3 rounded-xl bg-red-50
                               border border-red-200 px-4 py-3 text-sm text-red-700 w-full"
                >
                    <span>⚠️ {error}</span>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="shrink-0 text-red-400 hover:text-red-600 focus:outline-none"
                    >
                        ✕
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFile(e.dataTransfer.files?.[0]);
                }}
                className={[
                    "w-full flex flex-col items-center justify-center gap-4",
                    "rounded-2xl border-2 border-dashed px-8 py-12 cursor-pointer",
                    "transition-colors duration-200 focus:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    isDragging
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50",
                ].join(" ")}
                aria-label="Zone de dépôt — cliquer ou glisser un plan d'intervention"
            >
                <div
                    className={[
                        "w-14 h-14 rounded-full flex items-center justify-center text-2xl",
                        isDragging ? "bg-blue-100" : "bg-slate-100",
                    ].join(" ")}
                >
                    🗺️
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold text-slate-700">
                        {isDragging
                            ? "Déposez le plan ici"
                            : "Charger le plan d'intervention"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Glissez-déposez ou cliquez pour charger le plan du niveau
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG ou WebP — 10 Mo maximum
                    </p>
                </div>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = "";
                }}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}

NiveauDropZone.propTypes = { onFile: PropTypes.func.isRequired };

export function PlanNiveauxSetup() {
    const { state, actions } = useApp();
    const { niveaux, activeNiveauId } = state.planNiveaux;
    const activeNiveau = niveaux.find((n) => n.id === activeNiveauId);

    if (niveaux.length === 0) {
        return (
            <div className="flex flex-col h-screen overflow-hidden pt-10">
                <ModuleTabBar />
                <div
                    className="flex flex-col items-center flex-1 overflow-y-auto
                                gap-6 p-6 bg-slate-100"
                >
                    <header className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800">
                            Plans des Niveaux
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Annotez les plans d'intervention par étage ou bâtiment
                        </p>
                    </header>

                    <div
                        className="w-full max-w-xl bg-white rounded-2xl border border-slate-200
                                    p-6 flex flex-col gap-4"
                    >
                        <h2 className="text-base font-semibold text-slate-700">
                            Créez votre premier niveau
                        </h2>
                        <p className="text-sm text-slate-500">
                            Donnez un nom à ce niveau (RDC, 1er étage, Bâtiment A…), puis
                            chargez son plan d'intervention.
                        </p>
                        <AddNiveauForm onAdd={(nom) => actions.addNiveau(nom)} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden pt-10">
            <ModuleTabBar />
            <div
                className="flex flex-col items-center flex-1 overflow-y-auto
                            gap-6 p-6 bg-slate-100"
            >
            <header className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    Plans des Niveaux
                </h1>
                {activeNiveau && (
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                        Niveau : {activeNiveau.nom}
                    </p>
                )}
            </header>

            <NiveauDropZone onFile={(file) => actions.loadNiveauImage(file)} />

            <div
                className="w-full max-w-xl bg-white rounded-2xl border border-slate-200
                            p-6 flex flex-col gap-4"
            >
                <h2 className="text-base font-semibold text-slate-700">Niveaux</h2>

                <ul className="flex flex-col gap-1.5">
                    {niveaux.map((n, i) => (
                        <li
                            key={n.id}
                            className={[
                                "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                                n.id === activeNiveauId
                                    ? "bg-blue-50 border border-blue-200"
                                    : "hover:bg-slate-50 border border-transparent",
                            ].join(" ")}
                            onClick={() => actions.setActiveNiveau(n.id)}
                        >
                            <span
                                className={[
                                    "w-6 h-6 flex items-center justify-center rounded-full",
                                    "text-[10px] font-bold shrink-0",
                                    n.id === activeNiveauId
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-200 text-slate-600",
                                ].join(" ")}
                            >
                                {i + 1}
                            </span>
                            <span className="flex-1 text-sm text-slate-700 truncate">
                                {n.nom}
                            </span>
                            {n.image?.src ? (
                                <span className="text-xs text-green-500 shrink-0">
                                    ✓ Plan chargé
                                </span>
                            ) : (
                                <span className="text-xs text-amber-500 shrink-0">
                                    Sans image
                                </span>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-400 mb-2">
                        Ajouter un niveau
                    </p>
                    <AddNiveauForm onAdd={(nom) => actions.addNiveau(nom)} />
                </div>
            </div>
            </div>
        </div>
    );
}
