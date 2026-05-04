/**
 * @fileoverview Canvas principal avec couches image, symboles et contours
 */
import { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useZoomPan } from "../../hooks/useZoomPan";
import { SymbolLayer } from "./SymbolLayer";
import { ContourLayer } from "./ContourLayer";

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
                aria-label="Réinitialiser"
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
 * @param {{ cursorPoint: object|null, onMouseMove: Function,
 *           onCanvasClick: Function, onDblClick: Function }} props
 */
export function WorkspaceCanvas({
    cursorPoint,
    onMouseMove,
    onCanvasClick,
    onDblClick,
}) {
    const { state, actions } = useApp();
    const containerRef = useRef(null);
    const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } =
        useZoomPan();

    const { src, naturalWidth, naturalHeight } = state.image;
    const { zoom, panOffset } = state.ui;

    useEffect(() => {
        if (!src || !containerRef.current) return;
        const { clientWidth, clientHeight } = containerRef.current;
        const initZoom =
            Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight) *
            0.9;
        actions.setZoom(initZoom);
        actions.setPan({
            x: (clientWidth - naturalWidth * initZoom) / 2,
            y: (clientHeight - naturalHeight * initZoom) / 2,
        });
    }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener("wheel", handleWheel, { passive: false });
        return () => el.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    const handleReset = useCallback(() => {
        if (!containerRef.current) return;
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

    // Fusion des handlers souris : zoom/pan + contour
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
            aria-label="Canvas de légende PPMS"
        >
            <div
                className="absolute origin-top-left"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                    width: imgW,
                    height: imgH,
                }}
            >
                <img
                    src={src}
                    alt="Vue aérienne de l'établissement"
                    width={imgW}
                    height={imgH}
                    className="absolute inset-0 select-none"
                    draggable={false}
                />

                {/* Couche contours SVG */}
                <ContourLayer
                    imageWidth={imgW}
                    imageHeight={imgH}
                    cursorPoint={cursorPoint}
                />

                {/* Couche symboles */}
                <SymbolLayer imageWidth={imgW} imageHeight={imgH} />
            </div>

            <ZoomControls
                onZoomIn={() => actions.setZoom(state.ui.zoom * 1.2)}
                onZoomOut={() => actions.setZoom(state.ui.zoom * 0.8)}
                onReset={handleReset}
            />
            <ZoomIndicator zoom={zoom} />
        </div>
    );
}

WorkspaceCanvas.propTypes = {
    cursorPoint: PropTypes.object,
    onMouseMove: PropTypes.func,
    onCanvasClick: PropTypes.func,
    onDblClick: PropTypes.func,
};

WorkspaceCanvas.defaultProps = {
    cursorPoint: null,
    onMouseMove: null,
    onCanvasClick: null,
    onDblClick: null,
};
