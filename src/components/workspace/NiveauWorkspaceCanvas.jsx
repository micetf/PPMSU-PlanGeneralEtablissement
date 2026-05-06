/**
 * @fileoverview Canvas du module Plan des Niveaux.
 * Lit l'image du niveau actif ; superpose ContourLayer, ArrowLayer, NiveauSymbolLayer.
 */
import { useRef, useEffect, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useZoomPan } from "../../hooks/useZoomPan";
import { ContourLayer } from "./ContourLayer";
import { NiveauSymbolLayer } from "./NiveauSymbolLayer";
import { ArrowLayer } from "./ArrowLayer";

function ZoomIndicator({ zoom }) {
    return (
        <div
            className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm
                       rounded-lg px-3 py-1 text-xs text-slate-600 font-mono
                       shadow select-none pointer-events-none"
        >
            {Math.round(zoom * 100)} %
        </div>
    );
}
ZoomIndicator.propTypes = { zoom: PropTypes.number.isRequired };

function ZoomControls({ onZoomIn, onZoomOut, onReset }) {
    const btn = [
        "w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow",
        "hover:bg-slate-50 text-slate-700 text-base font-bold",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        "transition-colors",
    ].join(" ");
    return (
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
            <button
                type="button"
                onClick={onZoomIn}
                className={btn}
                aria-label="Zoom avant"
            >
                +
            </button>
            <button
                type="button"
                onClick={onReset}
                className={btn}
                aria-label="Réinitialiser le zoom"
            >
                ⊙
            </button>
            <button
                type="button"
                onClick={onZoomOut}
                className={btn}
                aria-label="Zoom arrière"
            >
                −
            </button>
        </div>
    );
}
ZoomControls.propTypes = {
    onZoomIn: PropTypes.func.isRequired,
    onZoomOut: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
};

/**
 * @param {{ cursorPoint:object|null, pendingArrowStart:object|null,
 *           arrowCursorPos:object|null, onMouseMove:Function,
 *           onCanvasClick:Function, onDblClick:Function }} props
 */
export function NiveauWorkspaceCanvas({
    cursorPoint,
    pendingArrowStart,
    arrowCursorPos,
    onMouseMove,
    onCanvasClick,
    onDblClick,
}) {
    const { state, actions } = useApp();
    const containerRef = useRef(null);
    const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
        useZoomPan();
    const [imgError, setImgError] = useState(false);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const { src, naturalWidth, naturalHeight } = activeNiveau?.image ?? {};
    const { zoom, panOffset } = state.ui;
    const activeNiveauId = state.planNiveaux.activeNiveauId;
    const rotation = activeNiveau?.rotation ?? 0;

    useEffect(() => {
        if (!src || !naturalWidth || !naturalHeight || !containerRef.current)
            return;
        const { clientWidth, clientHeight } = containerRef.current;
        const initZoom =
            Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight) *
            0.9;
        actions.setZoom(initZoom);
        actions.setPan({
            x: (clientWidth - naturalWidth * initZoom) / 2,
            y: (clientHeight - naturalHeight * initZoom) / 2,
        });
    }, [src, activeNiveauId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    const handleReset = useCallback(() => {
        if (!containerRef.current || !naturalWidth || !naturalHeight) return;
        const { clientWidth, clientHeight } = containerRef.current;
        const initZoom =
            Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight) *
            0.9;
        actions.setZoom(initZoom);
        actions.setPan({
            x: (clientWidth - naturalWidth * initZoom) / 2,
            y: (clientHeight - naturalHeight * initZoom) / 2,
        });
    }, [naturalWidth, naturalHeight, actions]);

    const handleMove = useCallback(
        (e) => {
            handleMouseMove(e);
            onMouseMove?.(e);
        },
        [handleMouseMove, onMouseMove]
    );

    if (!src) return null;

    const imgW = naturalWidth * zoom;
    const imgH = naturalHeight * zoom;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden bg-slate-200 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={onCanvasClick}
            onDoubleClick={onDblClick}
            aria-label="Canvas Plan des Niveaux"
        >
            {!imgError && (
                <div
                    className="absolute"
                    style={{
                        left: panOffset.x,
                        top: panOffset.y,
                        width: imgW,
                        height: imgH,
                        transform: rotation ? `rotate(${rotation}deg)` : undefined,
                        transformOrigin: "center center",
                    }}
                >
                    <img
                        key={`${src}-${activeNiveauId}`}
                        src={src}
                        alt={`Plan d'intervention — ${activeNiveau?.nom}`}
                        width={imgW}
                        height={imgH}
                        className="absolute inset-0 select-none"
                        draggable={false}
                        onError={() => setImgError(true)}
                    />
                    <ContourLayer
                        imageWidth={imgW}
                        imageHeight={imgH}
                        cursorPoint={cursorPoint}
                        contourPaths={activeNiveau?.contourPaths ?? []}
                        onUpdatePoint={(id, idx, pt) =>
                            actions.updateNiveauContourPoint(id, idx, pt)
                        }
                    />
                    <NiveauSymbolLayer imageWidth={imgW} imageHeight={imgH} />
                    <ArrowLayer
                        imageWidth={imgW}
                        imageHeight={imgH}
                        pendingArrowStart={pendingArrowStart}
                        arrowCursorPos={arrowCursorPos}
                    />
                </div>
            )}

            {imgError && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <div className="text-center p-8">
                        <p className="text-4xl mb-4">🖼️</p>
                        <p className="text-sm font-semibold text-slate-700">
                            Image inaccessible
                        </p>
                        <p className="mt-1 text-xs text-slate-500 max-w-xs">
                            Le plan d'intervention de ce niveau n'a pas pu être chargé.
                        </p>
                    </div>
                </div>
            )}

            {!imgError && (
                <>
                    <ZoomControls
                        onZoomIn={() => actions.setZoom(state.ui.zoom * 1.2)}
                        onZoomOut={() => actions.setZoom(state.ui.zoom * 0.8)}
                        onReset={handleReset}
                    />
                    <ZoomIndicator zoom={zoom} />
                </>
            )}
        </div>
    );
}

NiveauWorkspaceCanvas.propTypes = {
    cursorPoint: PropTypes.object,
    pendingArrowStart: PropTypes.object,
    arrowCursorPos: PropTypes.object,
    onMouseMove: PropTypes.func,
    onCanvasClick: PropTypes.func,
    onDblClick: PropTypes.func,
};

NiveauWorkspaceCanvas.defaultProps = {
    cursorPoint: null,
    pendingArrowStart: null,
    arrowCursorPos: null,
    onMouseMove: null,
    onCanvasClick: null,
    onDblClick: null,
};
