/**
 * @fileoverview Modale de gestion des projets — liste, chargement, suppression
 */
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

/**
 * Formate une date ISO en affichage lisible
 * @param {string} iso
 * @returns {string}
 */
function formatDate(iso) {
    if (!iso) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(iso));
}

/**
 * Ligne d'un projet dans la liste
 * @param {{ project:object, isCurrent:boolean, onLoad:Function, onDelete:Function }} props
 */
function ProjectRow({ project, isCurrent, onLoad, onDelete }) {
    return (
        <li
            className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                isCurrent
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-slate-50",
            ].join(" ")}
        >
            {/* Infos */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                    {project.name}
                    {isCurrent && (
                        <span className="ml-2 text-[10px] text-blue-500 font-normal">
                            (en cours)
                        </span>
                    )}
                </p>
                {project.schoolName && (
                    <p className="text-xs text-slate-500 truncate">
                        {project.schoolName}
                    </p>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">
                    Sauvegardé le {formatDate(project.savedAt)}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 shrink-0">
                {!isCurrent && (
                    <button
                        type="button"
                        onClick={() => onLoad(project.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-500 text-white
                       hover:bg-blue-600 focus:outline-none focus-visible:ring-2
                       focus-visible:ring-blue-400 transition-colors"
                    >
                        Ouvrir
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    aria-label={`Supprimer ${project.name}`}
                    className="px-2 py-1 rounded-lg text-xs text-red-400 hover:bg-red-50
                     hover:text-red-600 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-red-400 transition-colors"
                >
                    ✕
                </button>
            </div>
        </li>
    );
}

ProjectRow.propTypes = {
    project: PropTypes.object.isRequired,
    isCurrent: PropTypes.bool.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

/**
 * Modale de gestion des projets
 * @param {{ onClose:Function, projects:Array, onLoad:Function, onDelete:Function, onNew:Function }} props
 */
export function ProjectModal({ onClose, projects, onLoad, onDelete, onNew }) {
    const { state } = useApp();
    const dialogRef = useRef(null);

    // Fermeture par Échap
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    // Focus trap — focus sur la modale à l'ouverture
    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    const handleLoad = async (id) => {
        const result = await onLoad(id);
        if (result?.success) onClose();
    };

    return (
        /* Fond semi-transparent */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Gestion des projets"
                tabIndex={-1}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4
                   flex flex-col max-h-[80vh] focus:outline-none"
            >
                {/* En-tête */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-bold text-slate-800">
                        Mes projets
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="w-8 h-8 flex items-center justify-center rounded-full
                       text-slate-400 hover:bg-slate-100 hover:text-slate-600
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Liste des projets */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    {projects.length === 0 ? (
                        <p className="text-center text-sm text-slate-400 py-8">
                            Aucun projet sauvegardé
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {projects.map((p) => (
                                <ProjectRow
                                    key={p.id}
                                    project={p}
                                    isCurrent={p.id === state.project.id}
                                    onLoad={handleLoad}
                                    onDelete={onDelete}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {/* Pied — nouveau projet */}
                <div className="px-6 py-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={() => {
                            onNew();
                            onClose();
                        }}
                        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-300
                       text-sm text-slate-500 hover:border-blue-300 hover:text-blue-500
                       hover:bg-blue-50 transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                        + Nouveau projet
                    </button>
                </div>
            </div>
        </div>
    );
}

ProjectModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    projects: PropTypes.array.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onNew: PropTypes.func.isRequired,
};
