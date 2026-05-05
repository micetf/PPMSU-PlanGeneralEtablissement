/**
 * @fileoverview Barre de navigation de la plateforme MiCetF
 *
 * Couche de navigation supérieure commune à tous les outils MiCetF.
 * Contient exclusivement : identité de marque, titre de l'app, et
 * actions transversales (don PayPal, contact webmaster).
 *
 * ⚠️  Ne doit JAMAIS contenir de logique applicative spécifique à PPMSU.
 *     Les actions métier (sauvegarder, exporter…) appartiennent à <TopBar>.
 *
 * @module MiCetFNavBar
 */
import { useState } from "react";
import PropTypes from "prop-types";

// ── Icônes SVG inline (pas de dépendance externe) ──────────────────────────

/** @returns {JSX.Element} */
function IconChevron() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            height="0.85em"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="m12.95 10.707.707-.707L8 4.343 6.586 5.757 10.828 10l-4.242 4.243L8 15.657l4.95-4.95z" />
        </svg>
    );
}

/** @returns {JSX.Element} */
function IconHeart() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            height="0.85em"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="m10 3.22-.61-.6a5.5 5.5 0 0 0-7.78 7.77L10 18.78l8.39-8.4a5.5 5.5 0 0 0-7.78-7.77l-.61.61z" />
        </svg>
    );
}

/** @returns {JSX.Element} */
function IconMail() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            height="0.85em"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M18 2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2h16zm-4.37 9.1L20 16v-2l-5.12-3.9L20 6V4l-10 8L0 4v2l5.12 4.1L0 14v2l6.37-4.9L10 14l3.63-2.9z" />
        </svg>
    );
}

// ── Sous-composant : bouton de don PayPal ───────────────────────────────────

/**
 * Bouton de don via PayPal.
 * Utilise une vraie balise <form> HTML nécessaire au protocole PayPal.
 *
 * @param {{ hostedButtonId: string }} props
 */
function PaypalDonateButton({ hostedButtonId }) {
    return (
        <form
            action="https://www.paypal.com/cgi-bin/webscr"
            method="post"
            target="_top"
            className="inline-flex"
        >
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input
                type="hidden"
                name="hosted_button_id"
                value={hostedButtonId}
            />
            <button
                type="submit"
                title="Si vous pensez que ces outils le méritent… Merci !"
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400
                           text-white text-xs px-2.5 py-1 rounded transition-colors
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300"
            >
                <IconHeart />
                <span className="hidden sm:inline">Soutenir</span>
            </button>
        </form>
    );
}

PaypalDonateButton.propTypes = {
    hostedButtonId: PropTypes.string.isRequired,
};

// ── Sous-composant : bouton de contact ─────────────────────────────────────

/**
 * Bouton de contact webmaster.
 *
 * @param {{ email: string }} props
 */
function ContactButton({ email }) {
    const [copied, setCopied] = useState(false);

    /** Ouvre le client mail ou copie l'adresse en fallback */
    const handleClick = () => {
        window.location.href = `mailto:${email}`;
        // Feedback visuel bref (utile si aucun client mail n'est configuré)
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            title={
                copied
                    ? "Ouverture du client mail…"
                    : `Contacter le webmaster (${email})`
            }
            className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500
                       text-white text-xs px-2.5 py-1 rounded transition-colors
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
            <IconMail />
            <span className="hidden sm:inline">Contact</span>
        </button>
    );
}

ContactButton.propTypes = {
    email: PropTypes.string.isRequired,
};

// ── Composant principal ─────────────────────────────────────────────────────

/**
 * Barre de navigation MiCetF — couche plateforme, indépendante des apps.
 *
 * Hauteur fixe : 40px (h-10). Le contenu principal doit prévoir un padding-top
 * de 40px (`pt-10`) pour ne pas se retrouver sous cette barre.
 *
 * @param {Object}  props
 * @param {string}  props.appTitle         - Titre de l'application courante
 * @param {string}  props.paypalButtonId   - ID du bouton PayPal (spécifique à l'app)
 * @param {string}  [props.contactEmail]   - Email du webmaster
 * @returns {JSX.Element}
 */
export function MiCetFNavBar({ appTitle, paypalButtonId, contactEmail }) {
    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 h-10
                       bg-gray-900 text-white shadow-md"
            aria-label="Navigation MiCetF"
        >
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
                {/* ── Gauche : identité MiCetF + titre app ── */}
                <div className="flex items-center gap-1.5 min-w-0 text-sm font-medium">
                    <a
                        href="https://micetf.fr"
                        className="shrink-0 text-white hover:text-yellow-400
                                   transition-colors focus:outline-none
                                   focus-visible:ring-2 focus-visible:ring-yellow-400 rounded"
                        title="Retour au portail MiCetF"
                        rel="noopener noreferrer"
                    >
                        MiCetF
                    </a>

                    <span className="shrink-0 text-gray-500" aria-hidden="true">
                        <IconChevron />
                    </span>

                    {/* Titre tronqué sur petits écrans */}
                    <span
                        className="truncate text-gray-300 text-xs sm:text-sm"
                        title={appTitle}
                    >
                        {appTitle}
                    </span>
                </div>

                {/* ── Droite : actions transversales MiCetF uniquement ── */}
                <div className="flex items-center gap-2 shrink-0">
                    <PaypalDonateButton hostedButtonId={paypalButtonId} />
                    <ContactButton email={contactEmail} />
                </div>
            </div>
        </nav>
    );
}

MiCetFNavBar.propTypes = {
    /** Titre de l'application, affiché après le breadcrumb MiCetF */
    appTitle: PropTypes.string.isRequired,
    /** Identifiant du bouton de don PayPal, propre à chaque app MiCetF */
    paypalButtonId: PropTypes.string.isRequired,
    /** Adresse email du webmaster */
    contactEmail: PropTypes.string,
};

MiCetFNavBar.defaultProps = {
    contactEmail: "webmaster@micetf.fr",
};
