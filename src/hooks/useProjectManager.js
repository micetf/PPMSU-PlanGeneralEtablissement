/**
 * @fileoverview Hook de gestion du cycle de vie des projets
 * Encapsule les interactions avec localStorage via les actions du contexte
 */
import { useState, useCallback } from "react";
import { useApp } from "./useApp";

/**
 * @returns {{
 *   projects: Array,
 *   isSaving: boolean,
 *   saveResult: {success:boolean, error?:string} | null,
 *   refreshProjects: Function,
 *   handleSave: Function,
 *   handleLoad: Function,
 *   handleDelete: Function,
 *   handleNew: Function,
 * }}
 */
export function useProjectManager() {
    const { actions } = useApp();
    const [projects, setProjects] = useState(() => actions.listProjects());
    const [isSaving, setIsSaving] = useState(false);
    const [saveResult, setSaveResult] = useState(null);

    const refreshProjects = useCallback(() => {
        setProjects(actions.listProjects());
    }, [actions]);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        setSaveResult(null);
        // Micro-délai pour que le spinner soit visible
        await new Promise((r) => setTimeout(r, 150));
        const result = actions.saveProject();
        setIsSaving(false);
        setSaveResult(result);
        refreshProjects();
        // Efface le retour visuel après 3 s
        setTimeout(() => setSaveResult(null), 3000);
    }, [actions, refreshProjects]);

    const handleLoad = useCallback(
        (projectId) => {
            const result = actions.loadProject(projectId);
            if (!result.success) {
                setSaveResult({ success: false, error: result.error });
            }
            refreshProjects();
            return result;
        },
        [actions, refreshProjects]
    );

    const handleDelete = useCallback(
        (projectId) => {
            actions.deleteProject(projectId);
            refreshProjects();
        },
        [actions, refreshProjects]
    );

    const handleNew = useCallback(() => {
        actions.resetProject();
    }, [actions]);

    return {
        projects,
        isSaving,
        saveResult,
        refreshProjects,
        handleSave,
        handleLoad,
        handleDelete,
        handleNew,
    };
}
