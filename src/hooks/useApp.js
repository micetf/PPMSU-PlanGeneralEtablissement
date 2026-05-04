/**
 * @fileoverview Hook d'accès au contexte applicatif global
 */
import { useContext } from "react";
import { AppContext } from "../contexts/appContext";

/**
 * Hook d'accès au contexte — à utiliser dans tous les composants enfants
 * @returns {{ state: import('../reducers/appReducer').AppState, actions: object }}
 */
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error(
            "useApp doit être utilisé à l'intérieur d'un <AppProvider>"
        );
    return ctx;
}
