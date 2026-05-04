/**
 * @fileoverview Écran d'accueil
 */
import { useProjectManager } from "../../hooks/useProjectManager";
import { DropZone } from "./DropZone";
import { SavedProjectsList } from "./SavedProjectsList";
import { ImportButton } from "./ImportButton";

export function HomeScreen() {
    const { projects, handleLoad, handleDelete } = useProjectManager();

    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen
                    gap-8 p-6 bg-slate-100"
        >
            {/* En-tête */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    PPMS — Plan de l'établissement
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Outil de légendage conforme au fascicule 2 Eduscol
                </p>
            </div>

            {/* Nouveau projet */}
            <DropZone />

            {/* Import d'un projet existant */}
            <ImportButton variant="home" />

            {/* Séparateur conditionnel */}
            {projects.length > 0 && (
                <div className="flex items-center gap-4 w-full max-w-xl">
                    <hr className="flex-1 border-slate-300" />
                    <span className="text-xs text-slate-400 shrink-0">
                        projets locaux
                    </span>
                    <hr className="flex-1 border-slate-300" />
                </div>
            )}

            {/* Projets sauvegardés localement */}
            <SavedProjectsList
                projects={projects}
                onLoad={handleLoad}
                onDelete={handleDelete}
            />
        </div>
    );
}
