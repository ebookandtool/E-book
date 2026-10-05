(function() {
    const allowedDomain = "digital-book-portal.netlify.app"; 
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(allowedDomain)) {
        document.body.innerHTML = "<h2 style='color:red; text-align:center; margin-top:50px;'>Access Denied: Unauthorized Domain</h2>";
        throw new Error("Unauthorized Domain Execution");
    }
})();

const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const scale = Math.max(window.devicePixelRatio || 1, 1);
const displayWidth = 600;
const displayHeight = 600;

canvas.width = displayWidth * scale;
canvas.height = displayHeight * scale;
ctx.scale(scale, scale);

const width = displayWidth;
const height = displayHeight;

let xMin = -5, xMax = 5;
let yMin = -5, yMax = 5;
let graphColor = '#007bff';
let gridColor = '#28a745';

let isDragging = false;
let startX, startY;
let initialTouchDist = null;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    let dx = e.clientX - startX;
    let dy = e.clientY - startY;
    startX = e.clientX;
    startY = e.clientY;
    panGraph(dx, dy);
});

canvas.addEventListener('mouseup', () => { isDragging = false; });
canvas.addEventListener('mouseleave', () => { isDragging = false; });

canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        initialTouchDist = getTouchDistance(e.touches);
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging && e.touches.length === 1) {
        let dx = e.touches[0].clientX - startX;
        let dy = e.touches[0].clientY - startY;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        panGraph(dx, dy);
    } else if (e.touches.length === 2 && initialTouchDist !== null) {
        let currentDist = getTouchDistance(e.touches);
        let factor = initialTouchDist / currentDist;
        if (Math.abs(factor - 1) > 0.01) {
            let zoomIntensity = 1 + (factor - 1) * 0.3;
            applyZoom(zoomIntensity);
            initialTouchDist = currentDist;
        }
    }
}, { passive: false });

canvas.addEventListener('touchend', () => {
    isDragging = false;
    initialTouchDist = null;
});

function getTouchDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX;
    let dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function panGraph(dx, dy) {
    let xSpan = xMax - xMin;
    let ySpan = yMax - yMin;
    let xChange = (dx / width) * xSpan;
    let yChange = (dy / height) * ySpan;
    xMin -= xChange;
    xMax -= xChange;
    yMin += yChange;
    yMax += yChange;
    requestAnimationFrame(plotGraph);
}

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    let zoomFactor = e.deltaY < 0 ? 0.95 : 1.05;
    applyZoom(zoomFactor);
}, { passive: false });

function applyZoom(zoomFactor) {
    let xSpan = xMax - xMin;
    let ySpan = yMax - yMin;
    let xCenter = (xMin + xMax) / 2;
    let yCenter = (yMin + yMax) / 2;
    let newXSpan = xSpan * zoomFactor;
    let newYSpan = ySpan * zoomFactor;
    
    if (newXSpan > 0.5 && newXSpan < 1000) {
        xMin = xCenter - newXSpan / 2;
        xMax = xCenter + newXSpan / 2;
        yMin = yCenter - newYSpan / 2;
        yMax = yCenter + newYSpan / 2;
        document.getElementById('rangeInput').value = Math.round((xMax - xMin) / 2);
        requestAnimationFrame(plotGraph);
    }
}

