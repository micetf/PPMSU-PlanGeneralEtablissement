/**
 * @fileoverview Composant racine — PPMSU Atelier Visuel
 *
 * Architecture de navigation :
 *  1. <MiCetFNavBar>    → couche plateforme (fixed, z-50, h-10)
 *  2. <AppRouter>       → routage interne par moduleActif
 */
import { AppProvider } from "./contexts/AppProvider";
import { MiCetFNavBar } from "./components/layout/MiCetFNavBar";
import { HomeScreen } from "./components/ui/HomeScreen";
import { PlanGeneralSetup } from "./components/ui/PlanGeneralSetup";
import { LegendToolbar } from "./components/ui/LegendToolbar";
import { PropertiesPanel } from "./components/ui/PropertiesPanel";
import { TopBar } from "./components/ui/TopBar";
import { WorkspaceCanvas } from "./components/workspace/WorkspaceCanvas";
import { useApp } from "./hooks/useApp";
import { useContourDraw } from "./hooks/useContourDraw";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

/** @type {{ appTitle:string, paypalButtonId:string, contactEmail:string }} */
const MICETF_CONFIG = {
    appTitle: "PPMSU — Atelier Visuel",
    paypalButtonId: "Q2XYVFP4EEX2J",
    contactEmail: "webmaster@micetf.fr",
};

// ── Workspace Plan Général ────────────────────────────────────────────────────

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

// ── Placeholder modules à venir ───────────────────────────────────────────────

/**
 * Écran temporaire pour les modules non encore développés
 * @param {{ titre: string, description: string }} props
 */
function ModuleAVenir({ titre, description }) {
    const { actions } = useApp();
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen pt-10
                        gap-6 bg-slate-50 text-center px-4"
        >
            <div
                className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center
                            justify-center text-3xl"
            >
                🚧
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-700">{titre}</h2>
                <p className="mt-2 text-sm text-slate-400 max-w-sm">
                    {description}
                </p>
            </div>
            <button
                type="button"
                onClick={() => actions.setModule(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 text-sm
                           hover:bg-slate-300 transition-colors"
            >
                ← Retour à l'accueil
            </button>
        </div>
    );
}

// ── Routeur interne ───────────────────────────────────────────────────────────

function AppRouter() {
    const { state } = useApp();
    const { moduleActif } = state.ui;

    // Accueil : aucun module sélectionné
    if (!moduleActif) return <HomeScreen />;

    // Module 1 — Plan Général de l'École
    if (moduleActif === "planGeneral") {
        return state.image.src ? <WorkspaceLayout /> : <PlanGeneralSetup />;
    }

    // Module 2 — Plan des Niveaux (à venir)
    if (moduleActif === "planNiveaux") {
        return (
            <ModuleAVenir
                titre="Plan des Niveaux"
                description="Ce module est en cours de développement. Il permettra d'annoter les plans d'intervention par niveau de bâtiment."
            />
        );
    }

    // Module 3 — Coupures Fluides (à venir)
    if (moduleActif === "coupuresFluides") {
        return (
            <ModuleAVenir
                titre="Coupures Fluides"
                description="Ce module est en cours de développement. Il permettra d'annoter les photos des systèmes de coupure de fluides."
            />
        );
    }

    return <HomeScreen />;
}

// ── Racine ────────────────────────────────────────────────────────────────────

export default function App() {
    return (
        <AppProvider>
            <MiCetFNavBar
                appTitle={MICETF_CONFIG.appTitle}
                paypalButtonId={MICETF_CONFIG.paypalButtonId}
                contactEmail={MICETF_CONFIG.contactEmail}
            />
            <AppRouter />
        </AppProvider>
    );
}
