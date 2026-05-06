/**
 * @fileoverview Couche SVG — marqueurs photo et annotations texte du niveau actif.
 * Les éléments sont sélectionnables et déplaçables en mode select.
 */
import { useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

const MARKER_RADIUS = 12;

function MarqueurPhoto({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const symbol = getNiveauSymbolByKey(item.symbolKey);
    const isSelected = state.ui.selectedItemId === item.id;
    const { zoom, selectedTool } = state.ui;
    const dragOrigin = useRef({ x: item.x, y: item.y });

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            if (!activeNiveau) return;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            actions.updateNiveauLegendItem(item.id, {
                x: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.x + (dx / zoom / naturalWidth) * 100
                    )
                ),
                y: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.y + (dy / zoom / naturalHeight) * 100
                    )
                ),
            });
        },
    });

    const handleMouseDown = (e) => {
        if (selectedTool !== "select") return;
        e.stopPropagation();
        actions.selectItem(item.id);
        dragOrigin.current = { x: item.x, y: item.y };
        onDragStart(e);
    };

    const cx = (item.x / 100) * imageWidth;
    const cy = (item.y / 100) * imageHeight;
    const color = symbol?.color ?? "#16A34A";
    const opacity = item.opacity ?? 1;

    return (
        <g
            transform={`translate(${cx}, ${cy})`}
            style={{
                cursor: selectedTool === "select" ? "grab" : "default",
                pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            role="button"
            aria-label={`Marqueur photo ${item.numero}`}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <circle
                    r={MARKER_RADIUS + 5}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                />
            )}
            <circle
                r={MARKER_RADIUS}
                fill={color}
                fillOpacity={opacity}
                stroke="white"
                strokeWidth={1.5}
            />
            <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fontWeight="bold"
                fill="white"
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {item.numero}
            </text>
            {item.label && (
                <text
                    y={MARKER_RADIUS + 12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill={color}
                    stroke="white"
                    strokeWidth={2}
                    paintOrder="stroke"
                    style={{ pointerEvents: "none", userSelect: "none" }}
                >
                    {item.label}
                </text>
            )}
        </g>
    );
}

MarqueurPhoto.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

function TexteItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const symbol = getNiveauSymbolByKey(item.symbolKey);
    const isSelected = state.ui.selectedItemId === item.id;
    const { zoom, selectedTool } = state.ui;
    const dragOrigin = useRef({ x: item.x, y: item.y });

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            if (!activeNiveau) return;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            actions.updateNiveauLegendItem(item.id, {
                x: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.x + (dx / zoom / naturalWidth) * 100
                    )
                ),
                y: Math.max(
                    0,
                    Math.min(
                        100,
                        dragOrigin.current.y + (dy / zoom / naturalHeight) * 100
                    )
                ),
            });
        },
    });

    const handleMouseDown = (e) => {
        if (selectedTool !== "select") return;
        e.stopPropagation();
        actions.selectItem(item.id);
        dragOrigin.current = { x: item.x, y: item.y };
        onDragStart(e);
    };

    const x = (item.x / 100) * imageWidth;
    const y = (item.y / 100) * imageHeight;
    const color = symbol?.color ?? "#FFFF00";
    const fontSize = item.fontSize ?? 14;
    const text = item.label || symbol?.label;

    return (
        <g
            transform={`translate(${x}, ${y})`}
            style={{
                cursor: selectedTool === "select" ? "grab" : "default",
                pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            role="button"
            aria-label={text || "Annotation"}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <circle r={fontSize} fill="none" stroke="#3B82F6" strokeWidth={1.5} />
            )}
            <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize}
                fontWeight="bold"
                fill={color}
                stroke="#000"
                strokeWidth={2}
                paintOrder="stroke"
                opacity={item.opacity ?? 1}
                style={{ pointerEvents: "none", userSelect: "none" }}
            >
                {text}
            </text>
        </g>
    );
}

TexteItem.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

export function NiveauSymbolLayer({ imageWidth, imageHeight }) {
    const { state } = useApp();
    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );
    if (!activeNiveau) return null;

    const items = activeNiveau.legendItems.filter(
        (item) =>
            item.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO ||
            item.type === NIVEAUX_ELEMENT_TYPES.TEXTE
    );

    if (!items.length) return null;

    return (
        <svg
            className="absolute inset-0"
            width={imageWidth}
            height={imageHeight}
            viewBox={`0 0 ${imageWidth} ${imageHeight}`}
            overflow="visible"
            style={{ pointerEvents: "none" }}
        >
            {items.map((item) => {
                if (item.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO) {
                    return (
                        <MarqueurPhoto
                            key={item.id}
                            item={item}
                            imageWidth={imageWidth}
                            imageHeight={imageHeight}
                        />
                    );
                }
                if (item.type === NIVEAUX_ELEMENT_TYPES.TEXTE) {
                    return (
                        <TexteItem
                            key={item.id}
                            item={item}
                            imageWidth={imageWidth}
                            imageHeight={imageHeight}
                        />
                    );
                }
                return null;
            })}
        </svg>
    );
}

NiveauSymbolLayer.propTypes = {
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};
