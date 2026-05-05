/**
 * @fileoverview Écran d'accueil — 3 tuiles de sélection de module
 *
 * Point d'entrée de l'application. Présente les trois modules disponibles
 * et redirige vers le module sélectionné via l'action setModule.
 */
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

// ── Icônes SVG inline ─────────────────────────────────────────────────────────

/** Icône vue aérienne / satellite */
function IconSatellite() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

/** Icône plan d'intervention / bâtiment */
function IconPlan() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9M9 3v2" />
            <path d="M14 13h3M14 17h3" />
        </svg>
    );
}

/** Icône vanne / coupure fluide */
function IconFluide() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
            aria-hidden="true"
        >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M8 12h8M12 8v8" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
    );
}

// ── Données des tuiles ────────────────────────────────────────────────────────

/**
 * @typedef {Object} TuileConfig
 * @property {string}      moduleId    - identifiant du module (ACTION SET_MODULE)
 * @property {string}      titre       - titre affiché sur la tuile
 * @property {string}      description - description courte
 * @property {JSX.Element} icone       - composant icône
 * @property {string}      couleurBg   - classe Tailwind fond de l'icône
 * @property {string}      couleurBordure - classe Tailwind bordure du haut
 * @property {string}      couleurBouton  - classe Tailwind du bouton CTA
 * @property {boolean}     disponible  - false = module désactivé
 */

/** @type {TuileConfig[]} */
const TUILES = [
    {
        moduleId: "planGeneral",
        titre: "Plan Général de l'École",
        description:
            "Légendez une vue aérienne de l'établissement selon les recommandations du fascicule 2 Eduscol.",
        icone: <IconSatellite />,
        couleurBg: "bg-sky-50 text-sky-600",
        couleurBordure: "border-t-sky-400",
        couleurBouton:
            "bg-sky-500 hover:bg-sky-600 focus-visible:ring-sky-400 text-white",
        disponible: true,
    },
    {
        moduleId: "planNiveaux",
        titre: "Plans des Niveaux",
        description:
            "Annotez les plans d'intervention par niveau : zones de mise en sûreté, accès, escaliers et photos.",
        icone: <IconPlan />,
        couleurBg: "bg-emerald-50 text-emerald-600",
        couleurBordure: "border-t-emerald-400",
        couleurBouton:
            "bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-400 text-white",
        disponible: true,
    },
    {
        moduleId: "coupuresFluides",
        titre: "Coupures de Fluides",
        description:
            "Annotez les photos des systèmes de coupure d'eau, de gaz et d'électricité de l'établissement.",
        icone: <IconFluide />,
        couleurBg: "bg-amber-50 text-amber-500",
        couleurBordure: "border-t-amber-300",
        couleurBouton:
            "bg-amber-400 hover:bg-amber-500 focus-visible:ring-amber-300 text-white",
        disponible: false,
    },
];

// ── Sous-composant : tuile ────────────────────────────────────────────────────

/**
 * Tuile de sélection d'un module
 * @param {{ tuile: TuileConfig, onSelect: Function }} props
 */
function Tuile({ tuile, onSelect }) {
    const {
        moduleId,
        titre,
        description,
        icone,
        couleurBg,
        couleurBordure,
        couleurBouton,
        disponible,
    } = tuile;

    return (
        <article
            className={`relative flex flex-col gap-5 p-6 bg-white rounded-2xl
                        shadow-sm border border-slate-100 border-t-4 ${couleurBordure}
                        transition-shadow hover:shadow-md
                        ${!disponible ? "opacity-60" : ""}`}
        >
            {/* Badge "Bientôt disponible" */}
            {!disponible && (
                <span
                    className="absolute top-4 right-4 px-2 py-0.5 rounded-full
                                 bg-slate-100 text-slate-400 text-[10px] font-medium
                                 tracking-wide uppercase"
                >
                    Bientôt
                </span>
            )}

            {/* Icône */}
            <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center
                             shrink-0 ${couleurBg}`}
            >
                {icone}
            </div>

            {/* Texte */}
            <div className="flex flex-col gap-1.5 flex-1">
                <h2 className="text-base font-bold text-slate-800 leading-snug">
                    {titre}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>
            </div>

            {/* CTA */}
            <button
                type="button"
                onClick={() => disponible && onSelect(moduleId)}
                disabled={!disponible}
                aria-label={`Ouvrir le module ${titre}`}
                className={`w-full py-2.5 rounded-xl text-sm font-medium
                            transition-colors focus:outline-none focus-visible:ring-2
                            disabled:cursor-not-allowed
                            ${couleurBouton}`}
            >
                {disponible ? "Ouvrir" : "Indisponible"}
            </button>
        </article>
    );
}

Tuile.propTypes = {
    tuile: PropTypes.shape({
        moduleId: PropTypes.string.isRequired,
        titre: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        icone: PropTypes.element.isRequired,
        couleurBg: PropTypes.string.isRequired,
        couleurBordure: PropTypes.string.isRequired,
        couleurBouton: PropTypes.string.isRequired,
        disponible: PropTypes.bool.isRequired,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

// ── Composant principal ───────────────────────────────────────────────────────

/**
 * Écran d'accueil avec les 3 tuiles de sélection de module
 */
export function HomeScreen() {
    const { actions } = useApp();

    return (
        <div
            className="min-h-screen pt-10 bg-slate-50 flex flex-col
                        items-center justify-center px-4 py-12 gap-10"
        >
            {/* En-tête */}
            <header className="text-center max-w-lg">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    PPMSU — Atelier Visuel
                </h1>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    Produisez les illustrations de votre Plan Particulier de
                    Mise en Sûreté Unifié, conformément au fascicule&nbsp;2
                    Eduscol.
                </p>
            </header>

            {/* Grille des 3 tuiles */}
            <main
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                           gap-5 w-full max-w-4xl"
                aria-label="Modules disponibles"
            >
                {TUILES.map((tuile) => (
                    <Tuile
                        key={tuile.moduleId}
                        tuile={tuile}
                        onSelect={actions.setModule}
                    />
                ))}
            </main>

            {/* Mention de version */}
            <footer className="text-xs text-slate-300">
                v0.1.0 — micetf.fr
            </footer>
        </div>
    );
}
