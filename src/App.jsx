/**
 * @fileoverview Composant racine
 */
import { AppProvider } from "./contexts/AppProvider";
import { HomeScreen } from "./components/ui/HomeScreen";
import { LegendToolbar } from "./components/ui/LegendToolbar";
import { PropertiesPanel } from "./components/ui/PropertiesPanel";
import { TopBar } from "./components/ui/TopBar";
import { WorkspaceCanvas } from "./components/workspace/WorkspaceCanvas";
import { useApp } from "./hooks/useApp";
import { useContourDraw } from "./hooks/useContourDraw";

function WorkspaceLayout() {
    const { state, actions } = useApp();
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
        <div className="flex flex-col h-screen overflow-hidden">
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

/**
 * Aiguilleur racine — HomeScreen OU WorkspaceLayout
 * Les deux ne sont jamais montés simultanément → useProjectManager
 * n'est instancié qu'une seule fois à la fois.
 */
function AppRouter() {
    const { state } = useApp();
    return state.image.src ? <WorkspaceLayout /> : <HomeScreen />;
}

export default function App() {
    return (
        <AppProvider>
            <AppRouter />
        </AppProvider>
    );
}
