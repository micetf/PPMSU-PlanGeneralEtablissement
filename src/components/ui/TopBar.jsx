/**
 * @fileoverview Barre de titre — infos projet, sauvegarde, accès aux projets
 */
import { useState } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useProjectManager } from "../../hooks/useProjectManager";
import { ProjectModal } from "./ProjectModal";
import { ConfirmModal } from "./ConfirmModal";
import { exportToPng } from "../../utils/exportCanvas";
import { exportProject } from "../../utils/projectIO";
import { ImportButton } from "./ImportButton";

/**
 * @param {{ isDirty:boolean, isSaving:boolean, saveResult:object|null }} props
 */
function SaveStatus({ isDirty, isSaving, saveResult }) {
    if (isSaving)
        return (
            <span className="text-xs text-slate-400 animate-pulse">
                Sauvegarde…
            </span>
        );
    if (saveResult?.success)
        return <span className="text-xs text-green-500">✓ Sauvegardé</span>;
    if (saveResult?.error)
        return <span className="text-xs text-red-500">⚠ Erreur</span>;
    if (isDirty)
        return <span className="text-xs text-amber-500">● Non sauvegardé</span>;
    return <span className="text-xs text-slate-400">✓ À jour</span>;
}

SaveStatus.propTypes = {
    isDirty: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    saveResult: PropTypes.object,
};

SaveStatus.defaultProps = { saveResult: null };

export function TopBar() {
    const { state, actions } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [showConfirmNew, setShowConfirmNew] = useState(false);
    const {
        projects,
        isSaving,
        saveResult,
        handleSave,
        handleLoad,
        handleDelete,
        handleNew,
    } = useProjectManager();

    const hasImage = Boolean(state.image.src);

    const handleNewClick = () => {
        // Demande confirmation uniquement si des modifications non sauvegardées
        if (state.ui.isDirty) {
            setShowConfirmNew(true);
        } else {
            handleNew();
        }
    };

    return (
        <>
            <header
                className="flex items-center gap-3 px-4 h-12 bg-white border-b
                         border-slate-200 shrink-0 z-10"
            >
                {/* Nom du projet */}
                <input
                    type="text"
                    value={state.project.name}
                    onChange={(e) =>
                        actions.setProjectInfo({ name: e.target.value })
                    }
                    className="font-semibold text-sm text-slate-700 bg-transparent border-none
                     focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-400
                     rounded px-1 py-0.5 min-w-0 max-w-45 truncate"
                    aria-label="Nom du projet"
                    placeholder="Nom du projet"
                />

                {/* École */}
                <input
                    type="text"
                    value={state.project.schoolName}
                    onChange={(e) =>
                        actions.setProjectInfo({ schoolName: e.target.value })
                    }
                    className="text-xs text-slate-400 bg-transparent border-none focus:outline-none
                     focus:bg-slate-50 focus:ring-2 focus:ring-blue-400
                     rounded px-1 py-0.5 min-w-0 max-w-50 truncate"
                    aria-label="Nom de l'école"
                    placeholder="Nom de l'école…"
                />

                <div className="flex-1" />

                <SaveStatus
                    isDirty={state.ui.isDirty}
                    isSaving={isSaving}
                    saveResult={saveResult}
                />

                {/* Bouton Projets */}
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                     text-slate-600 hover:bg-slate-100 transition-colors
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                    📁 Projets
                </button>

                {/* Nouveau projet */}
                {hasImage && (
                    <button
                        type="button"
                        onClick={handleNewClick}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       text-slate-600 hover:bg-slate-100 transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                        ✚ Nouveau
                    </button>
                )}

                {hasImage && (
                    <>
                        {/* Export .ppmsu */}
                        <button
                            type="button"
                            onClick={() => exportProject(state)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         text-slate-600 hover:bg-slate-100 transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                            📤 Exporter
                        </button>

                        {/* Import .ppmsu */}
                        <ImportButton variant="topbar" />
                    </>
                )}

                {/* Sauvegarder */}
                {hasImage && (
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || !state.ui.isDirty}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       font-medium bg-blue-500 text-white hover:bg-blue-600
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                        {isSaving ? "…" : "💾 Sauvegarder"}
                    </button>
                )}

                {/* Export PNG */}
                {hasImage && (
                    <button
                        type="button"
                        onClick={() =>
                            exportToPng(
                                state,
                                `plan-ppms-${state.project.schoolName || state.project.name}.png`
                            )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                       font-medium bg-emerald-500 text-white hover:bg-emerald-600
                       transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                        📥 PNG
                    </button>
                )}
            </header>

            {/* Modale projets */}
            {showModal && (
                <ProjectModal
                    onClose={() => setShowModal(false)}
                    projects={projects}
                    onLoad={handleLoad}
                    onDelete={handleDelete}
                    onNew={handleNewClick}
                />
            )}

            {/* Confirmation nouveau projet */}
            {showConfirmNew && (
                <ConfirmModal
                    title="Nouveau projet"
                    message="Des modifications non sauvegardées seront perdues. Continuer ?"
                    confirmLabel="Nouveau projet"
                    cancelLabel="Annuler"
                    variant="warning"
                    onConfirm={() => {
                        setShowConfirmNew(false);
                        handleNew();
                    }}
                    onCancel={() => setShowConfirmNew(false)}
                />
            )}
        </>
    );
}
