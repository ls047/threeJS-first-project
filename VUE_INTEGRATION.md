# Solar System — Vue + TypeScript Integration Guide

This document explains how to integrate the Solar System visualization into a Vue 3 + TypeScript project. It covers **both** approaches: using **App.vue** (component-based) and using **main.ts** (entry-point-based).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Copy lib folder and convert to ES modules](#step-1-copy-lib-folder-and-convert-to-es-modules)
3. [Step 2: Copy static assets](#step-2-copy-static-assets)
4. [Step 3: Install dependencies](#step-3-install-dependencies)
5. [Option A: Using App.vue (component-based)](#option-a-using-appvue-component-based)
6. [Option B: Using main.ts (entry-point-based)](#option-b-using-maintsts-entry-point-based)
7. [Asset path configuration](#asset-path-configuration)
8. [Common mistakes to avoid](#common-mistakes-to-avoid)

---

## Prerequisites

- Vue 3 project (created with `npm create vue@latest` or Vue CLI)
- TypeScript enabled (optional but recommended)
- Node.js 18+

---

## Step 1: Copy lib folder and convert to ES modules

Copy the entire `lib/` folder from this project into your Vue project:

```
your-vue-project/
├── src/
│   ├── lib/           ← paste lib/ here
│   │   ├── planets.js
│   │   ├── utils.js
│   │   ├── textures.js
│   │   ├── preload.js
│   │   ├── loader-ui.js
│   │   ├── dialog.js
│   │   └── sketch-scene.js
```

Then convert `require()` to `import` and `module.exports` to `export` in each file.

---

## Step 2: Copy static assets

Copy the asset folders into your Vue project's **public** folder:

```
your-vue-project/
├── public/
│   ├── textures/      ← copy textures from original project
│   │   ├── mercury.jpg
│   │   ├── venus.jpg
│   │   ├── earth.jpg
│   │   ├── mars.jpg
│   │   ├── jupiter.jpg
│   │   ├── saturn.jpg
│   │   ├── saturn_ring.png
│   │   ├── uranus.jpg
│   │   └── neptune.jpg
│   ├── images/
│   │   └── lebron-sunshine.png
│   └── audio/
│       └── Lebron James flashbang.mp3
```

---

## Step 3: Install dependencies

```bash
npm install three
```

No `canvas-sketch` is needed. We implement a minimal render loop ourselves.

---

## Option A: Using App.vue (component-based)

Use this when the Solar System is the main content of your app (e.g. a dedicated route or the root view).

### Directory structure

```
src/
├── App.vue
├── lib/
│   ├── planets.js
│   ├── utils.js
│   ├── textures.js
│   ├── preload.js
│   ├── loader-ui.js
│   ├── dialog.js
│   └── sketch-scene.js
└── components/
    └── SolarSystem.vue   ← new component
```

### Full code for `src/lib/planets.js`

```javascript
export const planets = [
  { name: 'Mercury', radius: 42, size: 8, speed: 0.0040, texture: '/textures/mercury.jpg', tint: '#b7b7b7',
    diameter: '4,879 km', orbitalPeriod: '88 days', distance: '57.9 million km', fact: 'Smallest planet; surface temperature swings from −173°C to 427°C.' },
  { name: 'Venus', radius: 68, size: 11, speed: 0.0032, texture: '/textures/venus.jpg', tint: '#d9b38c',
    diameter: '12,104 km', orbitalPeriod: '225 days', distance: '108.2 million km', fact: 'Hottest planet (~465°C) due to runaway greenhouse effect; thick CO₂ atmosphere.' },
  { name: 'Earth', radius: 96, size: 12, speed: 0.0024, texture: '/textures/earth.jpg', tint: '#4f83ff',
    diameter: '12,742 km', orbitalPeriod: '365.25 days', distance: '149.6 million km (1 AU)', fact: 'Only known planet with liquid water and life.' },
  { name: 'Mars', radius: 124, size: 10, speed: 0.0020, texture: '/textures/mars.jpg', tint: '#c1440e',
    diameter: '6,779 km', orbitalPeriod: '687 days', distance: '227.9 million km', fact: 'Olympus Mons is the largest volcano in the Solar System; two moons: Phobos and Deimos.' },
  { name: 'Jupiter', radius: 160, size: 20, speed: 0.0014, texture: '/textures/jupiter.jpg', tint: '#d2b48c',
    diameter: '139,820 km', orbitalPeriod: '11.9 years', distance: '778.5 million km', fact: 'Largest planet; a gas giant with 79+ moons and the Great Red Spot storm.' },
  { name: 'Saturn', radius: 200, size: 18, speed: 0.0011, texture: '/textures/saturn.jpg', tint: '#e3c27a', ring: true, ringTexture: '/textures/saturn_ring.png',
    diameter: '116,460 km', orbitalPeriod: '29.5 years', distance: '1.43 billion km', fact: 'Visible ring system of ice and rock; less dense than water; 82+ moons.' },
  { name: 'Uranus', radius: 238, size: 15, speed: 0.0008, texture: '/textures/uranus.jpg', tint: '#7ad7f0',
    diameter: '50,724 km', orbitalPeriod: '84 years', distance: '2.87 billion km', fact: 'Ice giant; rotates on its side with an axial tilt of 98°; 27 known moons.' },
  { name: 'Neptune', radius: 276, size: 15, speed: 0.0006, texture: '/textures/neptune.jpg', tint: '#4169e1',
    diameter: '49,244 km', orbitalPeriod: '165 years', distance: '4.50 billion km', fact: 'Farthest planet; methane gives it blue color; supersonic winds up to 2,100 km/h.' }
];
```

### Full code for `src/lib/utils.js`

```javascript
export function hexToRgba(hex, alpha) {
  const v = hex.replace('#', '');
  return `rgba(${parseInt(v.slice(0,2),16)}, ${parseInt(v.slice(2,4),16)}, ${parseInt(v.slice(4,6),16)}, ${alpha})`;
}

export function getResponsiveDialogMetrics() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw <= 768;
  const isSmallMobile = vw <= 520;
  const margin = Math.max(8, Math.min(16, vw * 0.025));
  const width = Math.min(400, vw - margin * 2);
  const maxHeight = vh - margin * 2;
  let previewSize, height;
  if (isSmallMobile) { previewSize = Math.min(120, width - 32); height = Math.min(maxHeight, previewSize + 175); }
  else if (isMobile) { previewSize = Math.min(140, width - 36); height = Math.min(maxHeight, previewSize + 180); }
  else { previewSize = Math.max(120, Math.min(160, width * 0.42)); height = Math.min(maxHeight, Math.max(260, previewSize + 100)); }
  return { vw, vh, isMobile, isSmallMobile, margin, width, height, previewSize };
}

export function applyResponsiveDialogLayout(dialogUI) {
  const { isMobile, width, height, previewSize } = getResponsiveDialogMetrics();
  dialogUI.dialog.style.width = `${width}px`;
  dialogUI.dialog.style.height = `${height}px`;
  dialogUI.dialog.style.padding = isMobile ? '12px' : '16px';
  dialogUI.dialog.style.borderRadius = isMobile ? '14px' : '16px';
  dialogUI.closeButton.style.top = isMobile ? '6px' : '8px';
  dialogUI.closeButton.style.right = isMobile ? '6px' : '8px';
  dialogUI.closeButton.style.width = isMobile ? '28px' : '30px';
  dialogUI.closeButton.style.height = isMobile ? '28px' : '30px';
  dialogUI.closeButton.style.fontSize = isMobile ? '18px' : '20px';
  dialogUI.wrap.style.flexDirection = isMobile ? 'column' : 'row';
  dialogUI.wrap.style.gap = isMobile ? '10px' : '14px';
  dialogUI.previewBox.style.width = dialogUI.previewBox.style.height = `${previewSize}px`;
  dialogUI.previewBox.style.flex = `0 0 ${previewSize}px`;
  dialogUI.previewBox.style.alignSelf = isMobile ? 'center' : 'stretch';
  dialogUI.previewBox.style.borderRadius = isMobile ? '10px' : '12px';
  dialogUI.text.style.paddingTop = isMobile ? '20px' : '4px';
  ['title','subtitle','controls','stat1','stat2','extra'].forEach((k, i) => {
    const el = dialogUI[k];
    el.style.fontSize = isMobile ? [20,11,11,13,13,11][i] + 'px' : [26,13,12,14,14,12][i] + 'px';
  });
  dialogUI.subtitle.style.marginBottom = isMobile ? '6px' : '8px';
  dialogUI.controls.style.marginBottom = isMobile ? '8px' : '10px';
  dialogUI.stat1.style.marginBottom = isMobile ? '4px' : '6px';
  dialogUI.stat2.style.marginBottom = isMobile ? '6px' : '8px';
  return getResponsiveDialogMetrics();
}
```

### Full code for `src/lib/textures.js`

```javascript
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

export function loadTexture(path) {
  const tex = textureLoader.load(path);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function createStarBackgroundTexture(w, h) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 350 }, () => ({
    x: Math.random(), y: Math.random(),
    size: 0.2 + Math.random() * 0.5,
    alpha: 0.35 + Math.random() * 0.4
  }));
  function draw(dw, dh) {
    const pw = Math.pow(2, Math.ceil(Math.log2(Math.max(1, dw))));
    const ph = Math.pow(2, Math.ceil(Math.log2(Math.max(1, dh))));
    canvas.width = Math.min(pw, 2048);
    canvas.height = Math.min(ph, 1024);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      const x = s.x * canvas.width, y = s.y * canvas.height;
      const size = Math.max(0.5, s.size * (Math.min(canvas.width, canvas.height) / 1000));
      const g = ctx.createRadialGradient(x, y, 0, x, y, size);
      g.addColorStop(0, `rgba(255,255,255,${s.alpha})`);
      g.addColorStop(0.4, `rgba(255,255,255,${s.alpha * 0.3})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  draw(w || 1920, h || 1080);
  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return { texture, draw };
}
```

### Full code for `src/lib/preload.js`

```javascript
import { planets } from './planets';

function getPreloadUrls() {
  const urls = [...planets.map((p) => p.texture)];
  planets.filter((p) => p.ring).forEach((p) => urls.push(p.ringTexture));
  urls.push('/images/lebron-sunshine.png', '/audio/Lebron James flashbang.mp3');
  return [...new Set(urls)];
}

export function preloadAssets(onProgress) {
  const urls = getPreloadUrls();
  const total = urls.length;
  let loaded = 0;

  return new Promise((resolve) => {
    if (total === 0) {
      onProgress(100);
      resolve();
      return;
    }

    let resolved = false;
    const finish = () => { if (!resolved) { resolved = true; resolve(); } };
    const tick = () => {
      loaded++;
      onProgress(Math.min(100, Math.round((loaded / total) * 100)));
      if (loaded >= total) finish();
    };

    setTimeout(finish, 15000);

    urls.forEach((url) => {
      const ext = url.split('.').pop().toLowerCase();
      if (ext === 'mp3' || ext === 'ogg' || ext === 'wav') {
        const a = new Audio();
        let done = false;
        const doneTick = () => { if (!done) { done = true; tick(); } };
        a.addEventListener('canplaythrough', doneTick, { once: true });
        a.addEventListener('loadeddata', doneTick, { once: true });
        a.addEventListener('error', doneTick);
        a.src = url;
        setTimeout(doneTick, 8000);
      } else {
        const img = new Image();
        img.onload = tick;
        img.onerror = tick;
        img.src = url;
      }
    });
  });
}
```

### Full code for `src/lib/loader-ui.js`

```javascript
export function createLoaderUI() {
  const wrap = document.createElement('div');
  wrap.id = 'loader-wrap';
  wrap.innerHTML = `
    <style>
      #loader-wrap { position:fixed;inset:0;z-index:99999;background:linear-gradient(180deg,#0a0a12 0%,#0f0f1a 50%,#080810 100%);display:flex;flex-direction:column;justify-content:center;align-items:center;font-family:'Segoe UI',system-ui,sans-serif;transition:opacity 0.6s ease-out; }
      #loader-wrap.done { opacity:0;pointer-events:none; }
      .loader-title { color:#fff;font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:0.5rem;text-shadow:0 0 20px rgba(255,200,100,0.4); }
      .loader-instructions { color:#ccc;font-size:0.9rem;line-height:1.6;text-align:center;max-width:320px;margin:1.5rem 0 1.25rem; }
      .loader-instructions ul { margin:0.5rem 0;padding-left:1.25rem;text-align:left; }
      .loader-instructions li { margin-bottom:0.35rem; }
      .loader-bar-wrap { width:min(280px,85vw);height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.5); }
      .loader-bar { height:100%;width:0%;background:linear-gradient(90deg,#f5c542,#ffdd99);border-radius:4px;transition:width 0.2s;box-shadow:0 0 12px rgba(245,197,66,0.5);animation:loader-pulse 1.5s ease-in-out infinite; }
      .loader-pct { color:#aaa;font-size:0.75rem;margin-top:0.6rem;font-variant-numeric:tabular-nums; }
      .loader-frame { position:relative;padding:2rem;border:2px solid rgba(245,197,66,0.25);box-shadow:0 0 30px rgba(245,197,66,0.08),inset 0 0 30px rgba(0,0,0,0.3); }
      .loader-frame::before,.loader-frame::after { content:'';position:absolute;width:16px;height:16px;border:2px solid rgba(245,197,66,0.5);pointer-events:none; }
      .loader-frame::before { top:6px;left:6px;border-right:none;border-bottom:none; }
      .loader-frame::after { bottom:6px;right:6px;border-left:none;border-top:none; }
      @keyframes loader-pulse { 0%,100%{opacity:1} 50%{opacity:0.85} }
      .loader-btn { margin-top:1rem;padding:0.65rem 2rem;font-size:1rem;font-weight:600;background:linear-gradient(180deg,#f5c542,#d4a030);color:#1a1a1a;border:none;border-radius:6px;cursor:pointer;letter-spacing:0.05em;box-shadow:0 4px 16px rgba(245,197,66,0.4);transition:opacity 0.2s,transform 0.15s; }
      .loader-btn:hover:not(:disabled) { transform:scale(1.03);opacity:0.95; }
      .loader-btn:disabled { opacity:0.5;cursor:not-allowed; }
      .loader-ready .loader-btn { display:block; }
    </style>
    <div class="loader-scanline"></div>
    <div class="loader-frame">
      <div class="loader-title">Solar System</div>
      <div class="loader-instructions">
        <p>Explore the Solar System. Here's how:</p>
        <ul>
          <li><strong>Drag</strong> to orbit around the system</li>
          <li><strong>Scroll</strong> to zoom in and out</li>
          <li><strong>Click</strong> a planet for details</li>
          <li><strong>Click the Sun</strong> — you'll see</li>
        </ul>
      </div>
      <div class="loader-loading">
        <div class="loader-bar-wrap"><div class="loader-bar" id="loader-bar"></div></div>
        <div class="loader-pct" id="loader-pct">0%</div>
      </div>
      <button class="loader-btn" id="loader-btn" disabled style="display:none">Let's Go</button>
    </div>
  `;
  document.body.appendChild(wrap);
  const btn = wrap.querySelector('#loader-btn');
  return {
    bar: wrap.querySelector('#loader-bar'),
    pct: wrap.querySelector('#loader-pct'),
    btn,
    wrap,
    setProgress(p) { this.bar.style.width = p + '%'; this.pct.textContent = p + '%'; },
    ready() { wrap.classList.add('loader-ready'); btn.style.display = 'block'; btn.disabled = false; },
    setStatus(text) { const el = wrap.querySelector('.loader-pct'); if (el) el.textContent = text; },
    done() { this.wrap.classList.add('done'); setTimeout(() => this.wrap.remove(), 700); }
  };
}
```

### Full code for `src/lib/dialog.js`

```javascript
import { applyResponsiveDialogLayout } from './utils';

export function createDialog() {
  const dialog = document.createElement('div');
  Object.assign(dialog.style, {
    position: 'fixed', left: 0, top: 0, display: 'none', pointerEvents: 'auto',
    background: 'rgba(8, 10, 20, 0.95)', backdropFilter: 'blur(20px)', webkitBackdropFilter: 'blur(20px)',
    boxSizing: 'border-box', zIndex: '30', color: '#f0f2f5', fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none', overflow: 'hidden', webkitTapHighlightColor: 'transparent'
  });

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  Object.assign(closeButton.style, {
    position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', border: 'none',
    borderRadius: '50%', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)',
    fontSize: '28px', lineHeight: '1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, zIndex: '3', transition: 'background 0.2s ease, transform 0.2s ease'
  });
  closeButton.addEventListener('mouseenter', () => { closeButton.style.background = 'rgba(255,255,255,0.15)'; closeButton.style.transform = 'scale(1.06)'; });
  closeButton.addEventListener('mouseleave', () => { closeButton.style.background = 'rgba(255,255,255,0.08)'; closeButton.style.transform = 'scale(1)'; });
  dialog.appendChild(closeButton);

  const wrap = document.createElement('div');
  Object.assign(wrap.style, { display: 'flex', width: '100%', height: '100%' });
  dialog.appendChild(wrap);

  const previewBox = document.createElement('div');
  Object.assign(previewBox.style, {
    overflow: 'hidden', background: 'rgba(0,0,0,0.3)', cursor: 'grab', borderRadius: '12px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)', touchAction: 'none'
  });
  const previewCanvas = document.createElement('canvas');
  Object.assign(previewCanvas.style, { width: '100%', height: '100%', display: 'block' });
  previewBox.appendChild(previewCanvas);
  wrap.appendChild(previewBox);

  const text = document.createElement('div');
  text.className = 'dialog-scroll';
  Object.assign(text.style, { flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' });
  if (!document.getElementById('dialog-scrollbar-style')) {
    const style = document.createElement('style');
    style.id = 'dialog-scrollbar-style';
    style.textContent = `.dialog-scroll{scrollbar-width:none;-ms-overflow-style:none}.dialog-scroll::-webkit-scrollbar{display:none}@media(max-width:768px){.dialog-scroll{scrollbar-width:thin;scrollbar-color:rgba(120,140,200,0.5) rgba(8,12,24,0.8)}.dialog-scroll::-webkit-scrollbar{display:block;width:8px}.dialog-scroll::-webkit-scrollbar-track{background:rgba(8,12,24,0.6);border-radius:4px}.dialog-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,rgba(100,130,220,0.4),rgba(80,100,180,0.5));border-radius:4px}.dialog-scroll::-webkit-scrollbar-thumb:hover{background:linear-gradient(180deg,rgba(120,150,240,0.5),rgba(100,120,200,0.6))}}`;
    document.head.appendChild(style);
  }

  const mk = (_tag, style) => {
    const el = document.createElement('div');
    Object.assign(el.style, style || {});
    text.appendChild(el);
    return el;
  };
  const title = mk('div', { fontWeight: '600', lineHeight: '1.2', marginBottom: '4px', letterSpacing: '-0.02em' });
  const subtitle = mk('div', { fontWeight: '500' });
  const controls = mk('div', { lineHeight: '1.4', color: 'rgba(255,255,255,0.5)' });
  controls.innerHTML = 'Drag to rotate · Scroll to zoom';
  const stat1 = mk('div', { fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: '1.35' });
  const stat2 = mk('div', { fontWeight: '500', color: 'rgba(255,255,255,0.92)', lineHeight: '1.35' });
  const extra = mk('div', { lineHeight: '1.4', color: 'rgba(255,255,255,0.58)' });
  wrap.appendChild(text);

  document.body.appendChild(dialog);
  const ui = { dialog, wrap, closeButton, previewBox, previewCanvas, text, title, subtitle, controls, stat1, stat2, extra };
  applyResponsiveDialogLayout(ui);
  return ui;
}
```

### Full code for `src/lib/sketch-scene.js`

This file is large. Copy it from the original `lib/sketch-scene.js` and change:

- `const THREE = require('three');` → `import * as THREE from 'three';`
- `const { planets } = require('./planets');` → `import { planets } from './planets';`
- `const { loadTexture, createStarBackgroundTexture } = require('./textures');` → `import { loadTexture, createStarBackgroundTexture } from './textures';`
- `const { hexToRgba, applyResponsiveDialogLayout } = require('./utils');` → `import { hexToRgba, applyResponsiveDialogLayout } from './utils';`
- `const { createDialog } = require('./dialog');` → `import { createDialog } from './dialog';`
- `module.exports = function createSketch()` → `export function createSketch()`
- In `sunAudio` and `img.src`, use paths starting with `/` (e.g. `/audio/Lebron James flashbang.mp3`, `/images/lebron-sunshine.png`).

The full `sketch-scene.js` is ~390 lines. Ensure all texture paths in `planets.js` use the `/textures/...` prefix.

---

### Full code for `src/components/SolarSystem.vue`

```vue
<template>
  <div ref="containerRef" class="solar-system-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { preloadAssets } from '@/lib/preload'
import { createLoaderUI } from '@/lib/loader-ui'
import { createSketch } from '@/lib/sketch-scene'

const containerRef = ref<HTMLDivElement | null>(null)
let sketchInstance: { render: (ctx: { width: number; height: number }) => void; resize: (ctx: { viewportWidth: number; viewportHeight: number }) => void; unload: () => void } | null = null
let animationId: number | null = null

function runSketch() {
  if (!containerRef.value) return

  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  container.appendChild(canvas)

  const gl = canvas.getContext('webgl', { antialias: true })
  if (!gl) {
    console.error('WebGL not supported')
    return
  }

  const sketchFn = createSketch()
  sketchInstance = sketchFn({ canvas, gl, width, height })

  function render() {
    if (!sketchInstance) return
    sketchInstance.render({ width: container.clientWidth, height: container.clientHeight })
    animationId = requestAnimationFrame(render)
  }
  render()

  const onResize = () => {
    if (!sketchInstance) return
    const w = container.clientWidth
    const h = container.clientHeight
    sketchInstance.resize({ viewportWidth: w, viewportHeight: h })
  }
  window.addEventListener('resize', onResize)
  container._resizeHandler = onResize
}

function startExperience() {
  const loader = createLoaderUI()
  loader.btn.addEventListener('click', () => {
    loader.done()
    runSketch()
  })

  preloadAssets((p) => loader.setProgress(p))
    .then(() => {
      loader.setProgress(100)
      loader.setStatus('100% · Ready')
      loader.ready()
    })
    .catch(() => {
      loader.setProgress(100)
      loader.setStatus('100% · Ready')
      loader.ready()
    })
}

onMounted(() => {
  document.title = '🌌 SPACE'
  document.documentElement.style.webkitTapHighlightColor = 'transparent'
  document.body.style.overflow = 'hidden'
  document.body.style.background = '#000'
  startExperience()
})

onUnmounted(() => {
  if (animationId !== null) cancelAnimationFrame(animationId)
  if (sketchInstance) sketchInstance.unload()
  const container = containerRef.value as HTMLDivElement & { _resizeHandler?: () => void }
  if (container?._resizeHandler) window.removeEventListener('resize', container._resizeHandler)
  document.body.style.overflow = ''
  document.body.style.background = ''
})
</script>

<style scoped>
.solar-system-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
```

### Full code for `src/App.vue` (Option A)

```vue
<template>
  <SolarSystem />
</template>

<script setup lang="ts">
import SolarSystem from './components/SolarSystem.vue'
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
</style>
```

---

## Option B: Using main.ts (entry-point-based)

Use this when the Solar System is the entire app and you want to bypass the normal Vue tree.

### Full code for `src/main.ts` (Option B)

```typescript
import { createApp } from 'vue'
import App from './App.vue'

// If Solar System is the ONLY content, use a minimal App:
const SolarSystemApp = {
  template: '<div ref="containerRef" style="position:fixed;inset:0;width:100%;height:100%"></div>',
  mounted() {
    const container = this.$refs.containerRef as HTMLDivElement
    document.title = '🌌 SPACE'
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#000'

    import('@/lib/preload').then(({ preloadAssets }) =>
      import('@/lib/loader-ui').then(({ createLoaderUI }) =>
        import('@/lib/sketch-scene').then(({ createSketch }) => {
          const loader = createLoaderUI()
          loader.btn.addEventListener('click', () => {
            loader.done()
            runSketch(container, createSketch)
          })
          preloadAssets((p) => loader.setProgress(p))
            .then(() => { loader.setProgress(100); loader.setStatus('100% · Ready'); loader.ready() })
            .catch(() => { loader.setProgress(100); loader.setStatus('100% · Ready'); loader.ready() })
        })
      )
    )
  }
}

function runSketch(container: HTMLDivElement, createSketch: () => (ctx: { canvas: HTMLCanvasElement; gl: WebGLRenderingContext; width: number; height: number }) => { render: (ctx: { width: number; height: number }) => void; resize: (ctx: { viewportWidth: number; viewportHeight: number }) => void; unload: () => void }) {
  const width = container.clientWidth
  const height = container.clientHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.style.cssText = 'display:block;width:100%;height:100%'
  container.appendChild(canvas)
  const gl = canvas.getContext('webgl', { antialias: true })!
  const sketch = createSketch()({ canvas, gl, width, height })
  function render() {
    sketch.render({ width: container.clientWidth, height: container.clientHeight })
    requestAnimationFrame(render)
  }
  render()
  const onResize = () => sketch.resize({ viewportWidth: container.clientWidth, viewportHeight: container.clientHeight })
  window.addEventListener('resize', onResize)
  container.dataset.hasSketch = '1'
}

createApp(SolarSystemApp).mount('#app')
```

### Alternative: App.vue as passthrough (Option B variant)

```vue
<!-- App.vue -->
<template>
  <SolarSystem />
</template>

<script setup lang="ts">
import SolarSystem from './components/SolarSystem.vue'
</script>
```

Use the same `SolarSystem.vue` component from Option A. The difference: **Option A** uses a reusable component; **Option B** can bootstrap everything from `main.ts` without a separate component if you prefer.

---

## Asset path configuration

For Vue with Vite, static assets in `public/` are served from the root. Use **leading slash** paths:

| Asset | Path in code |
|-------|--------------|
| Planet textures | `/textures/mercury.jpg`, etc. |
| Saturn ring | `/textures/saturn_ring.png` |
| Lebron meme | `/images/lebron-sunshine.png` |
| Audio | `/audio/Lebron James flashbang.mp3` |

If your app uses `base: '/my-app/'`, use `import.meta.env.BASE_URL + 'textures/mercury.jpg'` (and similar for other assets).

---

## Common mistakes to avoid

1. **Wrong asset paths**  
   Use `/textures/...`, `/images/...`, `/audio/...` for files in `public/`. Paths without `/` can fail depending on routing.

2. **Forgetting to call `unload()`**  
   Always call `sketchInstance.unload()` in `onUnmounted` (or equivalent) to remove listeners and dispose resources.

3. **Missing `requestAnimationFrame` loop**  
   The scene must be rendered each frame. Start a loop that calls `sketch.render()` and uses `requestAnimationFrame`.

4. **Resize not handled**  
   Resize the renderer and camera when the window or container size changes. Use the `resize` method from the sketch.

5. **Loader shown before DOM**  
   Call `createLoaderUI()` and `preloadAssets()` only after the component is mounted (or after the app is mounted).

6. **Canvas size vs display size**  
   Set `canvas.width`/`canvas.height` to pixel dimensions. Use CSS for display size if needed to avoid blurriness.

7. **TypeScript types for sketch**  
   If you see TS errors, you can add a `.d.ts` or use `// @ts-ignore` for the sketch return type until you define a proper interface.
