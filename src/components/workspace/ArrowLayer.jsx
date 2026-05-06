/**
 * @fileoverview Couche SVG — flèches (polylignes) du niveau actif.
 * Chaque flèche est une polyligne avec une pointe au dernier segment.
 * Sélectionnable et déplaçable en mode "select".
 */
import { useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

const ARROWHEAD_LEN = 14;
const ARROWHEAD_ANGLE = Math.PI / 6;
const ARROWHEAD_SHORTEN = ARROWHEAD_LEN * 0.75;

function computeArrowhead(pts) {
    if (pts.length < 2) return null;
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    return {
        tip: last,
        lineEnd: {
            x: last.x - ARROWHEAD_SHORTEN * Math.cos(angle),
            y: last.y - ARROWHEAD_SHORTEN * Math.sin(angle),
        },
        arrowPts: [
            `${last.x},${last.y}`,
            `${last.x - ARROWHEAD_LEN * Math.cos(angle - ARROWHEAD_ANGLE)},${last.y - ARROWHEAD_LEN * Math.sin(angle - ARROWHEAD_ANGLE)}`,
            `${last.x - ARROWHEAD_LEN * Math.cos(angle + ARROWHEAD_ANGLE)},${last.y - ARROWHEAD_LEN * Math.sin(angle + ARROWHEAD_ANGLE)}`,
        ].join(" "),
    };
}

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

    const pts = rawPts.map((p) => ({
        x: (p.x / 100) * imageWidth,
        y: (p.y / 100) * imageHeight,
    }));

    if (pts.length < 2) return null;

    const head = computeArrowhead(pts);

    // Polyline raccourcie (sans le bout pour laisser place à la pointe)
    const shortPts = [...pts];
    shortPts[shortPts.length - 1] = head.lineEnd;
    const polyPts = shortPts.map((p) => `${p.x},${p.y}`).join(" ");
    const allPts = pts.map((p) => `${p.x},${p.y}`).join(" ");

    const isSelectable = selectedTool === "select";

    return (
        <g
            opacity={item.opacity ?? 1}
            style={{
                pointerEvents: isSelectable ? "auto" : "none",
                cursor: isSelectable ? "grab" : "default",
            }}
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
            />

            {/* Contour de sélection */}
            {isSelected && (
                <>
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
                    {pts.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r={5}
                            fill="#3B82F6"
                            fillOpacity={0.5}
                            style={{ pointerEvents: "none" }}
                        />
                    ))}
                </>
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
