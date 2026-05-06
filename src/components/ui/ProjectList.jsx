/**
 * @fileoverview Liste de projets réutilisable
 * Utilisée par SavedProjectsList (HomeScreen) et ProjectModal (TopBar)
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { formatDate } from "../../utils/formatDate";

/**
 * Un projet dans la liste
 * @param {{
 *   project: object,
 *   isCurrent: boolean,
 *   onLoad: Function,
 *   onDelete: Function,
 *   variant: 'home' | 'modal'
 * }} props
 */
function ProjectItem({ project, isCurrent, onLoad, onDelete, variant }) {
    const [loading, setLoading] = useState(false);

    const handleLoad = async () => {
        setLoading(true);
        await onLoad(project.id);
        setLoading(false);
    };

    return (
        <li
            className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isCurrent
                    ? "bg-blue-50 border border-blue-200"
                    : variant === "home"
                      ? "bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm"
                      : "hover:bg-slate-50",
            ].join(" ")}
        >
            {/* Infos */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                    {project.schoolName || project.name}
                    {isCurrent && (
                        <span className="ml-2 text-[10px] text-blue-500 font-normal">
                            (en cours)
                        </span>
                    )}
                </p>
                {project.name && project.name !== project.schoolName && (
                    <p className="text-xs text-slate-500 truncate">
                        {project.name}
                    </p>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5">
                    {formatDate(project.savedAt)}
                </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {!isCurrent && (
                    <button
                        type="button"
                        onClick={handleLoad}
                        disabled={loading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-blue-500 text-white hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-blue-400 transition-colors"
                    >
                        {loading ? "…" : "▶ Ouvrir"}
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onDelete(project.id)}
                    aria-label={`Supprimer ${project.name}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg
                     text-xs text-red-400 hover:bg-red-50 hover:text-red-600
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
    isCurrent: PropTypes.bool,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(["home", "modal"]),
};

ProjectItem.defaultProps = {
    isCurrent: false,
    variant: "modal",
};

/**
 * Liste de projets avec gestion d'erreur intégrée
 * @param {{
 *   projects: object[],
 *   currentProjectId: string|null,
 *   onLoad: Function,
 *   onDelete: Function,
 *   variant: 'home' | 'modal',
 *   emptyMessage: string,
 * }} props
 */
export function ProjectList({
    projects,
    currentProjectId,
    onLoad,
    onDelete,
    variant,
    emptyMessage,
}) {
    const [error, setError] = useState(null);

    const handleLoad = async (id) => {
        setError(null);
        const result = await onLoad(id);
        if (!result?.success) {
            setError(result?.error ?? "Erreur lors du chargement");
        }
        return result;
    };

    if (projects.length === 0) {
        return (
            <p className="text-center text-sm text-slate-400 py-8">
                {emptyMessage}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-2">
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
                        isCurrent={p.id === currentProjectId}
                        onLoad={handleLoad}
                        onDelete={onDelete}
                        variant={variant}
                    />
                ))}
            </ul>
        </div>
    );
}

ProjectList.propTypes = {
    projects: PropTypes.array.isRequired,
    currentProjectId: PropTypes.string,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    variant: PropTypes.oneOf(["home", "modal"]),
    emptyMessage: PropTypes.string,
};

ProjectList.defaultProps = {
    currentProjectId: null,
    variant: "modal",
    emptyMessage: "Aucun projet sauvegardé",
};
