function createLoaderUI() {
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
      .loader-scanline { position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px);pointer-events:none; }
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

module.exports = { createLoaderUI };
