/**
 * @fileoverview Hook de gestion du cycle de vie des projets
 */
import { useState, useCallback } from "react";
import { useApp } from "./useApp";

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
        await new Promise((r) => setTimeout(r, 150));
        const result = await actions.saveProject(); // ← await
        setIsSaving(false);
        setSaveResult(result);
        refreshProjects();
        setTimeout(() => setSaveResult(null), 3000);
    }, [actions, refreshProjects]);

    const handleLoad = useCallback(
        async (projectId) => {
            const result = await actions.loadProject(projectId); // ← await
            if (!result.success) {
                setSaveResult({ success: false, error: result.error });
            }
            refreshProjects();
            return result;
        },
        [actions, refreshProjects]
    );

    const handleDelete = useCallback(
        async (projectId) => {
            await actions.deleteProject(projectId); // ← await
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
