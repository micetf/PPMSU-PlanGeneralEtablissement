/**
 * @fileoverview Export PNG d'un niveau annoté.
 * Fusionne image de fond, contours ZMS, flèches polylignes, photos et annotations.
 */
import { getNiveauSymbolByKey, NIVEAUX_ELEMENT_TYPES } from "../constants/niveauxLegend";

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Impossible de charger l'image`));
        img.src = src;
    });
}

function drawContours(ctx, contourPaths, w, h, ox = 0, oy = 0) {
    contourPaths.forEach((path) => {
        if (!path.closed || path.points.length < 3) return;

        const pts = path.points.map((p) => ({
            x: (p.x / 100) * w + ox,
            y: (p.y / 100) * h + oy,
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

        ctx.setLineDash([]);
    });
}

function drawArrow(ctx, item, symbol, w, h, ox = 0, oy = 0) {
    // Support ancien format startX/Y endX/Y
    const rawPts = item.points ?? (
        item.startX !== undefined
            ? [{ x: item.startX, y: item.startY }, { x: item.endX, y: item.endY }]
            : []
    );

    if (rawPts.length < 2) return;

    const pts = rawPts.map((p) => ({
        x: (p.x / 100) * w + ox,
        y: (p.y / 100) * h + oy,
    }));

    const color = item.color ?? symbol?.color ?? "#EA580C";
    const strokeWidth = item.strokeWidth ?? symbol?.strokeWidth ?? 3;
    const arrowLen = 16;
    const arrowAngle = Math.PI / 6;

    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    const shorten = arrowLen * 0.75;

    ctx.globalAlpha = item.opacity ?? 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);

    // Polyligne (raccourcie au bout pour la pointe)
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    pts.slice(1, -1).forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(
        last.x - shorten * Math.cos(angle),
        last.y - shorten * Math.sin(angle)
    );
    ctx.stroke();

    // Pointe de flèche
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(
        last.x - arrowLen * Math.cos(angle - arrowAngle),
        last.y - arrowLen * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
        last.x - arrowLen * Math.cos(angle + arrowAngle),
        last.y - arrowLen * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
}

function drawPhoto(ctx, item, photoImg, w, h, ox = 0, oy = 0) {
    const cx = (item.x / 100) * w + ox;
    const cy = (item.y / 100) * h + oy;
    const renderWidth = ((item.widthPct ?? 25) / 100) * w;
    const ar = item.aspectRatio ?? (photoImg.naturalHeight / photoImg.naturalWidth);
    const renderHeight = renderWidth * ar;
    const rotation = ((item.rotation ?? 0) * Math.PI) / 180;

    ctx.save();
    ctx.globalAlpha = item.opacity ?? 1;
    ctx.translate(cx, cy);
    if (rotation) ctx.rotate(rotation);
    ctx.drawImage(photoImg, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();
}

function drawTexte(ctx, item, symbol, w, h, ox = 0, oy = 0) {
    const x = (item.x / 100) * w + ox;
    const y = (item.y / 100) * h + oy;
    const color = item.color ?? symbol?.color ?? "#FFFF00";
    const fontSize = item.fontSize ?? item.width ?? 14;
    const text = item.label || symbol?.label;
    if (!text) return;

    ctx.save();
    ctx.translate(x, y);
    if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);

    ctx.globalAlpha = item.opacity ?? 1;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);

    ctx.restore();
}

/**
 * Génère un PNG du niveau annoté et déclenche son téléchargement.
 * Le canvas est agrandi pour inclure les photos placées hors du plan.
 * @param {object} niveau - niveau actif
 * @param {object} project - infos projet
 */
export async function exportNiveauToPng(niveau, project) {
    if (!niveau?.image?.src) return;

    const bgImage = await loadImage(niveau.image.src);
    const w = niveau.image.naturalWidth;
    const h = niveau.image.naturalHeight;
    const rotation = niveau.rotation ?? 0;

    // Précharger les photos
    const photoItems = (niveau.legendItems ?? []).filter(
        (item) => item.type === NIVEAUX_ELEMENT_TYPES.PHOTO
    );
    const photoImgs = new Map();
    for (const item of photoItems) {
        const photo = (niveau.photos ?? []).find((p) => p.id === item.photoId);
        if (photo?.src) {
            try {
                photoImgs.set(item.photoId, await loadImage(photo.src));
            } catch {
                // photo ignorée
            }
        }
    }

    // Calculer les limites du contenu (espace image + photos éventuelles)
    let minX = 0, minY = 0, maxX = w, maxY = h;
    for (const item of photoItems) {
        const pImg = photoImgs.get(item.photoId);
        if (!pImg) continue;
        const cx = (item.x / 100) * w;
        const cy = (item.y / 100) * h;
        const pw = ((item.widthPct ?? 25) / 100) * w;
        const ar = item.aspectRatio ?? pImg.naturalHeight / pImg.naturalWidth;
        const ph = pw * ar;
        const margin = 16;
        minX = Math.min(minX, cx - pw / 2 - margin);
        minY = Math.min(minY, cy - ph / 2 - margin);
        maxX = Math.max(maxX, cx + pw / 2 + margin);
        maxY = Math.max(maxY, cy + ph / 2 + margin);
    }

    // Offset pour ramener minX/minY à 0
    const ox = -minX;
    const oy = -minY;
    const contentW = maxX - minX;
    const contentH = maxY - minY;

    // Pour les rotations 90°/270°, les dimensions du canvas permutent
    const isTransposed = rotation === 90 || rotation === 270;
    const cw = isTransposed ? contentH : contentW;
    const ch = isTransposed ? contentW : contentH;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cw);
    canvas.height = Math.round(ch);
    const ctx = canvas.getContext("2d");

    // Fond blanc (pour les zones hors image)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cw, ch);

    // Transformation de rotation centrée sur le contenu
    if (rotation !== 0) {
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-contentW / 2, -contentH / 2);
    }

    // Image de fond (à l'offset calculé)
    ctx.drawImage(bgImage, ox, oy, w, h);

    // Contours ZMS
    drawContours(ctx, niveau.contourPaths ?? [], w, h, ox, oy);

    // Éléments de légende
    const items = niveau.legendItems ?? [];
    for (const item of items) {
        const symbol = getNiveauSymbolByKey(item.symbolKey);
        if (item.type === NIVEAUX_ELEMENT_TYPES.FLECHE) {
            drawArrow(ctx, item, symbol, w, h, ox, oy);
        } else if (item.type === NIVEAUX_ELEMENT_TYPES.PHOTO) {
            const pImg = photoImgs.get(item.photoId);
            if (pImg) drawPhoto(ctx, item, pImg, w, h, ox, oy);
        } else if (item.type === NIVEAUX_ELEMENT_TYPES.TEXTE) {
            drawTexte(ctx, item, symbol, w, h, ox, oy);
        }
    }

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
