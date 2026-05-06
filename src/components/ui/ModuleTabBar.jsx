/**
 * @fileoverview Barre de navigation inter-modules — reste dans le projet courant.
 * Remplace les boutons "← Accueil" éparpillés dans chaque module.
 */
import { useApp } from "../../hooks/useApp";

const MODULES = [
    { key: "planGeneral", label: "Plan Général" },
    { key: "planNiveaux", label: "Plans des Niveaux" },
    { key: "coupuresFluides", label: "Coupures de Fluides" },
];

export function ModuleTabBar() {
    const { state, actions } = useApp();
    const { moduleActif, isDirty } = state.ui;

    const handleProjects = () => {
        if (
            isDirty &&
            !window.confirm(
                "Des modifications non sauvegardées seront perdues. Revenir aux projets ?"
            )
        )
            return;
        actions.setModule(null);
    };

    const handleTab = (key) => {
        if (key === moduleActif) return;
        actions.setModule(key);
    };

    return (
        <nav
            className="flex items-center gap-1 px-3 h-10 bg-white border-b border-slate-200
                       shrink-0 z-10"
            aria-label="Navigation modules"
        >
            {/* Retour projets */}
            <button
                type="button"
                onClick={handleProjects}
                className="flex items-center gap-1 text-xs text-slate-400
                           hover:text-slate-600 transition-colors shrink-0
                           focus:outline-none focus-visible:ring-2
                           focus-visible:ring-slate-400 rounded px-2 py-1 mr-2"
                aria-label="Revenir à la liste des projets"
            >
                <span aria-hidden="true">←</span>
                <span>Projets</span>
            </button>

            <span className="text-slate-200 select-none shrink-0 mr-2" aria-hidden="true">|</span>

            {/* Onglets modules */}
            {MODULES.map(({ key, label }) => {
                const isActive = moduleActif === key;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => handleTab(key)}
                        className={[
                            "px-3 py-1 text-xs rounded-md transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                            isActive
                                ? "bg-blue-50 text-blue-700 font-semibold"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
                        ].join(" ")}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {label}
                    </button>
                );
            })}
        </nav>
    );
}
