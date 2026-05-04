/**
 * @fileoverview Composant de chargement de l'image aérienne de l'établissement
 * Supporte le glisser-déposer et la sélection via dialogue fichier.
 * Valide le type MIME et le poids avant de transmettre au contexte.
 */
import { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";

/** Taille maximale acceptée (10 Mo) */
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/** Types MIME acceptés */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Valide un fichier image avant chargement
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
 * Zone de dépôt avec instructions visuelles
 * @param {{ onDrop: Function, onClick: Function, isDragging: boolean }} props
 */
function DropZone({ onDrop, onClick, isDragging }) {
    return (
        <button
            type="button"
            onClick={onClick}
            onDragOver={(e) => {
                e.preventDefault();
                onDrop(e, true);
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                onDrop(e, false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                onDrop(e, false, true);
            }}
            className={[
                "w-full max-w-xl mx-auto flex flex-col items-center justify-center gap-4",
                "rounded-2xl border-2 border-dashed px-8 py-16 cursor-pointer",
                "transition-colors duration-200 focus:outline-none focus-visible:ring-2",
                "focus-visible:ring-blue-500",
                isDragging
                    ? "border-blue-400 bg-blue-50"
                    : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50",
            ].join(" ")}
            aria-label="Zone de dépôt — cliquer ou glisser une image"
        >
            {/* Icône */}
            <div
                className={[
                    "w-16 h-16 rounded-full flex items-center justify-center text-3xl",
                    "transition-colors duration-200",
                    isDragging ? "bg-blue-100" : "bg-slate-100",
                ].join(" ")}
            >
                🛰️
            </div>

            {/* Texte principal */}
            <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">
                    {isDragging
                        ? "Déposez l'image ici"
                        : "Charger la vue aérienne"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Glissez-déposez ou cliquez pour sélectionner
                </p>
                <p className="mt-2 text-xs text-slate-400">
                    JPG, PNG ou WebP — 10 Mo maximum
                </p>
            </div>
        </button>
    );
}

DropZone.propTypes = {
    onDrop: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
};

/**
 * Bandeau d'erreur de validation
 * @param {{ message: string, onDismiss: Function }} props
 */
function ErrorBanner({ message, onDismiss }) {
    return (
        <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl bg-red-50
                 border border-red-200 px-4 py-3 text-sm text-red-700 max-w-xl mx-auto"
        >
            <span>⚠️ {message}</span>
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 text-red-400 hover:text-red-600 focus:outline-none
                   focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                aria-label="Fermer le message d'erreur"
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
 * Composant principal — chargement de l'image aérienne
 * S'affiche uniquement si aucune image n'est chargée dans le contexte.
 */
export function ImageLoader() {
    const { state, actions } = useApp();
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    /** Traite un fichier après sélection ou dépôt */
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

    /** Gère les événements drag/drop sur la DropZone */
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

    /** Ouvre le dialogue fichier natif */
    const handleClick = useCallback(() => {
        inputRef.current?.click();
    }, []);

    /** Gère la sélection via l'input fichier */
    const handleInputChange = useCallback(
        (e) => {
            handleFile(e.target.files?.[0]);
            // Reset pour permettre de recharger le même fichier
            e.target.value = "";
        },
        [handleFile]
    );

    // Si une image est déjà chargée, ce composant ne s'affiche pas
    if (state.image.src) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-slate-100">
            {/* En-tête */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                    PPMS — Plan de l'établissement
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Outil de légendage conforme au fascicule 2 Eduscol
                </p>
            </div>

            {/* Erreur de validation */}
            {error && (
                <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}

            {/* Zone de dépôt */}
            <DropZone
                onDrop={handleDrop}
                onClick={handleClick}
                isDragging={isDragging}
            />

            {/* Input fichier caché */}
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
            />
        </div>
    );
}
