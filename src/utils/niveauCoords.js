/**
 * Converts a mouse event position to image-space percentage coordinates,
 * accounting for pan, zoom, and rotation of the niveau canvas.
 *
 * @param {MouseEvent} e
 * @param {object} niveau - active niveau (image, rotation)
 * @param {{ zoom:number, panOffset:{x:number,y:number} }} ui
 * @returns {{ x:number, y:number }|null} coords in 0–100 range, or null
 */
export function eventToNiveauPct(e, niveau, ui) {
    if (!niveau?.image?.src) return null;
    const rect = e.currentTarget.getBoundingClientRect();
    const { zoom, panOffset } = ui;
    const { naturalWidth, naturalHeight } = niveau.image;
    const imgW = naturalWidth * zoom;
    const imgH = naturalHeight * zoom;

    // Click position relative to canvas top-left
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Image container center in canvas space
    const centerX = panOffset.x + imgW / 2;
    const centerY = panOffset.y + imgH / 2;

    const rotation = niveau.rotation ?? 0;
    if (rotation === 0) {
        const imgX = cx - panOffset.x;
        const imgY = cy - panOffset.y;
        return {
            x: (imgX / imgW) * 100,
            y: (imgY / imgH) * 100,
        };
    }

    // Inverse-rotate the click around the image center
    const r = (rotation * Math.PI) / 180;
    const dx = cx - centerX;
    const dy = cy - centerY;
    const imgDX = dx * Math.cos(r) + dy * Math.sin(r);
    const imgDY = -dx * Math.sin(r) + dy * Math.cos(r);

    return {
        x: ((imgDX + imgW / 2) / imgW) * 100,
        y: ((imgDY + imgH / 2) / imgH) * 100,
    };
}

/**
 * Checks whether a click is near the first point of a contour path,
 * accounting for pan, zoom and rotation.
 */
export function isNearFirstPointRotated(e, firstPoint, niveau, ui, snapRadiusPx = 12) {
    if (!niveau?.image?.src) return false;
    const rect = e.currentTarget.getBoundingClientRect();
    const { zoom, panOffset } = ui;
    const { naturalWidth, naturalHeight } = niveau.image;
    const imgW = naturalWidth * zoom;
    const imgH = naturalHeight * zoom;
    const rotation = niveau.rotation ?? 0;
    const r = (rotation * Math.PI) / 180;

    // First point in image display space (before rotation)
    const fpImgX = (firstPoint.x / 100) * imgW - imgW / 2;
    const fpImgY = (firstPoint.y / 100) * imgH - imgH / 2;
    // Rotate to screen space
    const fpScreenX = fpImgX * Math.cos(r) - fpImgY * Math.sin(r) + panOffset.x + imgW / 2;
    const fpScreenY = fpImgX * Math.sin(r) + fpImgY * Math.cos(r) + panOffset.y + imgH / 2;

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    return Math.hypot(clickX - fpScreenX, clickY - fpScreenY) <= snapRadiusPx;
}
