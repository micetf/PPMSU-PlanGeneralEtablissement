/**
 * @fileoverview Prévisualisation miniature d'un symbole PPMS dans la toolbar
 */
import PropTypes from "prop-types";
import { ELEMENT_TYPES } from "../../constants/ppmsLegend";
import { symbolUrl } from "../../utils/assetPath";

/**
 * Pentagone SVG miniature
 */
function MiniPentagon({ color, fillColor, fillOpacity }) {
    const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return `${16 + 13 * Math.cos(a)},${16 + 13 * Math.sin(a)}`;
    }).join(" ");
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <polygon
                points={pts}
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={color}
                strokeWidth="2"
            />
        </svg>
    );
}

MiniPentagon.propTypes = {
    color: PropTypes.string.isRequired,
    fillColor: PropTypes.string.isRequired,
    fillOpacity: PropTypes.number.isRequired,
};

/**
 * Rose des vents miniature
 */
function MiniNorthArrow() {
    return (
        <svg width="32" height="32" viewBox="0 0 40 40" aria-hidden="true">
            <circle cx="20" cy="20" r="18" fill="rgba(127,127,127,0.7)" />
            <polygon points="20,4 24,20 16,20" fill="#FF0000" />
            <polygon points="20,36 24,20 16,20" fill="white" />
        </svg>
    );
}

/**
 * Ligne en tirets miniature (délimitation)
 * @param {{ color: string }} props
 */
function MiniDashedLine({ color }) {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <line
                x1="2"
                y1="16"
                x2="30"
                y2="16"
                stroke={color}
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
            />
        </svg>
    );
}

MiniDashedLine.propTypes = { color: PropTypes.string.isRequired };

/**
 * Prévisualisation d'un symbole selon son type
 * @param {{ symbol: import('../../constants/ppmsLegend').PPMSSymbol }} props
 */
export function SymbolPreview({ symbol }) {
    const { type, shape, imageFile, color, fillColor, fillOpacity } = symbol;

    if (type === ELEMENT_TYPES.COMPOSE && shape === "north_arrow") {
        return <MiniNorthArrow />;
    }
    if (shape === "pentagon") {
        return (
            <MiniPentagon
                color={color}
                fillColor={fillColor ?? color}
                fillOpacity={fillOpacity ?? 0.25}
            />
        );
    }
    if (type === ELEMENT_TYPES.CONTOUR) {
        return <MiniDashedLine color={color ?? "#FF0000"} />;
    }
    if (type === ELEMENT_TYPES.TEXTE) {
        return (
            <span
                className="text-xs font-bold leading-none"
                style={{
                    color,
                    textShadow: "1px 1px 1px #000",
                }}
                aria-hidden="true"
            >
                Aa
            </span>
        );
    }
    if (imageFile) {
        return (
            <img
                src={symbolUrl(imageFile)}
                alt=""
                className="max-w-8 max-h-8 object-contain"
                style={{ imageRendering: "pixelated" }}
                aria-hidden="true"
            />
        );
    }
    return <span className="text-slate-400 text-xs">?</span>;
}

SymbolPreview.propTypes = {
    symbol: PropTypes.shape({
        type: PropTypes.string.isRequired,
        shape: PropTypes.string,
        imageFile: PropTypes.string,
        color: PropTypes.string,
        fillColor: PropTypes.string,
        fillOpacity: PropTypes.number,
    }).isRequired,
};