function openPrintModal() { window.print(); }
function toggleFormulaModal() {
    const modal = document.getElementById('formulaModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}
function selectFormula(eq) {
    document.getElementById('equationInput').value = eq;
    toggleFormulaModal();
    plotGraph();
}
function applyQuickFormula(eq) {
    document.getElementById('equationInput').value = eq;
    plotGraph();
}
function switchTab(tabNumber) {
    document.getElementById('kbTab1').style.display = 'none';
    document.getElementById('kbTab2').style.display = 'none';
    document.getElementById('kbTab3').style.display = 'none';
    document.getElementById('tab1Btn').classList.remove('active');
    document.getElementById('tab2Btn').classList.remove('active');
    document.getElementById('tab3Btn').classList.remove('active');
    document.getElementById('kbTab' + tabNumber).style.display = 'grid';
    document.getElementById('tab' + tabNumber + 'Btn').classList.add('active');
}
function switchSettingsTab(tabName) {
    const gridSub = document.getElementById('gridSettingsSubPanel');
    const axisSub = document.getElementById('axisSettingsSubPanel');
    const colorSub = document.getElementById('colorSettingsSubPanel');
    const gridBtn = document.getElementById('gridTabBtn');
    const axisBtn = document.getElementById('axisTabBtn');
    const colorBtn = document.getElementById('colorTabBtn');

    gridSub.style.display = 'none'; axisSub.style.display = 'none'; colorSub.style.display = 'none';
    gridBtn.classList.remove('active'); axisBtn.classList.remove('active'); colorBtn.classList.remove('active');

    if (tabName === 'grid') { gridSub.style.display = 'flex'; gridBtn.classList.add('active'); }
    else if (tabName === 'axis') { axisSub.style.display = 'flex'; axisBtn.classList.add('active'); }
    else if (tabName === 'color') { colorSub.style.display = 'flex'; colorBtn.classList.add('active'); }
}
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    const kb = document.getElementById('mathKeyboard');
    const quickStrip = document.getElementById('quickFormulaStrip');
    const btn = document.getElementById('toggleKbBtn');
    const status = document.getElementById('kbStatus');

    kb.style.display = 'none'; quickStrip.style.display = 'flex';
    btn.innerText = 'कीबोर्ड दिखाएं'; status.innerText = 'बंद';

    if (panel.style.display === 'flex') { panel.style.display = 'none'; }
    else { panel.style.display = 'flex'; switchSettingsTab('grid'); }
}
function changeGraphColor(color) { graphColor = color; plotGraph(); }
function changeGridColor(color) { gridColor = color; plotGraph(); }
function updateRange() {
    let val = parseFloat(document.getElementById('rangeInput').value);
    if (val && val > 0) {
        xMax = val; xMin = -val; yMax = val; yMin = -val;
        plotGraph();
    }
}
function toggleKeyboard() {
    const kb = document.getElementById('mathKeyboard');
    const quickStrip = document.getElementById('quickFormulaStrip');
    const btn = document.getElementById('toggleKbBtn');
    const status = document.getElementById('kbStatus');
    if (kb.style.display === 'none') {
        kb.style.display = 'block'; quickStrip.style.display = 'none';
        btn.innerText = 'कीबोर्ड छुपाएं'; status.innerText = 'चालू';
    } else {
        kb.style.display = 'none'; quickStrip.style.display = 'flex';
        btn.innerText = 'कीबोर्ड दिखाएं'; status.innerText = 'बंद';
    }
}
function insertAtCursor(text) {
    const input = document.getElementById('equationInput');
    let start = input.selectionStart, end = input.selectionEnd, val = input.value;
    input.value = val.substring(0, start) + text + val.substring(end);
    input.focus();
    input.setSelectionRange(start + text.length, start + text.length);
    plotGraph();
}
function deleteChar() {
    const input = document.getElementById('equationInput');
    let start = input.selectionStart, end = input.selectionEnd, val = input.value;
    if (start > 0 || start !== end) {
        if (start === end) start--;
        input.value = val.substring(0, start) + val.substring(end);
        input.focus();
        input.setSelectionRange(start, start);
        plotGraph();
    }
}
function toScreenX(x) { return ((x - xMin) / (xMax - xMin)) * width; }
function toScreenY(y) { return height - ((y - yMin) / (yMax - yMin)) * height; }

function drawArrow(x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.lineTo(-size * 1.5, -size * 0.75);
    ctx.lineTo(-size * 1.5, size * 0.75);
    ctx.closePath();
    ctx.fillStyle = gridColor; ctx.fill();
    ctx.restore();
}

function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    let rangeSpan = xMax - xMin;
    let rawStep = rangeSpan / 10;
    let magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    let residual = rawStep / magnitude;
    let mainStep = magnitude;
    if (residual > 5) mainStep = 10 * magnitude;
    else if (residual > 2) mainStep = 5 * magnitude;
    else if (residual > 1) mainStep = 2 * magnitude;

    let subStep = mainStep / 10;
    let showMain = document.getElementById('showMainGrid').checked;
    let showSub = document.getElementById('showSubGrid').checked;
    let showAxisLabels = document.getElementById('showAxisLabels').checked;
    let showAxisArrows = document.getElementById('showAxisArrows').checked;

    let isHorizLine = document.getElementById('modeHorizLine').checked;
    let isVertLine = document.getElementById('modeVertLine').checked;

    let mainGridThick = parseFloat(document.getElementById('mainGridThickness').value);
    let axisThick = parseFloat(document.getElementById('axisThickness').value);
    let subGridThick = parseFloat(document.getElementById('subGridThickness').value);
    let labelSize = parseInt(document.getElementById('labelFontSize').value);
    let axisLabelSize = parseInt(document.getElementById('axisLabelSize').value);
    let arrowSize = parseFloat(document.getElementById('arrowSize').value);

    let originX = toScreenX(0), originY = toScreenY(0);

    if (showSub && !isHorizLine && !isVertLine) {
        ctx.strokeStyle = gridColor; ctx.globalAlpha = 0.35; ctx.lineWidth = subGridThick;
        for (let x = Math.ceil(xMin / subStep) * subStep; x <= xMax; x += subStep) {
            let sx = toScreenX(x);
            ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, height); ctx.stroke();
        }
        for (let y = Math.ceil(yMin / subStep) * subStep; y <= yMax; y += subStep) {
            let sy = toScreenY(y);
            ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(width, sy); ctx.stroke();
        }
    }

    if (showMain) {
        ctx.strokeStyle = gridColor; ctx.globalAlpha = 0.65; ctx.lineWidth = mainGridThick;
        for (let x = Math.ceil(xMin / mainStep) * mainStep; x <= xMax; x += mainStep) {
            let sx = toScreenX(x);
            if (!isHorizLine) { ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, height); ctx.stroke(); }
            else { ctx.beginPath(); ctx.moveTo(sx, originY - 6); ctx.lineTo(sx, originY + 6); ctx.stroke(); }
            if (labelSize > 0) {
                ctx.globalAlpha = 1.0; ctx.fillStyle = gridColor; ctx.font = `bold ${labelSize}px Arial`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                ctx.fillText(Number(x.toFixed(4)), sx, isHorizLine ? originY + 8 : toScreenY(0) + 5);
                ctx.globalAlpha = 0.65;
            }
        }
        for (let y = Math.ceil(yMin / mainStep) * mainStep; y <= yMax; y += mainStep) {
            let sy = toScreenY(y);
            if (!isVertLine) { ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(width, sy); ctx.stroke(); }
            else { ctx.beginPath(); ctx.moveTo(originX - 6, sy); ctx.lineTo(originX + 6, sy); ctx.stroke(); }
            if (labelSize > 0) {
                ctx.globalAlpha = 1.0; ctx.fillStyle = gridColor; ctx.font = `bold ${labelSize}px Arial`;
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(Number(y.toFixed(4)), isVertLine ? originX + 10 : toScreenX(0) + 5, sy);
                ctx.globalAlpha = 0.65;
            }
        }
    }

    ctx.globalAlpha = 1.0; ctx.strokeStyle = gridColor; ctx.lineWidth = axisThick;
    if (!isVertLine) {
        ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY); ctx.stroke();
        if (showAxisArrows) { drawArrow(width - 2, originY, 0, arrowSize); drawArrow(2, originY, Math.PI, arrowSize); }
        if (showAxisLabels && axisLabelSize > 0) {
            ctx.fillStyle = gridColor; ctx.font = `bold ${axisLabelSize}px Arial`;
            ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText('X', width - 12, originY + 6);
            ctx.textAlign = 'left'; ctx.fillText('-X', 12, originY + 6);
        }
    }
    if (!isHorizLine) {
        ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height); ctx.stroke();
        if (showAxisArrows) { drawArrow(originX, 2, -Math.PI / 2, arrowSize); drawArrow(originX, height - 2, Math.PI / 2, arrowSize); }
        if (showAxisLabels && axisLabelSize > 0) {
            ctx.fillStyle = gridColor; ctx.font = `bold ${axisLabelSize}px Arial`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('Y', originX + 8, 8);
            ctx.fillText('-Y', originX + 8, height - 22);
        }
    }
}

