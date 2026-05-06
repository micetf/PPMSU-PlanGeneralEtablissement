/**
 * @fileoverview Couche SVG — flèches (polylignes) du niveau actif.
 * Chaque flèche est une polyligne avec une pointe au dernier segment.
 * Sélectionnable, déplaçable (entier ou nœud par nœud) et pivoTable en mode "select".
 */
import { useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

const ARROWHEAD_ANGLE = Math.PI / 6;

function computeArrowhead(pts, strokeWidth = 3) {
    if (pts.length < 2) return null;
    const arrowLen = Math.max(14, strokeWidth * 4);
    const shorten = arrowLen * 0.75;
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    return {
        tip: last,
        lineEnd: {
            x: last.x - shorten * Math.cos(angle),
            y: last.y - shorten * Math.sin(angle),
        },
        arrowPts: [
            `${last.x},${last.y}`,
            `${last.x - arrowLen * Math.cos(angle - ARROWHEAD_ANGLE)},${last.y - arrowLen * Math.sin(angle - ARROWHEAD_ANGLE)}`,
            `${last.x - arrowLen * Math.cos(angle + ARROWHEAD_ANGLE)},${last.y - arrowLen * Math.sin(angle + ARROWHEAD_ANGLE)}`,
        ].join(" "),
    };
}

/** Nœud draggable individuel d'une flèche sélectionnée */
function DraggableArrowNode({ item, nodeIndex, svgPt, activeNiveau, zoom }) {
    const { actions } = useApp();
    const dragOrigin = useRef(null);

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            if (!dragOrigin.current || !activeNiveau) return;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            const rotation = item.rotation ?? 0;

            // Convertir le delta écran en delta % image,
            // puis tourner dans le référentiel canonique (anti-rotation)
            const dxVis = (dx / zoom / naturalWidth) * 100;
            const dyVis = (dy / zoom / naturalHeight) * 100;
            const rad = -(rotation * Math.PI) / 180;
            const dxPct = dxVis * Math.cos(rad) - dyVis * Math.sin(rad);
            const dyPct = dxVis * Math.sin(rad) + dyVis * Math.cos(rad);

            const newPoints = dragOrigin.current.map((p, i) =>
                i === nodeIndex
                    ? { x: p.x + dxPct, y: p.y + dyPct }
                    : { ...p }
            );
            actions.updateNiveauLegendItem(item.id, { points: newPoints });
        },
    });

    const handleMouseDown = (e) => {
        e.stopPropagation();
        dragOrigin.current = (item.points ?? []).map((p) => ({ ...p }));
        onDragStart(e);
    };

    return (
        <circle
            cx={svgPt.x}
            cy={svgPt.y}
            r={6}
            fill="#3B82F6"
            fillOpacity={0.8}
            stroke="#fff"
            strokeWidth={1.5}
            style={{ cursor: "crosshair", pointerEvents: "all" }}
            onMouseDown={handleMouseDown}
        />
    );
}

DraggableArrowNode.propTypes = {
    item: PropTypes.object.isRequired,
    nodeIndex: PropTypes.number.isRequired,
    svgPt: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
    activeNiveau: PropTypes.object.isRequired,
    zoom: PropTypes.number.isRequired,
};

function ArrowItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const symbol = getNiveauSymbolByKey(item.symbolKey);
    const isSelected = state.ui.selectedItemId === item.id;
    const { zoom, selectedTool } = state.ui;
    const dragOrigin = useRef(null);

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            if (!dragOrigin.current || !activeNiveau) return;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            // Déplacement global : pas besoin de dé-rotation (on ajoute le même delta % à tous les points)
            const dxPct = (dx / zoom / naturalWidth) * 100;
            const dyPct = (dy / zoom / naturalHeight) * 100;
            actions.updateNiveauLegendItem(item.id, {
                points: dragOrigin.current.map((p) => ({
                    x: p.x + dxPct,
                    y: p.y + dyPct,
                })),
            });
        },
    });

    const handleMouseDown = (e) => {
        if (selectedTool !== "select") return;
        e.stopPropagation();
        actions.selectItem(item.id);
        dragOrigin.current = (item.points ?? []).map((p) => ({ ...p }));
        onDragStart(e);
    };

    const color = item.color ?? symbol?.color ?? "#EA580C";
    const strokeWidth = item.strokeWidth ?? symbol?.strokeWidth ?? 3;

    // Compatibilité avec l'ancien format startX/Y endX/Y
    const rawPts = item.points ?? (
        item.startX !== undefined
            ? [{ x: item.startX, y: item.startY }, { x: item.endX, y: item.endY }]
            : []
    );

    // Points en coordonnées SVG (non-rotatés — rotation appliquée via transform)
    const pts = rawPts.map((p) => ({
        x: (p.x / 100) * imageWidth,
        y: (p.y / 100) * imageHeight,
    }));

    if (pts.length < 2) return null;

    const head = computeArrowhead(pts, strokeWidth);

    // Polyline raccourcie (sans le bout pour laisser place à la pointe)
    const shortPts = [...pts];
    shortPts[shortPts.length - 1] = head.lineEnd;
    const polyPts = shortPts.map((p) => `${p.x},${p.y}`).join(" ");
    const allPts = pts.map((p) => `${p.x},${p.y}`).join(" ");

    // Rotation SVG autour du barycentre des points canoniques
    const rotation = item.rotation ?? 0;
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const rotateTransform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

    const isSelectable = selectedTool === "select";

    return (
        <g
            transform={rotateTransform}
            opacity={item.opacity ?? 1}
            style={{ cursor: isSelectable ? "grab" : "default" }}
            onMouseDown={handleMouseDown}
            onClick={(e) => {
                if (isSelectable) {
                    e.stopPropagation();
                    actions.selectItem(item.id);
                }
            }}
        >
            {/* Zone de clic élargie */}
            <polyline
                points={allPts}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ pointerEvents: isSelectable ? "stroke" : "none" }}
            />

            {/* Contour de sélection */}
            {isSelected && (
                <polyline
                    points={polyPts}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={strokeWidth + 6}
                    strokeOpacity={0.3}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    style={{ pointerEvents: "none" }}
                />
            )}

            {/* Corps de la polyligne */}
            <polyline
                points={polyPts}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
            />

            {/* Pointe de flèche */}
            <polygon
                points={head.arrowPts}
                fill={color}
                stroke={color}
                strokeWidth={1}
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
            />

            {/* Nœuds déplaçables (mode select, sélectionné) */}
            {isSelected && isSelectable && activeNiveau && pts.map((p, i) => (
                <DraggableArrowNode
                    key={i}
                    item={item}
                    nodeIndex={i}
                    svgPt={p}
                    activeNiveau={activeNiveau}
                    zoom={zoom}
                />
            ))}
        </g>
    );
}

ArrowItem.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

export function ArrowLayer({ imageWidth, imageHeight, arrowPoints, arrowCursorPos }) {
    const { state } = useApp();
    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );
    if (!activeNiveau) return null;

    const arrows = activeNiveau.legendItems.filter(
        (item) => item.type === NIVEAUX_ELEMENT_TYPES.FLECHE
    );

    // Polyligne fantôme pendant le dessin
    const ghostPts = arrowCursorPos
        ? [...arrowPoints, arrowCursorPos]
        : arrowPoints;

    const ghostHead = ghostPts.length >= 2
        ? computeArrowhead(
              ghostPts.map((p) => ({
                  x: (p.x / 100) * imageWidth,
                  y: (p.y / 100) * imageHeight,
              }))
          )
        : null;

    if (!arrows.length && !arrowPoints.length) return null;

    return (
        <svg
            className="absolute inset-0"
            width={imageWidth}
            height={imageHeight}
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            overflow="visible"
            style={{ pointerEvents: "none" }}
        >
            {arrows.map((item) => (
                <ArrowItem
                    key={item.id}
                    item={item}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                />
            ))}

            {/* Premier sommet posé */}
            {arrowPoints.length === 1 && (
                <circle
                    cx={(arrowPoints[0].x / 100) * imageWidth}
                    cy={(arrowPoints[0].y / 100) * imageHeight}
                    r={5}
                    fill="#94A3B8"
                    style={{ pointerEvents: "none" }}
                />
            )}

            {/* Polyligne fantôme */}
            {ghostPts.length >= 2 && ghostHead && (
                <g style={{ pointerEvents: "none" }}>
                    {(() => {
                        const shortGhost = ghostPts.map((p) => ({
                            x: (p.x / 100) * imageWidth,
                            y: (p.y / 100) * imageHeight,
                        }));
                        shortGhost[shortGhost.length - 1] = ghostHead.lineEnd;
                        const shortPtStr = shortGhost
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ");
                        return (
                            <>
                                <polyline
                                    points={shortPtStr}
                                    fill="none"
                                    stroke="#94A3B8"
                                    strokeWidth={2}
                                    strokeDasharray="6 4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <polygon
                                    points={ghostHead.arrowPts}
                                    fill="#94A3B8"
                                    stroke="#94A3B8"
                                    strokeWidth={1}
                                />
                            </>
                        );
                    })()}
                </g>
            )}
        </svg>
    );
}

ArrowLayer.propTypes = {
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    arrowPoints: PropTypes.array,
    arrowCursorPos: PropTypes.object,
};

ArrowLayer.defaultProps = {
    arrowPoints: [],
    arrowCursorPos: null,
};
