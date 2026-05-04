/**
 * @fileoverview Bouton d'import d'un fichier .ppmsu
 * Utilisable depuis HomeScreen et TopBar sans duplication de logique
 */
import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

/**
 * @param {{ variant: 'home'|'topbar', onSuccess?: Function }} props
 */
export function ImportButton({ variant, onSuccess }) {
    const { actions } = useApp();
    const inputRef = useRef(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (file) => {
        if (!file) return;
        setError(null);
        setLoading(true);
        const result = await actions.importProject(file);
        setLoading(false);
        if (!result.success) {
            setError(result.error);
        } else {
            onSuccess?.();
        }
    };

    const handleChange = (e) => {
        handleFile(e.target.files?.[0]);
        e.target.value = "";
    };

    // Styles selon le contexte d'affichage
    const styles = {
        home: `flex items-center justify-center gap-2 w-full max-w-xl
           px-4 py-3 rounded-xl border border-slate-200 bg-white
           text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600
           hover:bg-blue-50 transition-colors cursor-pointer
           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`,
        topbar: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
             text-slate-600 hover:bg-slate-100 transition-colors
             focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`,
    };

    return (
        <div
            className={
                variant === "home" ? "w-full max-w-xl flex flex-col gap-2" : ""
            }
        >
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className={styles[variant]}
                aria-label="Importer un projet .ppmsu"
            >
                {loading ? "…" : "📂 Importer un projet .ppmsu"}
            </button>

            {error && (
                <p
                    role="alert"
                    className="text-xs text-red-600 text-center px-2"
                >
                    ⚠️ {error}
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".ppmsu"
                onChange={handleChange}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}

ImportButton.propTypes = {
    variant: PropTypes.oneOf(["home", "topbar"]).isRequired,
    onSuccess: PropTypes.func,
};

ImportButton.defaultProps = {
    onSuccess: null,
};
