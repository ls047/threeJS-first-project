const THREE = require('three');
const { planets } = require('./planets');
const { loadTexture, createStarBackgroundTexture } = require('./textures');
const { hexToRgba, applyResponsiveDialogLayout } = require('./utils');
const { createDialog } = require('./dialog');

module.exports = function createSketch() {
  return ({ canvas, gl, width, height }) => {
    canvas.style.webkitTapHighlightColor = 'transparent';

    const renderer = new THREE.WebGLRenderer({ canvas, context: gl });
    renderer.setClearColor(0x000000, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);

    let mainYaw = 0, mainPitch = 0.35, mainDistance = 760;
    let mainDragging = false, lastMainPointerX = 0, lastMainPointerY = 0;
    let activePreviewPointerId = null, activeMainPointerId = null;

    scene.add(new THREE.AmbientLight(0xffffff, 0.52));
    const sunLight = new THREE.PointLight(0xffdd99, 3.0, 2600);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const starBackground = createStarBackgroundTexture(width, height);
    scene.background = starBackground.texture;

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(30, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0xf5c542 })
    );
    sun.userData.isSun = true;
    scene.add(sun);

    const sunAudio = new Audio('audio/Lebron James flashbang.mp3');
    sunAudio.volume = 0.8;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hoverPlanet = null, hoverSun = false, selectedPlanet = null, selectedOrbiter = null, selectedScreen = { x: 0, y: 0 };

    const orbiters = planets.map((planet) => {
      const orbit = new THREE.Mesh(
        new THREE.RingGeometry(planet.radius - 0.35, planet.radius + 0.35, 220),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
      );
      orbit.rotation.x = Math.PI / 2;
      orbit.position.y = 0;
      scene.add(orbit);

      const planetTexture = loadTexture(planet.texture);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planet.size, 64, 64),
        new THREE.MeshStandardMaterial({ map: planetTexture, roughness: 0.7, metalness: 0.08 })
      );
      mesh.position.set(planet.radius, 0, 0);
      mesh.userData.planet = planet;
      scene.add(mesh);

      if (planet.ring) {
        const ringTexture = loadTexture(planet.ringTexture);
        ringTexture.wrapS = ringTexture.wrapT = THREE.RepeatWrapping;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(planet.size * 1.2, planet.size * 2.25, 160),
          new THREE.MeshBasicMaterial({ map: ringTexture, transparent: true, opacity: 0.95, alphaTest: 0.1, side: THREE.DoubleSide, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2 - 0.4;
        mesh.add(ring);
      }

      return { planet, orbit, mesh, angle: Math.random() * Math.PI * 2, frozenAngle: null };
    });

    const dialogUI = createDialog();
    const ZOOM_STEP = 100, ZOOM_MIN = 240, ZOOM_MAX = 1800;
    let previewGroup = null, previewMesh = null, previewAtmosphere = null;
    let draggingPreview = false, lastPreviewPointerX = 0, lastPreviewPointerY = 0;
    let previewYaw = 0.65, previewPitch = 0.2, previewDistance = 165;

    function closeDialog() {
      selectedPlanet = null;
      selectedOrbiter = null;
      dialogUI.dialog.style.display = 'none';
      if (previewGroup) {
        const previewScene = dialogUI._previewScene;
        if (previewScene) previewScene.remove(previewGroup);
        previewGroup.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) Array.isArray(obj.material) ? obj.material.forEach((m) => m.dispose()) : obj.material.dispose();
        });
        previewGroup = null;
        previewMesh = null;
        previewAtmosphere = null;
      }
    }

    dialogUI.closeButton.addEventListener('click', (e) => { e.stopPropagation(); closeDialog(); });

    const zoomControls = document.createElement('div');
    zoomControls.style.cssText = 'position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:25;pointer-events:auto;webkit-tap-highlight-color:transparent;';
    const zoomBtn = (sym) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = sym;
      btn.style.cssText = 'width:48px;height:48px;border:none;border-radius:50%;background:rgba(255,255,255,0.12);color:white;font-size:24px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 12px rgba(0,0,0,0.4);transition:background .2s,transform .15s';
      btn.onmouseenter = () => { btn.style.background = 'rgba(255,255,255,0.22)'; btn.style.transform = 'scale(1.05)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(255,255,255,0.12)'; btn.style.transform = 'scale(1)'; };
      return btn;
    };
    const zoomInBtn = zoomBtn('+'), zoomOutBtn = zoomBtn('−');
    zoomInBtn.onclick = () => { mainDistance = Math.max(ZOOM_MIN, mainDistance - ZOOM_STEP); };
    zoomOutBtn.onclick = () => { mainDistance = Math.min(ZOOM_MAX, mainDistance + ZOOM_STEP); };
    zoomControls.append(zoomInBtn, zoomOutBtn);
    document.body.appendChild(zoomControls);

    const previewRenderer = new THREE.WebGLRenderer({ canvas: dialogUI.previewCanvas, alpha: true, antialias: true });
    previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    previewRenderer.outputColorSpace = THREE.SRGBColorSpace;

    const previewScene = new THREE.Scene();
    dialogUI._previewScene = previewScene;
    previewScene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const pk = new THREE.DirectionalLight(0xffffff, 2); pk.position.set(140, 60, 180); previewScene.add(pk);
    const pf = new THREE.DirectionalLight(0x88aaff, 0.6); pf.position.set(-120, -30, 120); previewScene.add(pf);
    const previewCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000);

    function syncPreviewRendererSize() {
      const rect = dialogUI.previewBox.getBoundingClientRect();
      const size = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));
      previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      previewRenderer.setSize(size, size, false);
      previewCamera.aspect = 1;
      previewCamera.updateProjectionMatrix();
    }

    function buildPreviewPlanet(planet) {
      if (previewGroup) {
        previewScene.remove(previewGroup);
        previewGroup.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) Array.isArray(obj.material) ? obj.material.forEach((m) => m.dispose()) : obj.material.dispose();
        });
      }
      previewGroup = new THREE.Group();
      const pt = loadTexture(planet.texture);
      previewMesh = new THREE.Mesh(
        new THREE.SphereGeometry(54, 128, 128),
        new THREE.MeshStandardMaterial({ map: pt, roughness: 0.68, metalness: 0.08 })
      );
      previewGroup.add(previewMesh);
      if (planet.name === 'Earth') {
        previewAtmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(57, 72, 72),
          new THREE.MeshBasicMaterial({ color: 0x7ec8ff, transparent: true, opacity: 0.12, side: THREE.BackSide })
        );
        previewGroup.add(previewAtmosphere);
      } else previewAtmosphere = null;
      if (planet.ring) {
        const prt = loadTexture(planet.ringTexture);
        prt.wrapS = prt.wrapT = THREE.RepeatWrapping;
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(62, 110, 180),
          new THREE.MeshBasicMaterial({ map: prt, transparent: true, opacity: 0.95, alphaTest: 0.1, side: THREE.DoubleSide, depthWrite: false })
        );
        ring.rotation.x = Math.PI / 2 - 0.4;
        previewMesh.add(ring);
      }
      previewScene.add(previewGroup);
      syncPreviewRendererSize();
    }

    function raycastFromClient(cx, cy) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects([sun, ...orbiters.map((o) => o.mesh)], false);
    }

    function updateHover(cx, cy) {
      const hits = raycastFromClient(cx, cy);
      const hit = hits[0];
      if (hit?.object.userData.isSun) { hoverPlanet = null; hoverSun = true; }
      else if (hit?.object.userData.planet) { hoverPlanet = hit.object.userData.planet; hoverSun = false; }
      else { hoverPlanet = null; hoverSun = false; }
    }

    function toCanvasPos(cx, cy) {
      const rect = canvas.getBoundingClientRect();
      return { x: ((cx - rect.left) / rect.width) * rect.width, y: ((cy - rect.top) / rect.height) * rect.height };
    }

    function triggerSunEasterEgg() {
      if (window._sunWaveActive) return;
      window._sunWaveActive = true;
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;background:#000;transition:background 2.5s ease-out;';
      document.body.appendChild(overlay);
      const meme = document.createElement('div');
      meme.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);max-width:min(90vw,520px);max-height:75vh;opacity:0;z-index:10000;pointer-events:none;display:flex;align-items:center;justify-content:center;transition:opacity 0.6s ease-in;';
      const img = document.createElement('img');
      img.src = 'images/lebron-sunshine.png';
      img.alt = 'You Are My Sunshine';
      img.style.cssText = 'max-width:100%;max-height:75vh;object-fit:contain;';
      img.onerror = () => { meme.innerHTML = ''; const fb = document.createElement('div'); fb.style.cssText = 'text-align:center;font-size:clamp(24px,6vw,48px);font-weight:700;color:#333;padding:40px;'; fb.textContent = '☀️ You Are My Sunshine ☀️'; meme.appendChild(fb); };
      meme.appendChild(img);
      document.body.appendChild(meme);
      sunAudio.currentTime = 3;
      sunAudio.play();
      requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.background = '#fff'; }));
      [0.15, 0.35, 0.55, 0.8, 1].forEach((opacity, i) => setTimeout(() => { meme.style.opacity = String(opacity); }, 2500 + 200 + i * 450));
    }

    function updateDialogStyle(planet) {
      const glow = hexToRgba(planet.tint, 0.4), glowBorder = hexToRgba(planet.tint, 0.55);
      dialogUI.dialog.style.boxShadow = `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${glow}`;
      dialogUI.dialog.style.border = `1px solid ${glowBorder}`;
      dialogUI.title.textContent = planet.name;
      dialogUI.subtitle.textContent = 'Planet Information';
      dialogUI.subtitle.style.color = glowBorder;
      dialogUI.stat1.textContent = `Diameter: ${planet.diameter}  •  Orbital period: ${planet.orbitalPeriod}`;
      dialogUI.stat2.textContent = `Distance from Sun: ${planet.distance}`;
      dialogUI.extra.textContent = planet.fact;
    }

    function updateDialogPosition() {
      if (!selectedPlanet) { dialogUI.dialog.style.display = 'none'; return; }
      const metrics = applyResponsiveDialogLayout(dialogUI);
      syncPreviewRendererSize();
      const { width: pw, height: ph } = metrics;
      let x, y;
      if (metrics.isMobile) {
        x = metrics.margin;
        y = Math.max(metrics.margin, window.innerHeight - ph - 12);
      } else {
        x = selectedScreen.x - pw * 0.5;
        y = selectedScreen.y - ph - 34;
        x = Math.max(metrics.margin, Math.min(window.innerWidth - pw - metrics.margin, x));
        if (y < metrics.margin) y = selectedScreen.y + 34;
        y = Math.max(metrics.margin, Math.min(window.innerHeight - ph - metrics.margin, y));
      }
      dialogUI.dialog.style.left = `${x}px`;
      dialogUI.dialog.style.top = `${y}px`;
      dialogUI.dialog.style.display = 'block';
    }

    function onCanvasMove(e) {
      if (draggingPreview || (activePreviewPointerId !== null && e.pointerId === activePreviewPointerId)) return;
      const pos = toCanvasPos(e.clientX, e.clientY);
      if (mainDragging && e.pointerId === activeMainPointerId) {
        mainYaw += (pos.x - lastMainPointerX) * 0.01;
        mainPitch += (pos.y - lastMainPointerY) * 0.01;
        mainPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mainPitch));
        lastMainPointerX = pos.x; lastMainPointerY = pos.y;
        canvas.style.cursor = 'grabbing';
        return;
      }
      updateHover(e.clientX, e.clientY);
      canvas.style.cursor = (hoverPlanet || hoverSun) ? 'pointer' : 'grab';
    }

    function onCanvasDown(e) {
      updateHover(e.clientX, e.clientY);
      const hits = raycastFromClient(e.clientX, e.clientY);
      if (hits.length && hits[0].object.userData.isSun) { triggerSunEasterEgg(); return; }
      if (hoverPlanet) {
        selectedPlanet = hoverPlanet;
        selectedOrbiter = orbiters.find((o) => o.planet.name === hoverPlanet.name) || null;
        previewYaw = 0.65; previewPitch = 0.2; previewDistance = 165;
        buildPreviewPlanet(selectedPlanet);
        updateDialogStyle(selectedPlanet);
        updateDialogPosition();
        canvas.style.cursor = 'pointer';
        return;
      }
      const pos = toCanvasPos(e.clientX, e.clientY);
      mainDragging = true;
      activeMainPointerId = e.pointerId;
      lastMainPointerX = pos.x;
      lastMainPointerY = pos.y;
      canvas.style.cursor = 'grabbing';
    }

    function onPointerUp(e) {
      if (e.pointerId === activeMainPointerId) { mainDragging = false; activeMainPointerId = null; canvas.style.cursor = (hoverPlanet || hoverSun) ? 'pointer' : 'grab'; }
      if (e.pointerId === activePreviewPointerId) { draggingPreview = false; activePreviewPointerId = null; dialogUI.previewBox.style.cursor = 'grab'; }
    }

    function onWheel(e) {
      if (dialogUI.previewBox.matches(':hover') && previewGroup) {
        e.preventDefault();
        previewDistance = Math.max(95, Math.min(320, previewDistance + e.deltaY * 0.08));
        return;
      }
      e.preventDefault();
      mainDistance = Math.max(240, Math.min(1800, mainDistance + e.deltaY * 0.45));
    }

    function updateZoomVisibility() { zoomControls.style.display = window.innerWidth <= 768 ? 'flex' : 'none'; }

    dialogUI.previewBox.addEventListener('pointerdown', (e) => {
      if (!previewGroup) return;
      draggingPreview = true; activePreviewPointerId = e.pointerId;
      lastPreviewPointerX = e.clientX; lastPreviewPointerY = e.clientY;
      dialogUI.previewBox.style.cursor = 'grabbing';
      e.stopPropagation();
    });
    dialogUI.previewBox.addEventListener('pointermove', (e) => {
      if (!draggingPreview || e.pointerId !== activePreviewPointerId || !previewGroup) return;
      previewYaw += (e.clientX - lastPreviewPointerX) * 0.012;
      previewPitch += (e.clientY - lastPreviewPointerY) * 0.012;
      previewPitch = Math.max(-1.1, Math.min(1.1, previewPitch));
      lastPreviewPointerX = e.clientX; lastPreviewPointerY = e.clientY;
      dialogUI.previewBox.style.cursor = 'grabbing';
    });
    dialogUI.previewBox.addEventListener('pointerup', () => { draggingPreview = false; activePreviewPointerId = null; dialogUI.previewBox.style.cursor = 'grab'; });
    dialogUI.previewBox.addEventListener('pointercancel', () => { draggingPreview = false; activePreviewPointerId = null; });
    dialogUI.previewBox.addEventListener('mouseleave', () => { draggingPreview = false; activePreviewPointerId = null; });
    dialogUI.previewBox.addEventListener('wheel', (e) => { e.preventDefault(); previewDistance = Math.max(95, Math.min(320, previewDistance + e.deltaY * 0.08)); }, { passive: false });

    canvas.addEventListener('pointermove', onCanvasMove);
    canvas.addEventListener('pointerdown', onCanvasDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    const onKeyDown = (ev) => { if (ev.key === 'Escape') closeDialog(); };
    const onResize = () => {
      applyResponsiveDialogLayout(dialogUI);
      syncPreviewRendererSize();
      updateDialogPosition();
      updateZoomVisibility();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    syncPreviewRendererSize();
    updateZoomVisibility();

    return {
      render({ width, height }) {
        camera.position.set(Math.cos(mainYaw) * Math.cos(mainPitch) * mainDistance, Math.sin(mainPitch) * mainDistance, Math.sin(mainYaw) * Math.cos(mainPitch) * mainDistance);
        camera.lookAt(0, 0, 0);

        orbiters.forEach((item) => {
          if (hoverPlanet === item.planet) { if (item.frozenAngle === null) item.frozenAngle = item.angle; }
          else { item.frozenAngle = null; item.angle += item.planet.speed; }
          const angle = item.frozenAngle !== null ? item.frozenAngle : item.angle;
          item.mesh.position.set(Math.cos(angle) * item.planet.radius, 0, Math.sin(angle) * item.planet.radius);
          item.mesh.rotation.y += 0.0018;
        });

        sun.rotation.y += 0.0012;
        renderer.render(scene, camera);

        if (selectedOrbiter) {
          const worldPos = new THREE.Vector3();
          selectedOrbiter.mesh.getWorldPosition(worldPos);
          const proj = worldPos.clone().project(camera);
          selectedScreen.x = (proj.x * 0.5 + 0.5) * width;
          selectedScreen.y = (-proj.y * 0.5 + 0.5) * height;
          updateDialogPosition();
        }

        if (selectedPlanet && previewGroup && previewMesh) {
          previewCamera.position.set(Math.cos(previewYaw) * Math.cos(previewPitch) * previewDistance, Math.sin(previewPitch) * previewDistance, Math.sin(previewYaw) * Math.cos(previewPitch) * previewDistance);
          previewCamera.lookAt(0, 0, 0);
          previewMesh.rotation.y += 0.0012;
          if (previewAtmosphere) previewAtmosphere.rotation.y -= 0.0008;
          previewRenderer.render(previewScene, previewCamera);
        }
      },

      resize({ viewportWidth, viewportHeight }) {
        starBackground.draw(viewportWidth, viewportHeight);
        starBackground.texture.needsUpdate = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(viewportWidth, viewportHeight, false);
        camera.aspect = viewportWidth / viewportHeight;
        camera.updateProjectionMatrix();
        applyResponsiveDialogLayout(dialogUI);
        syncPreviewRendererSize();
        updateDialogPosition();
      },

      unload() {
        canvas.removeEventListener('pointermove', onCanvasMove);
        canvas.removeEventListener('pointerdown', onCanvasDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
        canvas.removeEventListener('wheel', onWheel);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('resize', onResize);
        dialogUI.dialog.remove();
        zoomControls.remove();
        starBackground.texture.dispose();
        previewRenderer.dispose();
        renderer.dispose();
      }
    };
  };
};
