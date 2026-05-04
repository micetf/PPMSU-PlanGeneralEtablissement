/**
 * @fileoverview Zone de dépôt d'image aérienne
 * Gère la sélection par clic et le glisser-déposer.
 * Valide le type MIME et le poids avant de transmettre au contexte.
 */
import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFile(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "Format non supporté. Utilisez JPG, PNG ou WebP.",
        };
    }
    if (file.size > MAX_SIZE_BYTES) {
        return { valid: false, error: "Image trop lourde. Maximum : 10 Mo." };
    }
    return { valid: true };
}

/**
 * @param {{ message: string, onDismiss: Function }} props
 */
function ErrorBanner({ message, onDismiss }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl bg-red-50
                 border border-red-200 px-4 py-3 text-sm text-red-700 w-full"
        >
            <span>⚠️ {message}</span>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Fermer le message d'erreur"
                className="shrink-0 text-red-400 hover:text-red-600 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-red-400 rounded"
            >
                ✕
            </button>
        </div>
    );
}

ErrorBanner.propTypes = {
    message: PropTypes.string.isRequired,
    onDismiss: PropTypes.func.isRequired,
};

/**
 * Zone de dépôt d'une image aérienne
 * Appelle actions.loadImage() dès qu'un fichier valide est sélectionné.
 */
export function DropZone() {
    const { actions } = useApp();
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = useCallback(
        (file) => {
            if (!file) return;
            setError(null);
            const { valid, error: validationError } = validateFile(file);
            if (!valid) {
                setError(validationError);
                return;
            }
            actions.loadImage(file);
        },
        [actions]
    );

    const handleDrop = useCallback(
        (e, entering, dropped) => {
            if (entering !== undefined) {
                setIsDragging(entering);
                return;
            }
            if (dropped) {
                setIsDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
            }
        },
        [handleFile]
    );

    const handleClick = useCallback(() => inputRef.current?.click(), []);
    const handleChange = useCallback(
        (e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
        },
        [handleFile]
    );

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-xl">
            {error && (
                <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}

            <button
                type="button"
                onClick={handleClick}
                onDragOver={(e) => {
                    e.preventDefault();
                    handleDrop(e, true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    handleDrop(e, false);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(e, false, true);
                }}
                className={[
                    "w-full flex flex-col items-center justify-center gap-4",
                    "rounded-2xl border-2 border-dashed px-8 py-12 cursor-pointer",
                    "transition-colors duration-200 focus:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-blue-500",
                    isDragging
                        ? "border-blue-400 bg-blue-50"
                        : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50",
                ].join(" ")}
                aria-label="Zone de dépôt — cliquer ou glisser une image"
            >
                <div
                    className={[
                        "w-14 h-14 rounded-full flex items-center justify-center text-2xl",
                        isDragging ? "bg-blue-100" : "bg-slate-100",
                    ].join(" ")}
                >
                    🛰️
                </div>
                <div className="text-center">
                    <p className="text-base font-semibold text-slate-700">
                        {isDragging ? "Déposez l'image ici" : "Nouveau projet"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Glissez-déposez ou cliquez pour charger une vue aérienne
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        JPG, PNG ou WebP — 10 Mo maximum
                    </p>
                </div>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleChange}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}
