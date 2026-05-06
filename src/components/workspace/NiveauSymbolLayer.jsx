/**
 * @fileoverview Couche SVG — photos planche et annotations texte du niveau actif.
 * Les éléments sont sélectionnables et déplaçables en mode select.
 */
import { useRef } from "react";
import PropTypes from "prop-types";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";
import { NIVEAUX_ELEMENT_TYPES } from "../../constants/niveauxLegend";

/** Photo autonome déposée sur la planche (peut être hors des limites de l'image) */
function PhotoItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const isSelected = state.ui.selectedItemId === item.id;
    const { zoom, selectedTool } = state.ui;
    const dragOrigin = useRef({ x: item.x, y: item.y });

    const activeNiveau = state.planNiveaux.niveaux.find(
        (n) => n.id === state.planNiveaux.activeNiveauId
    );
    const photo = activeNiveau?.photos.find((p) => p.id === item.photoId);

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            if (!activeNiveau) return;
            const { naturalWidth, naturalHeight } = activeNiveau.image;
            actions.updateNiveauLegendItem(item.id, {
                x: dragOrigin.current.x + (dx / zoom / naturalWidth) * 100,
                y: dragOrigin.current.y + (dy / zoom / naturalHeight) * 100,
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

    if (!photo?.src) return null;

    const cx = (item.x / 100) * imageWidth;
    const cy = (item.y / 100) * imageHeight;
    const renderWidth = ((item.widthPct ?? 25) / 100) * imageWidth;
    const renderHeight = renderWidth * (item.aspectRatio ?? 1);
    const rotation = item.rotation ?? 0;
    const opacity = item.opacity ?? 1;

    return (
        <g
            transform={`translate(${cx}, ${cy}) rotate(${rotation})`}
            opacity={opacity}
            style={{
                cursor: selectedTool === "select" ? "grab" : "default",
                pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Zone de clic (doit précéder l'image pour être derrière) */}
            <rect
                x={-renderWidth / 2}
                y={-renderHeight / 2}
                width={renderWidth}
                height={renderHeight}
                fill="transparent"
                stroke="none"
            />
            <image
                href={photo.src}
                x={-renderWidth / 2}
                y={-renderHeight / 2}
                width={renderWidth}
                height={renderHeight}
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: "none" }}
            />
            {isSelected && (
                <rect
                    x={-renderWidth / 2 - 5}
                    y={-renderHeight / 2 - 5}
                    width={renderWidth + 10}
                    height={renderHeight + 10}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    rx={2}
                    style={{ pointerEvents: "none" }}
                />
            )}
        </g>
    );
}

PhotoItem.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

/** Annotation texte libre (peut être pivotée) */
function TexteItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
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
                    -20,
                    Math.min(120, dragOrigin.current.x + (dx / zoom / naturalWidth) * 100)
                ),
                y: Math.max(
                    -20,
                    Math.min(120, dragOrigin.current.y + (dy / zoom / naturalHeight) * 100)
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
    const color = item.color ?? "#FFFF00";
    const fontSize = item.fontSize ?? item.width ?? 14;
    const text = item.label || "Annotation";
    const rotation = item.rotation ?? 0;

    return (
        <g
            transform={`translate(${x}, ${y}) rotate(${rotation})`}
            style={{
                cursor: selectedTool === "select" ? "grab" : "default",
                pointerEvents: "auto",
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            role="button"
            aria-label={text}
            aria-pressed={isSelected}
        >
            {/* Zone de clic transparente centrée sur le texte */}
            <rect
                x={-Math.max(fontSize * 4, 40)}
                y={-fontSize}
                width={Math.max(fontSize * 8, 80)}
                height={fontSize * 2}
                fill="transparent"
                stroke="none"
            />
            {isSelected && (
                <circle
                    r={fontSize * 1.6}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                    style={{ pointerEvents: "none" }}
                />
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
            item.type === NIVEAUX_ELEMENT_TYPES.PHOTO ||
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
                if (item.type === NIVEAUX_ELEMENT_TYPES.PHOTO) {
                    return (
                        <PhotoItem
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
