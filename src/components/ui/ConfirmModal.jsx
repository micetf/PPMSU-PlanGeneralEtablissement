/**
 * @fileoverview Modale de confirmation générique
 * Utilisée pour les actions destructrices (nouveau projet, suppression)
 */
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

/**
 * @param {{
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   variant?: 'danger' | 'warning',
 *   onConfirm: Function,
 *   onCancel: Function,
 * }} props
 */
export function ConfirmModal({
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant,
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);

    // Focus sur "Annuler" par défaut — action non destructrice
    useEffect(() => {
        cancelRef.current?.focus();
    }, []);

    // Fermeture par Échap
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    const confirmStyles = {
        danger: "bg-red-500 hover:bg-red-600 text-white focus-visible:ring-red-400",
        warning:
            "bg-amber-500 hover:bg-amber-600 text-white focus-visible:ring-amber-400",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-sm"
            onClick={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6
                   flex flex-col gap-4 focus:outline-none"
            >
                <div>
                    <h2
                        id="confirm-title"
                        className="text-base font-bold text-slate-800"
                    >
                        {title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">{message}</p>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm text-slate-600
                       bg-slate-100 hover:bg-slate-200 transition-colors
                       focus:outline-none focus-visible:ring-2
                       focus-visible:ring-slate-400"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={[
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            "focus:outline-none focus-visible:ring-2",
                            confirmStyles[variant],
                        ].join(" ")}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    variant: PropTypes.oneOf(["danger", "warning"]),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

ConfirmModal.defaultProps = {
    confirmLabel: "Confirmer",
    cancelLabel: "Annuler",
    variant: "danger",
};
