/**
 * @fileoverview Composant racine — orchestre les deux couches de navigation :
 *  1. <MiCetFNavBar>   → couche plateforme (fixed, z-50, h-10)
 *  2. <TopBar>         → couche applicative PPMSU (dans le flux, h-14)
 */
import { AppProvider } from "./contexts/AppProvider";
import { MiCetFNavBar } from "./components/layout/MiCetFNavBar";
import { HomeScreen } from "./components/ui/HomeScreen";
import { LegendToolbar } from "./components/ui/LegendToolbar";
import { PropertiesPanel } from "./components/ui/PropertiesPanel";
import { TopBar } from "./components/ui/TopBar";
import { WorkspaceCanvas } from "./components/workspace/WorkspaceCanvas";
import { useApp } from "./hooks/useApp";
import { useContourDraw } from "./hooks/useContourDraw";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

/** Constantes MiCetF — isolées ici pour faciliter la maintenance */
const MICETF_CONFIG = {
    appTitle: "PPMSU — Plan Général de l'École",
    paypalButtonId: "Q2XYVFP4EEX2J",
    contactEmail: "webmaster@micetf.fr", // À ajuster selon la config réelle
};

// ── Workspace ───────────────────────────────────────────────────────────────

function WorkspaceLayout() {
    const { state, actions } = useApp();

    useKeyboardShortcuts();

    const {
        cursorPoint,
        handleCanvasClick: contourClick,
        handleCanvasDblClick: contourDblClick,
        handleCanvasMouseMove,
    } = useContourDraw();

    const handleCanvasClick = (e) => {
        const { selectedTool, selectedSymbolKey } = state.ui;

        if (selectedTool === "draw") {
            contourClick(e);
            return;
        }

        if (selectedTool === "place" && selectedSymbolKey) {
            const rect = e.currentTarget.getBoundingClientRect();
            const { zoom, panOffset } = state.ui;
            const { naturalWidth, naturalHeight } = state.image;
            const imgX = (e.clientX - rect.left - panOffset.x) / zoom;
            const imgY = (e.clientY - rect.top - panOffset.y) / zoom;
            actions.addLegendItem(
                selectedSymbolKey,
                (imgX / naturalWidth) * 100,
                (imgY / naturalHeight) * 100
            );
            return;
        }

        const tag = e.target.tagName.toLowerCase();
        if (tag === "img" || tag === "div") actions.selectItem(null);
    };

    return (
        /*
         * pt-10 compense la MiCetFNavBar fixée (h-10 = 40px).
         * Le reste de la mise en page est inchangé.
         */
        <div className="flex flex-col h-screen overflow-hidden pt-10">
            <TopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <LegendToolbar />
                <div className="relative flex-1 min-w-0">
                    <WorkspaceCanvas
                        cursorPoint={cursorPoint}
                        onMouseMove={handleCanvasMouseMove}
                        onCanvasClick={handleCanvasClick}
                        onDblClick={contourDblClick}
                    />
                    <PropertiesPanel />
                </div>
            </div>
        </div>
    );
}

// ── Routeur interne ─────────────────────────────────────────────────────────

function AppRouter() {
    const { state } = useApp();
    /*
     * HomeScreen reçoit également pt-10 pour s'afficher
     * sous la MiCetFNavBar fixée — à ajouter dans HomeScreen.jsx
     * (wrapper racine : className="... pt-10")
     */
    return state.image.src ? <WorkspaceLayout /> : <HomeScreen />;
}

// ── Racine ──────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <AppProvider>
            {/*
             * MiCetFNavBar est rendu UNE SEULE FOIS ici, en dehors de AppRouter.
             * Elle est indépendante de l'état applicatif PPMSU.
             */}
            <MiCetFNavBar
                appTitle={MICETF_CONFIG.appTitle}
                paypalButtonId={MICETF_CONFIG.paypalButtonId}
                contactEmail={MICETF_CONFIG.contactEmail}
            />
            <AppRouter />
        </AppProvider>
    );
}
