/**
 * @fileoverview Couche SVG — contours et zones polygonales
 * Sélection et déplacement des nœuds en mode select
 */
import PropTypes from "prop-types";
import { useRef } from "react";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";

const toSvgPoints = (pts, w, h) =>
    pts.map((p) => `${(p.x / 100) * w},${(p.y / 100) * h}`).join(" ");

/**
 * Nœud draggable d'un tracé fermé
 */
function DraggableNode({
    point,
    index,
    pathId,
    imageWidth,
    imageHeight,
    onUpdatePoint,
}) {
    const dragOrigin = useRef({ x: point.x, y: point.y });

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            onUpdatePoint(pathId, index, {
                x: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.x + (dx / imageWidth) * 100
                    )
                ),
                y: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.y + (dy / imageHeight) * 100
                    )
                ),
            });
        },
    });

    const handleMouseDown = (e) => {
        dragOrigin.current = { x: point.x, y: point.y };
        onDragStart(e);
    };

    return (
        <circle
            cx={(point.x / 100) * imageWidth}
            cy={(point.y / 100) * imageHeight}
            r={6}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={2}
            style={{ cursor: "grab", pointerEvents: "auto" }}
            onMouseDown={handleMouseDown}
        />
    );
}

DraggableNode.propTypes = {
    point: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    pathId: PropTypes.string.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    onUpdatePoint: PropTypes.func.isRequired,
};

function ContourPath({
    path,
    imageWidth,
    imageHeight,
    cursorPoint,
    isSelected,
    onSelect,
    onUpdatePoint,
    selectable,
    showLabel,
}) {
    const pts = path.points;
    if (pts.length === 0) return null;

    const isZone = path.fillColor && path.fillColor !== "transparent";
    const strokeDash = path.strokeStyle === "dashed" ? "8 5" : undefined;

    const sharedStroke = {
        stroke: path.color,
        strokeWidth: isSelected ? path.strokeWidth + 2 : path.strokeWidth,
        strokeDasharray: strokeDash,
        strokeLinecap: "round",
        strokeLinejoin: "round",
    };

    const basePts = toSvgPoints(pts, imageWidth, imageHeight);
    const ghostPt =
        !path.closed && cursorPoint
            ? `${(cursorPoint.x / 100) * imageWidth},${(cursorPoint.y / 100) * imageHeight}`
            : null;
    const allPts = ghostPt ? `${basePts} ${ghostPt}` : basePts;

    const handleShapeClick = (e) => {
        if (!selectable || !path.closed) return;
        e.stopPropagation();
        onSelect(path.id);
    };

    const clickableStyle =
        selectable && path.closed
            ? { cursor: "pointer", pointerEvents: "auto" }
            : { cursor: "default", pointerEvents: "none" };

    return (
        <g>
            {path.closed ? (
                <>
                    {/* Zone de clic élargie */}
                    <polygon
                        points={basePts}
                        fill={isZone ? path.fillColor : "none"}
                        fillOpacity={0.01}
                        stroke="transparent"
                        strokeWidth={14}
                        style={clickableStyle}
                        onClick={handleShapeClick}
                    />
                    {/* Forme visible */}
                    <polygon
                        points={basePts}
                        fill={isZone ? path.fillColor : "none"}
                        fillOpacity={isZone ? path.fillOpacity : 0}
                        style={{ pointerEvents: "none" }}
                        {...sharedStroke}
                    />
                    {/* Contour de sélection */}
                    {isSelected && (
                        <polygon
                            points={basePts}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            opacity={0.9}
                            style={{ pointerEvents: "none" }}
                        />
                    )}
                    {/* Nœuds déplaçables (visibles si sélectionné) */}
                    {isSelected &&
                        pts.map((p, i) => (
                            <DraggableNode
                                key={i}
                                point={p}
                                index={i}
                                pathId={path.id}
                                imageWidth={imageWidth}
                                imageHeight={imageHeight}
                                onUpdatePoint={onUpdatePoint}
                            />
                        ))}
                </>
            ) : (
                <>
                    <polyline
                        points={allPts}
                        fill="none"
                        style={{ pointerEvents: "none" }}
                        {...sharedStroke}
                    />
                    {isZone && pts.length >= 2 && (
                        <polygon
                            points={ghostPt ? `${basePts} ${ghostPt}` : basePts}
                            fill={path.fillColor}
                            fillOpacity={path.fillOpacity * 0.4}
                            stroke="none"
                            style={{ pointerEvents: "none" }}
                        />
                    )}
                    {/* Points de contrôle pendant le tracé */}
                    {pts.map((p, i) => (
                        <circle
                            key={i}
                            cx={(p.x / 100) * imageWidth}
                            cy={(p.y / 100) * imageHeight}
                            r={4}
                            fill="white"
                            stroke={path.color}
                            strokeWidth={1.5}
                            style={{ pointerEvents: "none" }}
                        />
                    ))}
                    {/* Cible de fermeture */}
                    {pts.length >= 3 && (
                        <circle
                            cx={(pts[0].x / 100) * imageWidth}
                            cy={(pts[0].y / 100) * imageHeight}
                            r={7}
                            fill={path.color}
                            fillOpacity={0.35}
                            stroke={path.color}
                            strokeWidth={2}
                            style={{ pointerEvents: "none" }}
                        />
                    )}
                </>
            )}

            {/* Label centré sur zone fermée (Plan Général uniquement) */}
            {showLabel &&
                path.closed &&
                isZone &&
                pts.length >= 3 &&
                (() => {
                    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
                    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
                    return (
                        <text
                            x={(cx / 100) * imageWidth}
                            y={(cy / 100) * imageHeight}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="12"
                            fontWeight="bold"
                            fill={path.color}
                            stroke="white"
                            strokeWidth="3"
                            paintOrder="stroke"
                            style={{
                                pointerEvents: "none",
                                userSelect: "none",
                            }}
                        >
                            {path.nom ?? "Zone de mise en sûreté"}
                        </text>
                    );
                })()}
        </g>
    );
}

