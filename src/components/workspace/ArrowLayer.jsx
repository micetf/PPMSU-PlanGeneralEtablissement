/**
 * @fileoverview Couche SVG — flèches d'accès et d'escalier du niveau actif.
 * Affiche les flèches numérotées + un trait fantôme pendant le dessin.
 * Sélectionnable en mode "select" via clic.
 */
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

const ARROWHEAD_LEN = 14;
const ARROWHEAD_ANGLE = Math.PI / 6;
const ARROWHEAD_SHORTEN = ARROWHEAD_LEN * 0.75;

function computeArrowGeometry(x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const lx2 = x2 - ARROWHEAD_SHORTEN * Math.cos(angle);
    const ly2 = y2 - ARROWHEAD_SHORTEN * Math.sin(angle);
    const ax1 = x2 - ARROWHEAD_LEN * Math.cos(angle - ARROWHEAD_ANGLE);
    const ay1 = y2 - ARROWHEAD_LEN * Math.sin(angle - ARROWHEAD_ANGLE);
    const ax2 = x2 - ARROWHEAD_LEN * Math.cos(angle + ARROWHEAD_ANGLE);
    const ay2 = y2 - ARROWHEAD_LEN * Math.sin(angle + ARROWHEAD_ANGLE);
    return {
        lineEnd: { x: lx2, y: ly2 },
        arrowPts: `${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`,
        mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
    };
}

function ArrowItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const symbol = getNiveauSymbolByKey(item.symbolKey);
    const isSelected = state.ui.selectedItemId === item.id;
    const { selectedTool } = state.ui;

    const color = symbol?.color ?? "#EA580C";
    const strokeWidth = symbol?.strokeWidth ?? 3;
    const opacity = item.opacity ?? 1;

    const x1 = (item.startX / 100) * imageWidth;
    const y1 = (item.startY / 100) * imageHeight;
    const x2 = (item.endX / 100) * imageWidth;
    const y2 = (item.endY / 100) * imageHeight;

    const { lineEnd, arrowPts, mid } = computeArrowGeometry(x1, y1, x2, y2);

    const handleClick = (e) => {
        if (selectedTool !== "select") return;
        e.stopPropagation();
        actions.selectItem(item.id);
    };

    const isSelectable = selectedTool === "select";

    return (
        <g
            opacity={opacity}
            style={{
                pointerEvents: isSelectable ? "auto" : "none",
                cursor: isSelectable ? "pointer" : "default",
            }}
            onClick={handleClick}
            role="button"
            aria-label={`Flèche ${item.numero} — ${symbol?.label ?? ""}`}
            aria-pressed={isSelected}
        >
            {/* Zone de clic élargie */}
            <line
                x1={x1}
                y1={y1}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke="transparent"
                strokeWidth={14}
            />

            {/* Contour de sélection */}
            {isSelected && (
                <>
                    <line
                        x1={x1}
                        y1={y1}
                        x2={lineEnd.x}
                        y2={lineEnd.y}
                        stroke="#3B82F6"
                        strokeWidth={strokeWidth + 5}
                        strokeOpacity={0.3}
                        style={{ pointerEvents: "none" }}
                    />
                    <circle cx={x1} cy={y1} r={5} fill="#3B82F6" fillOpacity={0.4} />
                    <circle cx={x2} cy={y2} r={5} fill="#3B82F6" fillOpacity={0.4} />
                </>
            )}

            {/* Corps de la flèche */}
            <line
                x1={x1}
                y1={y1}
                x2={lineEnd.x}
                y2={lineEnd.y}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                style={{ pointerEvents: "none" }}
            />

            {/* Pointe */}
            <polygon
                points={arrowPts}
                fill={color}
                stroke={color}
                strokeWidth={1}
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
            />

            {/* Cercle numéro au milieu */}
            <circle
                cx={mid.x}
                cy={mid.y}
                r={10}
                fill="white"
                stroke={color}
                strokeWidth={1.5}
                style={{ pointerEvents: "none" }}
            />
            <text
                x={mid.x}
                y={mid.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="bold"
                fill={color}
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {item.numero}
            </text>
        </g>
    );
}

ArrowItem.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

export function ArrowLayer({
    imageWidth,
    imageHeight,
    pendingArrowStart,
    arrowCursorPos,
}) {
    const { state } = useApp();
    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );
    if (!activeNiveau) return null;

    const arrows = activeNiveau.legendItems.filter(
        (item) => item.type === NIVEAUX_ELEMENT_TYPES.FLECHE
    );

    const hasPending = Boolean(pendingArrowStart && arrowCursorPos);
    const pendingX1 = pendingArrowStart
        ? (pendingArrowStart.x / 100) * imageWidth
        : 0;
    const pendingY1 = pendingArrowStart
        ? (pendingArrowStart.y / 100) * imageHeight
        : 0;
    const pendingX2 = arrowCursorPos ? (arrowCursorPos.x / 100) * imageWidth : 0;
    const pendingY2 = arrowCursorPos ? (arrowCursorPos.y / 100) * imageHeight : 0;

    let pendingGeo = null;
    if (hasPending) {
        pendingGeo = computeArrowGeometry(
            pendingX1,
            pendingY1,
            pendingX2,
            pendingY2
        );
    }

    if (!arrows.length && !pendingArrowStart) return null;

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

            {/* Flèche fantôme pendant le dessin */}
            {pendingArrowStart && (
                <circle
                    cx={pendingX1}
                    cy={pendingY1}
                    r={5}
                    fill="#94A3B8"
                    style={{ pointerEvents: "none" }}
                />
            )}
            {hasPending && pendingGeo && (
                <g style={{ pointerEvents: "none" }}>
                    <line
                        x1={pendingX1}
                        y1={pendingY1}
                        x2={pendingGeo.lineEnd.x}
                        y2={pendingGeo.lineEnd.y}
                        stroke="#94A3B8"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                    />
                    <polygon
                        points={pendingGeo.arrowPts}
                        fill="#94A3B8"
                        stroke="#94A3B8"
                        strokeWidth={1}
                    />
                </g>
            )}
        </svg>
    );
}

ArrowLayer.propTypes = {
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
    pendingArrowStart: PropTypes.object,
    arrowCursorPos: PropTypes.object,
};

ArrowLayer.defaultProps = {
    pendingArrowStart: null,
    arrowCursorPos: null,
};
