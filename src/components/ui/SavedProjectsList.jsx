/**
 * @fileoverview Liste des projets sur l'écran d'accueil
 * Enveloppe légère autour de ProjectList
 */
import PropTypes from "prop-types";
import { ProjectList } from "./ProjectList";

/**
 * @param {{ projects:object[], onLoad:Function, onDelete:Function }} props
 */
export function SavedProjectsList({ projects, onLoad, onDelete }) {
    if (projects.length === 0) return null;

    return (
        <div className="w-full max-w-xl flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <span>📁</span> Reprendre un projet
            </h2>
            <ProjectList
                projects={projects}
                onLoad={onLoad}
                onDelete={onDelete}
                variant="home"
            />
        </div>
    );
}

SavedProjectsList.propTypes = {
    projects: PropTypes.array.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};
