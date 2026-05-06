/**
 * @fileoverview Écran d'accueil — sélection et création de projets
 *
 * Un projet = un établissement scolaire.
 * Depuis cet écran, l'utilisateur crée ou ouvre un projet, puis accède
 * aux trois modules (Plan Général, Plans des Niveaux, Coupures de Fluides)
 * via la barre de navigation inter-modules.
 */
import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { useProjectManager } from "../../hooks/useProjectManager";
import { ProjectList } from "./ProjectList";
import { ImportButton } from "./ImportButton";

export function HomeScreen() {
    const { state, actions } = useApp();
    const { projects, handleLoad, handleDelete, refreshProjects } =
        useProjectManager();
    const [schoolName, setSchoolName] = useState("");

    const handleNewProject = (e) => {
        e.preventDefault();
        const trimmed = schoolName.trim();
        if (!trimmed) return;
        actions.resetProject();
        actions.setProjectInfo({ schoolName: trimmed, name: trimmed });
        actions.setModule("planGeneral");
    };

    const handleOpenProject = async (id) => {
        const result = await handleLoad(id);
        if (result?.success) actions.setModule("planGeneral");
    };

    const handleImportSuccess = () => {
        refreshProjects();
        actions.setModule("planGeneral");
    };

    return (
        <div
            className="min-h-screen pt-10 bg-slate-50 flex flex-col
                        items-center px-4 py-12 gap-8"
        >
            {/* En-tête */}
            <header className="text-center max-w-lg">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    PPMSU — Atelier Visuel
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Produisez les illustrations de votre Plan Particulier de
                    Mise en Sûreté Unifié, conformément au
                    fascicule&nbsp;2 Eduscol.
                </p>
            </header>

            {/* Nouveau projet */}
            <section
                className="w-full max-w-xl bg-white rounded-2xl border border-slate-200
                            p-6 flex flex-col gap-4 shadow-sm"
            >
                <div>
                    <h2 className="text-base font-semibold text-slate-700">
                        Créer un nouveau projet
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Un projet regroupe le plan général, les plans des
                        niveaux et les coupures de fluides d'un même
                        établissement.
                    </p>
                </div>
                <form onSubmit={handleNewProject} className="flex gap-2">
                    <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Nom de l'école…"
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!schoolName.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white
                                   hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed
                                   transition-colors focus:outline-none focus-visible:ring-2
                                   focus-visible:ring-blue-400"
                    >
                        Créer
                    </button>
                </form>
            </section>

            {/* Import .ppmsu */}
            <ImportButton variant="home" onSuccess={handleImportSuccess} />

            {/* Projets existants */}
            {projects.length > 0 && (
                <>
                    <div className="flex items-center gap-4 w-full max-w-xl">
                        <hr className="flex-1 border-slate-300" />
                        <span className="text-xs text-slate-400 shrink-0">
                            projets enregistrés
                        </span>
                        <hr className="flex-1 border-slate-300" />
                    </div>
                    <div className="w-full max-w-xl">
                        <ProjectList
                            projects={projects}
                            currentProjectId={state.project.id}
                            onLoad={handleOpenProject}
                            onDelete={handleDelete}
                            variant="home"
                            emptyMessage=""
                        />
                    </div>
                </>
            )}

            <footer className="text-xs text-slate-300">v0.1.0 — micetf.fr</footer>
        </div>
    );
}