ContourPath.propTypes = {
    path: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    cursorPoint: PropTypes.object,
    isSelected: PropTypes.bool,
    onSelect: PropTypes.func,
    onUpdatePoint: PropTypes.func,
    selectable: PropTypes.bool,
};

ContourPath.defaultProps = {
    cursorPoint: null,
    isSelected: false,
    onSelect: () => {},
    onUpdatePoint: () => {},
    selectable: false,
    showLabel: true,
};

export function ContourLayer({
    imageWidth,
    imageHeight,
    cursorPoint,
    contourPaths,
    onUpdatePoint,
    showLabel,
}) {
    const { state, actions } = useApp();
    if (!contourPaths.length) return null;

    const { activeDrawingPathId, selectedItemId, selectedTool } = state.ui;
    const selectable = selectedTool === "select";

    return (
        <svg
            className="absolute inset-0"
            width={imageWidth}
            height={imageHeight}
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            overflow="visible"
            style={{ pointerEvents: "none" }}
        >
            {contourPaths.map((path) => (
                <ContourPath
                    key={path.id}
                    path={path}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    cursorPoint={
                        path.id === activeDrawingPathId ? cursorPoint : null
                    }
                    isSelected={selectedItemId === path.id}
                    onSelect={(id) => actions.selectItem(id)}
                    onUpdatePoint={onUpdatePoint}
                    selectable={selectable}
                    showLabel={showLabel}
                />
            ))}
        </svg>
    );
}

ContourLayer.propTypes = {
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    cursorPoint: PropTypes.object,
    contourPaths: PropTypes.array.isRequired,
    onUpdatePoint: PropTypes.func.isRequired,
    showLabel: PropTypes.bool,
};

ContourLayer.defaultProps = { cursorPoint: null, showLabel: true };
