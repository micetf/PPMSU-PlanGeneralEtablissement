/**
 * @fileoverview Sidebar gauche — liste des niveaux du module Plan des Niveaux.
 * Permet de naviguer entre les niveaux et d'en ajouter ou supprimer.
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

function AddNiveauForm({ onAdd, onCancel }) {
    const [nom, setNom] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nom.trim()) return;
        onAdd(nom.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 px-3 py-2">
            <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du niveau…"
                className="px-2 py-1.5 text-xs rounded-lg border border-slate-300
                           focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                autoFocus
            />
            <div className="flex gap-1.5">
                <button
                    type="submit"
                    disabled={!nom.trim()}
                    className="flex-1 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white
                               hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                    Créer
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-1 rounded-lg text-xs text-slate-500
                               hover:bg-slate-100 focus:outline-none
                               focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                    Annuler
                </button>
            </div>
        </form>
    );
}

AddNiveauForm.propTypes = {
    onAdd: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export function NiveauxList() {
    const { state, actions } = useApp();
    const [showAddForm, setShowAddForm] = useState(false);
    const { niveaux, activeNiveauId } = state.planNiveaux;

    const handleAdd = (nom) => {
        actions.addNiveau(nom);
        setShowAddForm(false);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        actions.removeNiveau(id);
    };

    return (
        <aside
            className="flex flex-col bg-white border-r border-slate-200
                       w-44 shrink-0 overflow-hidden"
            aria-label="Liste des niveaux"
        >
            <div className="px-3 py-3 border-b border-slate-200 shrink-0">
                <h2 className="text-sm font-bold text-slate-700">Niveaux</h2>
            </div>

            <ul className="flex-1 overflow-y-auto py-1" role="listbox">
                {niveaux.map((n, i) => (
                    <li key={n.id} role="option" aria-selected={n.id === activeNiveauId}>
                        <button
                            type="button"
                            onClick={() => actions.setActiveNiveau(n.id)}
                            className={[
                                "w-full flex items-center gap-2 px-3 py-2 text-left",
                                "transition-colors group focus:outline-none",
                                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400",
                                n.id === activeNiveauId
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50",
                            ].join(" ")}
                        >
                            <span
                                className={[
                                    "w-5 h-5 flex items-center justify-center rounded-full",
                                    "text-[10px] font-bold shrink-0",
                                    n.id === activeNiveauId
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-200 text-slate-600",
                                ].join(" ")}
                            >
                                {i + 1}
                            </span>
                            <span className="flex-1 text-xs truncate">{n.nom}</span>
                            {!n.image?.src && (
                                <span
                                    title="Aucun plan chargé"
                                    className="text-amber-400 text-[10px] shrink-0"
                                >
                                    ⚠
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => handleDelete(e, n.id)}
                                title={`Supprimer ${n.nom}`}
                                aria-label={`Supprimer le niveau ${n.nom}`}
                                className={[
                                    "opacity-0 group-hover:opacity-100 shrink-0",
                                    "text-slate-300 hover:text-red-400 text-sm",
                                    "transition-opacity focus:outline-none focus-visible:opacity-100",
                                ].join(" ")}
                            >
                                ✕
                            </button>
                        </button>
                    </li>
                ))}
            </ul>

            {showAddForm ? (
                <div className="shrink-0 border-t border-slate-200">
                    <AddNiveauForm
                        onAdd={handleAdd}
                        onCancel={() => setShowAddForm(false)}
                    />
                </div>
            ) : (
                <div className="shrink-0 border-t border-slate-200 p-2">
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5
                                   rounded-lg text-xs text-slate-400 hover:text-slate-600
                                   hover:bg-slate-50 transition-colors focus:outline-none
                                   focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        + Ajouter un niveau
                    </button>
                </div>
            )}
        </aside>
    );
}
