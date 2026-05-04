/**
 * @fileoverview Couche de rendu des éléments de légende avec déplacement par drag
 */
import PropTypes from "prop-types";
import { useRef } from "react";
import { getSymbolByKey } from "../../constants/ppmsLegend";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";

function NorthArrow() {
    return (
        <svg viewBox="0 0 40 40" width="40" height="40" aria-label="Nord">
            <circle cx="20" cy="20" r="18" fill="rgba(127,127,127,0.7)" />
            <polygon points="20,4 24,20 16,20" fill="#FF0000" />
            <polygon points="20,36 24,20 16,20" fill="white" />
        </svg>
    );
}

/**
 * @param {{ item: object, imageWidth: number, imageHeight: number }} props
 */
function LegendItem({ item, imageWidth, imageHeight }) {
    const { state, actions } = useApp();
    const symbol = getSymbolByKey(item.symbolKey);
    const isSelected = state.ui.selectedItemId === item.id;

    const dragOrigin = useRef({ x: item.x, y: item.y });

    const { onDragStart } = useDrag({
        onMove: (dx, dy) => {
            const { zoom } = state.ui;
            const { naturalWidth, naturalHeight } = state.image;
            actions.updateLegendItem(item.id, {
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
        if (state.ui.selectedTool !== "select") return;
        actions.selectItem(item.id);
        dragOrigin.current = { x: item.x, y: item.y };
        onDragStart(e);
    };

    const renderContent = () => {
        if (item.type === "compose" && symbol?.shape === "north_arrow")
            return <NorthArrow />;
        if (item.type === "texte") {
            return (
                <span
                    className="text-sm font-bold select-none whitespace-nowrap"
                    style={{
                        color: symbol?.color ?? "#FFFF00",
                        textShadow: "1px 1px 2px #000, -1px -1px 2px #000",
                    }}
                >
                    {item.label}
                </span>
            );
        }
        if (symbol?.imageFile) {
            return (
                <img
                    src={`/symbols/${symbol.imageFile}`}
                    alt={symbol.label}
                    width={item.width}
                    height={item.height}
                    className="select-none"
                    draggable={false}
                    style={{ imageRendering: "pixelated" }}
                />
            );
        }
        return null;
    };

    const x = (item.x / 100) * imageWidth;
    const y = (item.y / 100) * imageHeight;

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={symbol?.label ?? item.label}
            aria-pressed={isSelected}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()} // ← empêche le canvas de désélectionner
            onKeyDown={(e) => e.key === "Enter" && actions.selectItem(item.id)}
            style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                opacity: item.opacity,
                zIndex: item.zIndex,
                outline: isSelected ? "2px solid #3B82F6" : "none",
                outlineOffset: "3px",
                cursor: state.ui.selectedTool === "select" ? "grab" : "default",
            }}
        >
            {renderContent()}
        </div>
    );
}

LegendItem.propTypes = {
    item: PropTypes.object.isRequired,
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};

export function SymbolLayer({ imageWidth, imageHeight }) {
    const { state } = useApp();
    return (
        <>
            {state.legendItems.map((item) => (
                <LegendItem
                    key={item.id}
                    item={item}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                />
            ))}
        </>
    );
}

SymbolLayer.propTypes = {
    imageWidth: PropTypes.number.isRequired,
    imageHeight: PropTypes.number.isRequired,
};
