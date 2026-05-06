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
import { PlanNiveauxSetup } from "./components/ui/PlanNiveauxSetup";
import { LegendToolbar } from "./components/ui/LegendToolbar";
import { NiveauxToolbar } from "./components/ui/NiveauxToolbar";
import { NiveauxList } from "./components/ui/NiveauxList";
import { PropertiesPanel } from "./components/ui/PropertiesPanel";
import { TopBar } from "./components/ui/TopBar";
import { ModuleTabBar } from "./components/ui/ModuleTabBar";
import { WorkspaceCanvas } from "./components/workspace/WorkspaceCanvas";
import { NiveauWorkspaceCanvas } from "./components/workspace/NiveauWorkspaceCanvas";
import { useApp } from "./hooks/useApp";
import { useContourDraw } from "./hooks/useContourDraw";
import { useNiveauContourDraw } from "./hooks/useNiveauContourDraw";
import { useArrowDraw } from "./hooks/useArrowDraw";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { eventToNiveauPct } from "./utils/niveauCoords";

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
            const { naturalWidth, naturalHeight } = state.planGeneral.image;
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
            <ModuleTabBar />
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

// ── Workspace Plan des Niveaux ────────────────────────────────────────────────

function NiveauWorkspaceLayout() {
    const { state, actions } = useApp();
    useKeyboardShortcuts();

    const {
        cursorPoint: contourCursor,
        handleCanvasClick: niveauContourClick,
        handleCanvasDblClick: niveauContourDblClick,
        handleCanvasMouseMove: niveauContourMouseMove,
    } = useNiveauContourDraw();

    const {
        pendingStart,
        cursorPos: arrowCursor,
        handleCanvasClick: arrowClick,
        handleCanvasMouseMove: arrowMouseMove,
    } = useArrowDraw();

    const handleCanvasClick = (e) => {
        const { selectedTool, selectedSymbolKey } = state.ui;

        if (selectedTool === "draw") {
            niveauContourClick(e);
            return;
        }
        if (selectedTool === "arrow") {
            arrowClick(e);
            return;
        }
        if (selectedTool === "place" && selectedSymbolKey) {
            // Marqueur photo ou annotation : placement simple
            const activeNiveau = state.planNiveaux.niveaux.find(
                (n) => n.id === state.planNiveaux.activeNiveauId
            );
            if (!activeNiveau) return;
            const point = eventToNiveauPct(e, activeNiveau, state.ui);
            if (!point) return;
            actions.addNiveauLegendItem(selectedSymbolKey, {
                x: point.x,
                y: point.y,
                label: "",
            });
            return;
        }
        const tag = e.target.tagName.toLowerCase();
        if (tag === "img" || tag === "div") actions.selectItem(null);
    };

    const handleMouseMove = (e) => {
        const { selectedTool } = state.ui;
        if (selectedTool === "draw") niveauContourMouseMove(e);
        else if (selectedTool === "arrow") arrowMouseMove(e);
    };

    const handleDblClick = (e) => {
        const { selectedTool } = state.ui;
        if (selectedTool === "draw") niveauContourDblClick(e);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden pt-10">
            <ModuleTabBar />
            <TopBar />
            <div className="flex flex-1 min-h-0 overflow-hidden">
                <NiveauxList />
                <div className="relative flex-1 min-w-0">
                    <NiveauWorkspaceCanvas
                        cursorPoint={contourCursor}
                        pendingArrowStart={pendingStart}
                        arrowCursorPos={arrowCursor}
                        onMouseMove={handleMouseMove}
                        onCanvasClick={handleCanvasClick}
                        onDblClick={handleDblClick}
                    />
                    <PropertiesPanel />
                </div>
                <NiveauxToolbar />
            </div>
        </div>
    );
}

// ── Placeholder modules à venir ───────────────────────────────────────────────

function ModuleAVenir({ titre, description }) {
    return (
        <div className="flex flex-col h-screen overflow-hidden pt-10">
            <ModuleTabBar />
            <div
                className="flex flex-col items-center justify-center flex-1
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
            </div>
        </div>
    );
}

// ── Routeur interne ───────────────────────────────────────────────────────────

function AppRouter() {
    const { state } = useApp();
    const { moduleActif } = state.ui;

    if (!moduleActif) return <HomeScreen />;

    // Module 1 — Plan Général de l'École
    if (moduleActif === "planGeneral") {
        return state.planGeneral.image.src ? (
            <WorkspaceLayout />
        ) : (
            <PlanGeneralSetup />
        );
    }

    // Module 2 — Plan des Niveaux
    if (moduleActif === "planNiveaux") {
        const { niveaux, activeNiveauId } = state.planNiveaux;
        if (niveaux.length === 0) return <PlanNiveauxSetup />;
        const activeNiveau = niveaux.find((n) => n.id === activeNiveauId);
        if (!activeNiveau?.image.src) return <PlanNiveauxSetup />;
        return <NiveauWorkspaceLayout />;
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
