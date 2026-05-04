/**
 * @fileoverview Liste des projets sauvegardés
 * Utilisé sur l'écran d'accueil pour reprendre un projet existant.
 */
import { useState } from "react";
import PropTypes from "prop-types";

/**
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
 * @param {{ project:object, onLoad:Function, onDelete:Function }} props
 */
function ProjectItem({ project, onLoad, onDelete }) {
    const [loading, setLoading] = useState(false);

    const handleLoad = async () => {
        setLoading(true);
        await onLoad(project.id);
        setLoading(false);
    };

    return (
        <li
            className="flex items-center gap-3 bg-white border border-slate-200
                   rounded-xl px-4 py-3 hover:border-blue-300 hover:shadow-sm
                   transition-all"
        >
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                    {project.name}
                </p>
                {project.schoolName && (
                    <p className="text-xs text-slate-500 truncate">
                        {project.schoolName}
                    </p>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">
                    {project.fileName && (
                        <span className="mr-2">🗺 {project.fileName}</span>
                    )}
                    {formatDate(project.savedAt)}
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={handleLoad}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                     font-medium bg-blue-500 text-white hover:bg-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus-visible:ring-2
                     focus-visible:ring-blue-400 transition-colors"
                >
                    {loading ? "…" : "▶ Ouvrir"}
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    aria-label={`Supprimer ${project.name}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-xs
                     text-red-400 hover:bg-red-50 hover:text-red-600
                     focus:outline-none focus-visible:ring-2
                     focus-visible:ring-red-400 transition-colors"
                >
                    ✕
                </button>
            </div>
        </li>
    );
}

ProjectItem.propTypes = {
    project: PropTypes.object.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

/**
 * Liste des projets sauvegardés avec feedback d'erreur
 * @param {{ projects:Array, onLoad:Function, onDelete:Function }} props
 */
export function SavedProjectsList({ projects, onLoad, onDelete }) {
    const [error, setError] = useState(null);

    if (projects.length === 0) return null;

    const handleLoad = async (id) => {
        setError(null);
        const result = await onLoad(id);
        if (!result?.success) {
            setError(result?.error ?? "Erreur lors du chargement");
        }
        return result;
    };

    return (
        <div className="w-full max-w-xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <span>📁</span> Reprendre un projet
            </h2>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl bg-red-50 border border-red-200
                                     px-4 py-3 text-sm text-red-700"
                >
                    ⚠️ {error}
                </div>
            )}

            <ul className="flex flex-col gap-2">
                {projects.map((p) => (
                    <ProjectItem
                        key={p.id}
                        project={p}
                        onLoad={handleLoad}
                        onDelete={onDelete}
                    />
                ))}
            </ul>
        </div>
    );
}

SavedProjectsList.propTypes = {
    projects: PropTypes.array.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};
