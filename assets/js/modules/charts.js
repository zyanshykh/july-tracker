/**
 * Tiny dependency-free SVG charts.
 * Colors come from CSS classes in components.css so they follow the light/dark theme.
 */
const NS = 'http://www.w3.org/2000/svg';

function svgEl(name, attrs = {}, text) {
    const el = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (text !== undefined) el.textContent = text;
    return el;
}

function emptyState(container, message) {
    container.replaceChildren();
    const p = document.createElement('p');
    p.className = 'empty-text';
    p.textContent = message;
    container.appendChild(p);
}

/**
 * Vertical bar chart.
 * items: [{ label: 'Oct', value: 120 }]
 * opts:  { format: n => string, emptyMessage: string, ariaLabel: string }
 */
export function barChart(container, items, opts = {}) {
    if (!container) return;
    const format = opts.format || (n => String(n));
    const max = Math.max(0, ...items.map(i => i.value));

    if (!items.length || max === 0) {
        emptyState(container, opts.emptyMessage || 'No data yet.');
        return;
    }

    const W = 420, H = 220;
    const pad = { top: 24, right: 12, bottom: 32, left: 12 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;
    const slot = plotW / items.length;
    const barW = Math.min(44, slot * 0.6);

    const svg = svgEl('svg', {
        viewBox: `0 0 ${W} ${H}`,
        class: 'chart-svg',
        role: 'img',
        'aria-label': opts.ariaLabel || 'Bar chart'
    });

    svg.appendChild(svgEl('line', {
        x1: pad.left, x2: W - pad.right,
        y1: H - pad.bottom, y2: H - pad.bottom,
        class: 'chart-axis'
    }));

    items.forEach((item, i) => {
        const h = Math.max(item.value > 0 ? 3 : 0, (item.value / max) * plotH);
        const x = pad.left + slot * i + (slot - barW) / 2;
        const y = H - pad.bottom - h;

        const bar = svgEl('rect', { x, y, width: barW, height: h, rx: 4, class: 'chart-bar' });
        bar.appendChild(svgEl('title', {}, `${item.label}: ${format(item.value)}`));
        svg.appendChild(bar);

        if (item.value > 0) {
            svg.appendChild(svgEl('text', {
                x: x + barW / 2, y: y - 6, 'text-anchor': 'middle', class: 'chart-value'
            }, format(item.value)));
        }

        svg.appendChild(svgEl('text', {
            x: x + barW / 2, y: H - pad.bottom + 18, 'text-anchor': 'middle', class: 'chart-label'
        }, item.label));
    });

    container.replaceChildren(svg);
}

/**
 * Donut chart with a legend.
 * items: [{ label: 'Paid', value: 300, cls: 'seg-paid' }]
 * opts:  { format: n => string, centerLabel: string, emptyMessage: string }
 */
export function donutChart(container, items, opts = {}) {
    if (!container) return;
    const format = opts.format || (n => String(n));
    const total = items.reduce((s, i) => s + i.value, 0);

    if (total <= 0) {
        emptyState(container, opts.emptyMessage || 'No data yet.');
        return;
    }

    const size = 180, r = 66, stroke = 26;
    const c = 2 * Math.PI * r;

    const svg = svgEl('svg', {
        viewBox: `0 0 ${size} ${size}`,
        class: 'chart-svg chart-donut',
        role: 'img',
        'aria-label': opts.ariaLabel || 'Donut chart'
    });

    svg.appendChild(svgEl('circle', {
        cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': stroke, class: 'donut-track'
    }));

    let offset = 0;
    items.filter(i => i.value > 0).forEach(item => {
        const len = (item.value / total) * c;
        const seg = svgEl('circle', {
            cx: size / 2, cy: size / 2, r, fill: 'none', 'stroke-width': stroke,
            'stroke-dasharray': `${len} ${c - len}`,
            'stroke-dashoffset': -offset,
            transform: `rotate(-90 ${size / 2} ${size / 2})`,
            class: `donut-seg ${item.cls || ''}`
        });
        seg.appendChild(svgEl('title', {}, `${item.label}: ${format(item.value)}`));
        svg.appendChild(seg);
        offset += len;
    });

    svg.appendChild(svgEl('text', {
        x: size / 2, y: size / 2 - 2, 'text-anchor': 'middle', class: 'chart-center-value'
    }, format(total)));
    svg.appendChild(svgEl('text', {
        x: size / 2, y: size / 2 + 16, 'text-anchor': 'middle', class: 'chart-label'
    }, opts.centerLabel || 'Total'));

    const legend = document.createElement('ul');
    legend.className = 'chart-legend';
    items.forEach(item => {
        const li = document.createElement('li');
        const dot = document.createElement('span');
        dot.className = `legend-dot ${item.cls || ''}`;
        const text = document.createElement('span');
        text.textContent = `${item.label}: ${format(item.value)}`;
        li.append(dot, text);
        legend.appendChild(li);
    });

    const wrap = document.createElement('div');
    wrap.className = 'donut-wrap';
    wrap.append(svg, legend);
    container.replaceChildren(wrap);
}
