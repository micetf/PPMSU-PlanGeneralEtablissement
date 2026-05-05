/**
 * @fileoverview Couche de rendu des éléments de légende avec déplacement par drag
 */
import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { getSymbolByKey } from "../../constants/ppmsLegend";
import { useApp } from "../../hooks/useApp";
import { useDrag } from "../../hooks/useDrag";
import { symbolUrl } from "../../utils/assetPath";

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
 * Pentagone SVG — Zone de mise en sûreté
 * Affiche un label centré si renseigné
 * @param {{ width:number, height:number, color:string,
 *           fillColor:string, fillOpacity:number, label:string }} props
 */
function PentagonSymbol({
    width,
    height,
    color,
    fillColor,
    fillOpacity,
    label,
    strokeWidth,
}) {
    const cx = width / 2;
    const cy = height / 2;
    const rx = width / 2 - 2;
    const ry = height / 2 - 2;

    const points = Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
    }).join(" ");

    // Taille de police proportionnelle à la taille du symbole
    const fontSize = Math.max(10, Math.round(width / 8));

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            aria-label="Zone de mise en sûreté"
            overflow="visible"
        >
            <polygon
                points={points}
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
            {/* Label centré dans le pentagone */}
            {label && (
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={fontSize}
                    fontWeight="bold"
                    fill={color}
                    stroke="white"
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                >
                    {label}
                </text>
            )}
        </svg>
    );
}

PentagonSymbol.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    fillColor: PropTypes.string.isRequired,
    fillOpacity: PropTypes.number.isRequired,
    label: PropTypes.string,
    strokeWidth: PropTypes.number,
};

PentagonSymbol.defaultProps = { label: "", strokeWidth: 2 };

/**
 * Image de symbole avec fallback si fichier manquant
 */
function SymbolImageFallback({ src, alt, width, height }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div
                title={`Symbole manquant : ${alt}`}
                style={{ width, height }}
                className="flex items-center justify-center rounded border
                   border-dashed border-red-300 bg-red-50 text-red-400
                   text-[10px] text-center leading-tight p-1 select-none"
            >
                ⚠️
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="select-none"
            draggable={false}
            style={{ imageRendering: "pixelated" }}
            onError={() => setError(true)}
        />
    );
}

SymbolImageFallback.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
};

/**
 * @param {{ item:object, imageWidth:number, imageHeight:number }} props
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
        if (item.type === "compose" && symbol?.shape === "north_arrow") {
            return <NorthArrow />;
        }
        if (symbol?.shape === "pentagon") {
            return (
                <PentagonSymbol
                    width={item.width}
                    height={item.height}
                    color={symbol.color}
                    fillColor={symbol.fillColor}
                    fillOpacity={symbol.fillOpacity}
                    label={item.label}
                    strokeWidth={symbol.strokeWidth ?? 2}
                />
            );
        }
        if (item.type === "texte") {
            return (
                <span
                    className="text-sm font-bold select-none whitespace-nowrap"
                    style={{
                        color: symbol?.color ?? "#FFFF00",
                        textShadow: "1px 1px 2px #000, -1px -1px 2px #000",
                    }}
                >
                    {item.label || symbol?.label}
                </span>
            );
        }
        if (symbol?.imageFile) {
            return (
                <SymbolImageFallback
                    src={symbolUrl(symbol.imageFile)}
                    alt={symbol.label}
                    width={item.width}
                    height={item.height}
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
            onClick={(e) => e.stopPropagation()}
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