function smartParse(raw) {
    let eq = raw.trim().toLowerCase();
    eq = eq.replace(/mod\s+x/gi, 'abs(x)').replace(/mod\s*\(([^)]+)\)/gi, 'abs($1)').replace(/modx/gi, 'abs(x)');
    eq = eq.replace(/\bcos\s*\(([^)]+)\)/gi, 'Math.cos($1)').replace(/\bsin\s*\(([^)]+)\)/gi, 'Math.sin($1)').replace(/\btan\s*\(([^)]+)\)/gi, 'Math.tan($1)');
    eq = eq.replace(/\blog\s*\(([^)]+)\)/gi, 'Math.log($1)').replace(/\bsqrt\s*\(([^)]+)\)/gi, 'Math.sqrt($1)').replace(/\babs\s*\(([^)]+)\)/gi, 'Math.abs($1)');
    eq = eq.replace(/\s+/g, '').replace(/\|([^|]+)\|/g, 'abs($1)').replace(/²/g, '**2').replace(/³/g, '**3');
    eq = eq.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'Math.PI').replace(/pi/g, 'Math.PI');
    eq = eq.replace(/(\d)([a-zA-Z(])/g, '$1*$2').replace(/(\))([a-zA-Z0-9(])/g, '$1*$2');
    return eq;
}

