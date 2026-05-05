/**
 * @fileoverview Export du plan légendé en image PNG.
 * Fusionne l'image de fond, les contours SVG et les symboles
 * sur un canvas HTML2D natif — sans dépendance externe.
 */

import { getSymbolByKey } from "../constants/ppmsLegend";
import { symbolUrl } from "./assetPath";

/**
 * Charge une image depuis une URL et retourne un HTMLImageElement.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Impossible de charger : ${src}`));
        img.src = src;
    });
}

/**
 * Dessine la rose des vents sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} size
 */
function drawNorthArrow(ctx, cx, cy, size) {
    const r = size / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(127,127,127,0.7)";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.8);
    ctx.lineTo(cx + r * 0.3, cy);
    ctx.lineTo(cx - r * 0.3, cy);
    ctx.closePath();
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.8);
    ctx.lineTo(cx + r * 0.3, cy);
    ctx.lineTo(cx - r * 0.3, cy);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
}

/**
 * Dessine les contours et zones sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} contourPaths
 * @param {number} w - largeur canvas
 * @param {number} h - hauteur canvas
 */
function drawContours(ctx, contourPaths, w, h) {
    contourPaths.forEach((path) => {
        if (path.points.length < 2) return;

        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.strokeWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash(path.strokeStyle === "dashed" ? [8, 5] : []);

        const pts = path.points.map((p) => ({
            x: (p.x / 100) * w,
            y: (p.y / 100) * h,
        }));

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        if (path.closed) ctx.closePath();
        ctx.stroke();

        if (path.closed && path.fillColor && path.fillColor !== "transparent") {
            ctx.fillStyle = path.fillColor;
            ctx.globalAlpha = path.fillOpacity ?? 0.25;
            ctx.fill();
            ctx.globalAlpha = 1;

            if (path.points.length >= 3) {
                const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
                const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                ctx.strokeText("Zone de mise en sûreté", cx, cy);
                ctx.fillStyle = path.color;
                ctx.fillText("Zone de mise en sûreté", cx, cy);
            }
        }

        ctx.setLineDash([]);
    });
}

/**
 * Dessine les éléments de légende sur le canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} legendItems
 * @param {number} w
 * @param {number} h
 * @param {Map<string, HTMLImageElement>} imageCache
 */
function drawLegendItems(ctx, legendItems, w, h, imageCache) {
    legendItems.forEach((item) => {
        const symbol = getSymbolByKey(item.symbolKey);
        if (!symbol) return;

        const x = (item.x / 100) * w;
        const y = (item.y / 100) * h;

        ctx.save();
        ctx.globalAlpha = item.opacity ?? 1;
        ctx.translate(x, y);
        ctx.rotate((item.rotation * Math.PI) / 180);

        if (item.type === "compose" && symbol.shape === "north_arrow") {
            drawNorthArrow(ctx, 0, 0, item.width);
        } else if (symbol.shape === "pentagon") {
            const r = item.width / 2 - 2;
            ctx.strokeStyle = symbol.color;
            ctx.lineWidth = symbol.strokeWidth ?? 2;
            ctx.fillStyle = symbol.fillColor;
            ctx.globalAlpha = symbol.fillOpacity;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const px = r * Math.cos(angle);
                const py = r * Math.sin(angle);
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.stroke();

            if (item.label) {
                const fontSize = Math.max(10, Math.round(item.width / 8));
                ctx.font = `bold ${fontSize}px sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.strokeStyle = "white";
                ctx.lineWidth = 3;
                ctx.strokeText(item.label, 0, 0);
                ctx.fillStyle = symbol.color;
                ctx.fillText(item.label, 0, 0);
            }
        } else if (item.type === "texte") {
            const text = item.label || symbol.label;
            // ✅ item.width comme fontSize — cohérent avec SymbolLayer
            ctx.font = `bold ${item.width}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.strokeText(text, 0, 0);
            ctx.fillStyle = symbol.color ?? "#FFFF00";
            ctx.fillText(text, 0, 0);
        } else if (symbol.imageFile) {
            const img = imageCache.get(symbol.imageFile);
            if (img) {
                ctx.drawImage(
                    img,
                    -item.width / 2,
                    -item.height / 2,
                    item.width,
                    item.height
                );
            }
        }

        ctx.restore();
    });
}

/**
 * Génère une image PNG du plan légendé et déclenche son téléchargement.
 * @param {object} state - état applicatif complet
 * @param {string} [fileName='plan-ppms.png']
 * @returns {Promise<void>}
 */
export async function exportToPng(state, fileName = "plan-ppms.png") {
    const { image, legendItems, contourPaths } = state;

    const bgImage = await loadImage(image.src);
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bgImage, 0, 0, w, h);

    const imageCache = new Map();
    const symbolFiles = [
        ...new Set(
            legendItems
                .map((item) => getSymbolByKey(item.symbolKey)?.imageFile)
                .filter(Boolean)
        ),
    ];
    await Promise.all(
        symbolFiles.map(async (file) => {
            try {
                const img = await loadImage(symbolUrl(file));
                imageCache.set(file, img);
            } catch {
                console.warn(`[export] Image symbole manquante : ${file}`);
            }
        })
    );

    drawContours(ctx, contourPaths, w, h);
    drawLegendItems(ctx, legendItems, w, h, imageCache);

    canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }, "image/png");
}
