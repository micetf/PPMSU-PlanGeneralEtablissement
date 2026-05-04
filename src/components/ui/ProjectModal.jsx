/**
 * @fileoverview Modale de gestion des projets
 * Enveloppe légère autour de ProjectList
 */
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { ProjectList } from "./ProjectList";

/**
 * @param {{
 *   onClose: Function,
 *   projects: object[],
 *   onLoad: Function,
 *   onDelete: Function,
 *   onNew: Function
 * }} props
 */
export function ProjectModal({ onClose, projects, onLoad, onDelete, onNew }) {
    const { state } = useApp();
    const dialogRef = useRef(null);

    useEffect(() => {
        dialogRef.current?.focus();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleLoad = async (id) => {
        const result = await onLoad(id);
        if (result?.success) onClose();
        return result;
    };

    return (
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
                <div
                    className="flex items-center justify-between px-6 py-4
                        border-b border-slate-200 shrink-0"
                >
                    <h2 className="text-base font-bold text-slate-800">
                        Mes projets
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fermer"
                        className="w-8 h-8 flex items-center justify-center rounded-full
                       text-slate-400 hover:bg-slate-100 hover:text-slate-600
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-slate-400"
                    >
                        ✕
                    </button>
                </div>

                {/* Liste */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                    <ProjectList
                        projects={projects}
                        currentProjectId={state.project.id}
                        onLoad={handleLoad}
                        onDelete={onDelete}
                        variant="modal"
                    />
                </div>

                {/* Nouveau projet */}
                <div className="px-6 py-4 border-t border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            onNew();
                            onClose();
                        }}
                        className="w-full py-2 rounded-xl border-2 border-dashed
                       border-slate-300 text-sm text-slate-500
                       hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50
                       transition-colors focus:outline-none
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