function plotGraph() {
    drawGrid();
    let rawEq = document.getElementById('equationInput').value.trim();
    if (!rawEq) return;
    let userLineThick = parseFloat(document.getElementById('graphLineThickness').value);
    ctx.strokeStyle = graphColor; ctx.lineWidth = userLineThick; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    let cleanCheck = rawEq.replace(/\s+/g, '').toLowerCase();

    if (cleanCheck.includes('x²') && cleanCheck.includes('y²') && cleanCheck.includes('+') && cleanCheck.includes('/') && cleanCheck.includes('=')) {
        let parts = cleanCheck.split('=');
        let rhsVal = parseFloat(parts[1]) || 1;
        let leftParts = parts[0].split('+');
        let aSq = 0, bSq = 0;
        leftParts.forEach(part => {
            if (part.includes('x²')) aSq = parseFloat(part.split('/')[1]);
            else if (part.includes('y²')) bSq = parseFloat(part.split('/')[1]);
        });
        if (!isNaN(aSq) && !isNaN(bSq) && aSq > 0 && bSq > 0) {
            let a = Math.sqrt(aSq * rhsVal), b = Math.sqrt(bSq * rhsVal);
            ctx.beginPath();
            let isFirst = true;
            for (let t = 0; t <= 2 * Math.PI + 0.1; t += 0.005) {
                let x = a * Math.cos(t), y = b * Math.sin(t);
                let sx = toScreenX(x), sy = toScreenY(y);
                if (isFirst) { ctx.moveTo(sx, sy); isFirst = false; } else { ctx.lineTo(sx, sy); }
            }
            ctx.stroke(); return;
        }
    }

    let isCircle = false, h = 0, k = 0, r = 0;
    if (cleanCheck.includes('=') && cleanCheck.includes('x') && cleanCheck.includes('y') && cleanCheck.includes('+') && !cleanCheck.includes('/')) {
        let parts = cleanCheck.split('=');
        let lhs = parts[0], rhs = parseFloat(parts[1]);
        if (!isNaN(rhs) && rhs > 0 && lhs.includes('x') && lhs.includes('y') && (lhs.includes('2') || lhs.includes('²'))) {
            r = Math.sqrt(rhs); isCircle = true;
            if (lhs.includes('x-')) { let m = lhs.match(/x-([\d.]+)/); if (m) h = parseFloat(m[1]); }
            else if (lhs.includes('x+')) { let m = lhs.match(/x\+([\d.]+)/); if (m) h = -parseFloat(m[1]); }
            if (lhs.includes('y-')) { let m = lhs.match(/y-([\d.]+)/); if (m) k = parseFloat(m[1]); }
            else if (lhs.includes('y+')) { let m = lhs.match(/y\+([\d.]+)/); if (m) k = -parseFloat(m[1]); }
        }
    }
    if (isCircle) {
        ctx.beginPath();
        let isFirst = true;
        for (let t = 0; t <= 2 * Math.PI + 0.1; t += 0.002) {
            let x = h + r * Math.cos(t), y = k + r * Math.sin(t);
            let sx = toScreenX(x), sy = toScreenY(y);
            if (isFirst) { ctx.moveTo(sx, sy); isFirst = false; } else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke(); return;
    }

    if (cleanCheck.includes('=')) {
        let parts = rawEq.split('=');
        let lhs = parts[0].trim().toLowerCase(), rhs = parts[1].trim();
        let exprY = '';
        if (lhs === 'x²' || lhs === 'x**2' || lhs === 'x^2') {
            let parsedRhs = smartParse(rhs);
            let numPart = parsedRhs.replace(/\*?y/g, '').trim() || '1';
            exprY = `(x**2) / (${numPart})`;
        } else if (lhs === 'y' || lhs === '-y') {
            exprY = smartParse(rhs);
            if (lhs === '-y') exprY = `-(${exprY})`;
        }
        if (exprY !== '') {
            let func = new Function('x', 'Math', `try { return (${exprY}); } catch(e) { return NaN; }`);
            ctx.beginPath();
            let isDrawing = false, prevY = null;
            for (let px = 0; px <= width; px += 0.2) {
                let x = xMin + (px / width) * (xMax - xMin);
                let y = func(x, Math);
                if (!isNaN(y) && isFinite(y)) {
                    if (prevY !== null && Math.abs(y - prevY) > (yMax - yMin) * 3) isDrawing = false;
                    prevY = y;
                    let sx = toScreenX(x), sy = toScreenY(y);
                    if (sy >= -height * 0.5 && sy <= height * 1.5) {
                        if (!isDrawing) { ctx.moveTo(sx, sy); isDrawing = true; } else { ctx.lineTo(sx, sy); }
                    } else { isDrawing = false; }
                } else { isDrawing = false; prevY = null; }
            }
            ctx.stroke(); return;
        }
    }

    if (cleanCheck.includes('/') && cleanCheck.includes('+') && cleanCheck.includes('=')) {
        let parts = rawEq.split('=');
        let rhsVal = parseFloat(parts[1]) || 1;
        let terms = parts[0].split('+');
        let a = 0, b = 0;
        terms.forEach(term => {
            if (term.includes('x')) a = parseFloat(term.split('/')[1]);
            else if (term.includes('y')) b = parseFloat(term.split('/')[1]);
        });
        if (!isNaN(a) && !isNaN(b) && a !== 0 && b !== 0) {
            let xStart = xMin, yStart = b * rhsVal * (1 - xStart / (a * rhsVal));
            let xEnd = xMax, yEnd = b * rhsVal * (1 - xEnd / (a * rhsVal));
            ctx.beginPath();
            ctx.moveTo(toScreenX(xStart), toScreenY(yStart));
            ctx.lineTo(toScreenX(xEnd), toScreenY(yEnd));
            ctx.stroke(); return;
        }
    }

    let eq = rawEq.includes('=') ? `(${smartParse(rawEq.split('=')[0])}) - (${smartParse(rawEq.split('=')[1])})` : smartParse(rawEq);
    let evalFunc = new Function('x', 'y', 'Math', `return ${eq};`);
    let rangeSpan = xMax - xMin, tolerance = (rangeSpan / width) * 1.0;
    ctx.beginPath();
    let isDrawingImplicit = false;
    for (let py = 0; py <= height; py += 1.0) {
        let y = yMin + ((height - py) / height) * (yMax - yMin);
        for (let px = 0; px <= width; px += 1.0) {
            let x = xMin + (px / width) * (xMax - xMin);
            try {
                let val = evalFunc(x, y, Math);
                if (!isNaN(val) && Math.abs(val) < tolerance) {
                    let sx = toScreenX(x), sy = toScreenY(y);
                    if (!isDrawingImplicit) { ctx.moveTo(sx, sy); isDrawingImplicit = true; }
                    else { ctx.lineTo(sx, sy); }
                }
            } catch (err) {}
        }
    }
    ctx.stroke();
}

window.onload = function() { plotGraph(); };