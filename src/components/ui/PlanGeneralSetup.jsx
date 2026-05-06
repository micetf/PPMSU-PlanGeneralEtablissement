/**
 * @fileoverview Écran de configuration du module Plan Général
 * Affiché quand moduleActif === 'planGeneral' et qu'aucune image n'est chargée.
 */
import { ModuleTabBar } from "./ModuleTabBar";
import { DropZone } from "./DropZone";

export function PlanGeneralSetup() {
    return (
        <div className="flex flex-col h-screen overflow-hidden pt-10">
            <ModuleTabBar />
            <div
                className="flex flex-col items-center flex-1 overflow-y-auto
                            gap-6 p-6 bg-slate-100"
            >
                <header className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Plan Général de l'École
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Chargez une vue aérienne de l'établissement pour commencer
                        à légender votre plan.
                    </p>
                </header>

                <DropZone />
            </div>
        </div>
    );
}
