/**
 * @fileoverview Export PNG d'un niveau annoté.
 * Fusionne image de fond, contours ZMS, flèches et marqueurs sur un canvas HTML2D.
 */
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../constants/niveauxLegend";

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Impossible de charger : ${src}`));
        img.src = src;
    });
}

function drawContours(ctx, contourPaths, w, h) {
    contourPaths.forEach((path) => {
        if (!path.closed || path.points.length < 3) return;

        const pts = path.points.map((p) => ({
            x: (p.x / 100) * w,
            y: (p.y / 100) * h,
        }));

        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.strokeWidth ?? 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.setLineDash(path.strokeStyle === "dashed" ? [8, 5] : []);

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.stroke();

        if (path.fillColor && path.fillColor !== "transparent") {
            ctx.globalAlpha = path.fillOpacity ?? 0.25;
            ctx.fillStyle = path.fillColor;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Label centré
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        ctx.setLineDash([]);
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.strokeText("Zone de mise en sûreté", cx, cy);
        ctx.fillStyle = path.color;
        ctx.fillText("Zone de mise en sûreté", cx, cy);

        ctx.setLineDash([]);
    });
}

function drawArrow(ctx, item, symbol, w, h) {
    const x1 = (item.startX / 100) * w;
    const y1 = (item.startY / 100) * h;
    const x2 = (item.endX / 100) * w;
    const y2 = (item.endY / 100) * h;
    const color = symbol?.color ?? "#EA580C";
    const strokeWidth = symbol?.strokeWidth ?? 3;
    const arrowLen = 16;
    const arrowAngle = Math.PI / 6;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const shorten = arrowLen * 0.8;

    ctx.globalAlpha = item.opacity ?? 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.setLineDash([]);

    // Ligne (raccourcie pour ne pas chevaucher la pointe)
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(
        x2 - shorten * Math.cos(angle),
        y2 - shorten * Math.sin(angle)
    );
    ctx.stroke();

    // Pointe de flèche
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowLen * Math.cos(angle - arrowAngle),
        y2 - arrowLen * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        x2 - arrowLen * Math.cos(angle + arrowAngle),
        y2 - arrowLen * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();

    // Numéro au milieu
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const r = 10;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.fillText(String(item.numero), mx, my);
}

function drawMarqueur(ctx, item, symbol, w, h) {
    const x = (item.x / 100) * w;
    const y = (item.y / 100) * h;
    const color = symbol?.color ?? "#16A34A";
    const r = 12;

    ctx.globalAlpha = item.opacity ?? 1;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(String(item.numero), x, y);

    if (item.label) {
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeText(item.label, x, y + r + 4);
        ctx.fillStyle = color;
        ctx.fillText(item.label, x, y + r + 4);
    }

    ctx.globalAlpha = 1;
}

function drawTexte(ctx, item, symbol, w, h) {
    const x = (item.x / 100) * w;
    const y = (item.y / 100) * h;
    const color = symbol?.color ?? "#FFFF00";
    const fontSize = item.fontSize ?? 14;
    const text = item.label || symbol?.label;
    if (!text) return;

    ctx.globalAlpha = item.opacity ?? 1;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
}

/**
 * Génère un PNG du niveau annoté et déclenche son téléchargement.
 * @param {object} niveau - niveau actif (image, legendItems, contourPaths)
 * @param {object} project - infos projet (schoolName, name)
 * @returns {Promise<void>}
 */
export async function exportNiveauToPng(niveau, project) {
    if (!niveau?.image?.src) return;

    const bgImage = await loadImage(niveau.image.src);
    const w = niveau.image.naturalWidth;
    const h = niveau.image.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bgImage, 0, 0, w, h);

    drawContours(ctx, niveau.contourPaths ?? [], w, h);

    const items = niveau.legendItems ?? [];
    items.forEach((item) => {
        const symbol = getNiveauSymbolByKey(item.symbolKey);
        if (item.type === NIVEAUX_ELEMENT_TYPES.FLECHE) {
            drawArrow(ctx, item, symbol, w, h);
        } else if (item.type === NIVEAUX_ELEMENT_TYPES.MARQUEUR_PHOTO) {
            drawMarqueur(ctx, item, symbol, w, h);
        } else if (item.type === NIVEAUX_ELEMENT_TYPES.TEXTE) {
            drawTexte(ctx, item, symbol, w, h);
        }
    });

    const niveauNom = niveau.nom || "niveau";
    const ecole = project?.schoolName || project?.name || "ecole";
    const slug = `${ecole}-${niveauNom}`
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "_")
        .replace(/_+/g, "_")
        .slice(0, 60);
    const fileName = `plan-niveaux-${slug}.png`;

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
