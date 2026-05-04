import { AppProvider } from "./contexts/AppProvider";
import { ImageLoader } from "./components/ui/ImageLoader";
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

        // ── Outil tracé ────────────────────────────────────────────────────────
        if (selectedTool === "draw") {
            contourClick(e);
            return;
        }

        // ── Outil placement ────────────────────────────────────────────────────
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

        // ── Outil sélection — désélectionner UNIQUEMENT sur le fond ────────────
        // Les éléments SVG (polygon, polyline, g, circle, text…) gèrent
        // leur propre sélection. On ne désélectionne que si le clic
        // atterrit sur l'image de fond ou le conteneur.
        const tag = e.target.tagName.toLowerCase();
        const isBackground = tag === "img" || tag === "div";
        if (isBackground) {
            actions.selectItem(null);
        }
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

function AppRouter() {
    const { state } = useApp();
    return state.image.src ? <WorkspaceLayout /> : <ImageLoader />;
}

export default function App() {
    return (
        <AppProvider>
            <AppRouter />
        </AppProvider>
    );
}
