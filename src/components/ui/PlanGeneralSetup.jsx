/**
 * @fileoverview Écran de configuration du module Plan Général
 *
 * Remplace l'ancien HomeScreen mono-fonctionnel.
 * Affiché quand moduleActif === 'planGeneral' et qu'aucune image n'est chargée.
 * Contient : retour accueil, DropZone, import de projet, projets sauvegardés.
 */
import { useApp } from "../../hooks/useApp";
import { useProjectManager } from "../../hooks/useProjectManager";
import { DropZone } from "./DropZone";
import { SavedProjectsList } from "./SavedProjectsList";
import { ImportButton } from "./ImportButton";

/**
 * Bouton de retour vers l'accueil (sans confirmation — aucun travail en cours)
 */
function BoutonRetour() {
    const { actions } = useApp();
    return (
        <button
            type="button"
            onClick={() => actions.setModule(null)}
            className="flex items-center gap-1.5 text-sm text-slate-400
                       hover:text-slate-600 transition-colors
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-slate-400 rounded px-1"
            aria-label="Retourner à l'accueil"
        >
            <span aria-hidden="true">←</span>
            Accueil
        </button>
    );
}

/**
 * Écran d'accueil du module Plan Général de l'École
 */
export function PlanGeneralSetup() {
    const { projects, handleLoad, handleDelete } = useProjectManager();

    return (
        <div
            className="flex flex-col items-center min-h-screen pt-10
                        gap-6 p-6 bg-slate-100"
        >
            {/* Navigation retour */}
            <div className="w-full max-w-xl">
                <BoutonRetour />
            </div>

            {/* En-tête du module */}
            <header className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    Plan Général de l'École
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Outil de légendage conforme au fascicule 2 Eduscol
                </p>
            </header>

            {/* Upload d'une nouvelle image */}
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

            {/* Projets sauvegardés */}
            <SavedProjectsList
                projects={projects}
                onLoad={handleLoad}
                onDelete={handleDelete}
            />
        </div>
    );
}
