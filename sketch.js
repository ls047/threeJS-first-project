const canvasSketch = require('canvas-sketch');
const THREE = require('three');

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#000';
document.body.style.touchAction = 'none';

const settings = {
  animate: true,
  context: 'webgl',
  attributes: {
    antialias: true
  }
};

const textureLoader = new THREE.TextureLoader();

const planets = [
  { name: 'Mercury', radius: 42, size: 8, speed: 0.0040, texture: 'textures/mercury.jpg', tint: '#b7b7b7',
    diameter: '4,879 km', orbitalPeriod: '88 days', distance: '57.9 million km', fact: 'Smallest planet; surface temperature swings from −173°C to 427°C.' },
  { name: 'Venus', radius: 68, size: 11, speed: 0.0032, texture: 'textures/venus.jpg', tint: '#d9b38c',
    diameter: '12,104 km', orbitalPeriod: '225 days', distance: '108.2 million km', fact: 'Hottest planet (~465°C) due to runaway greenhouse effect; thick CO₂ atmosphere.' },
  { name: 'Earth', radius: 96, size: 12, speed: 0.0024, texture: 'textures/earth.jpg', tint: '#4f83ff',
    diameter: '12,742 km', orbitalPeriod: '365.25 days', distance: '149.6 million km (1 AU)', fact: 'Only known planet with liquid water and life.' },
  { name: 'Mars', radius: 124, size: 10, speed: 0.0020, texture: 'textures/mars.jpg', tint: '#c1440e',
    diameter: '6,779 km', orbitalPeriod: '687 days', distance: '227.9 million km', fact: 'Olympus Mons is the largest volcano in the Solar System; two moons: Phobos and Deimos.' },
  { name: 'Jupiter', radius: 160, size: 20, speed: 0.0014, texture: 'textures/jupiter.jpg', tint: '#d2b48c',
    diameter: '139,820 km', orbitalPeriod: '11.9 years', distance: '778.5 million km', fact: 'Largest planet; a gas giant with 79+ moons and the Great Red Spot storm.' },
  { name: 'Saturn', radius: 200, size: 18, speed: 0.0011, texture: 'textures/saturn.jpg', tint: '#e3c27a', ring: true, ringTexture: 'textures/saturn_ring.png',
    diameter: '116,460 km', orbitalPeriod: '29.5 years', distance: '1.43 billion km', fact: 'Visible ring system of ice and rock; less dense than water; 82+ moons.' },
  { name: 'Uranus', radius: 238, size: 15, speed: 0.0008, texture: 'textures/uranus.jpg', tint: '#7ad7f0',
    diameter: '50,724 km', orbitalPeriod: '84 years', distance: '2.87 billion km', fact: 'Ice giant; rotates on its side with an axial tilt of 98°; 27 known moons.' },
  { name: 'Neptune', radius: 276, size: 15, speed: 0.0006, texture: 'textures/neptune.jpg', tint: '#4169e1',
    diameter: '49,244 km', orbitalPeriod: '165 years', distance: '4.50 billion km', fact: 'Farthest planet; methane gives it blue color; supersonic winds up to 2,100 km/h.' }
];

function loadTexture(path) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.22)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function hexToRgba(hex, alpha) {
  const v = hex.replace('#', '');
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getResponsiveDialogMetrics() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw <= 768;
  const isSmallMobile = vw <= 520;

  const margin = Math.max(10, Math.min(20, vw * 0.03));
  const width = Math.min(820, vw - margin * 2);
  const maxHeight = vh - margin * 2;

  let previewSize;
  let height;

  if (isSmallMobile) {
    previewSize = Math.min(220, width - 40);
    height = Math.min(maxHeight, previewSize + 250);
  } else if (isMobile) {
    previewSize = Math.min(260, width - 48);
    height = Math.min(maxHeight, previewSize + 250);
  } else {
    previewSize = Math.max(220, Math.min(320, width * 0.39));
    height = Math.min(maxHeight, Math.max(360, previewSize + 80));
  }

  return {
    vw,
    vh,
    isMobile,
    isSmallMobile,
    margin,
    width,
    height,
    previewSize
  };
}

function applyResponsiveDialogLayout(dialogUI) {
  const metrics = getResponsiveDialogMetrics();
  const {
    isMobile,
    width,
    height,
    previewSize
  } = metrics;

  dialogUI.dialog.style.width = `${width}px`;
  dialogUI.dialog.style.height = `${height}px`;
  dialogUI.dialog.style.padding = isMobile ? '16px' : '28px';
  dialogUI.dialog.style.borderRadius = isMobile ? '20px' : '30px';

  dialogUI.closeButton.style.top = isMobile ? '10px' : '12px';
  dialogUI.closeButton.style.right = isMobile ? '10px' : '12px';
  dialogUI.closeButton.style.width = isMobile ? '36px' : '42px';
  dialogUI.closeButton.style.height = isMobile ? '36px' : '42px';
  dialogUI.closeButton.style.fontSize = isMobile ? '24px' : '28px';

  dialogUI.wrap.style.flexDirection = isMobile ? 'column' : 'row';
  dialogUI.wrap.style.gap = isMobile ? '14px' : '28px';

  dialogUI.previewBox.style.width = `${previewSize}px`;
  dialogUI.previewBox.style.height = `${previewSize}px`;
  dialogUI.previewBox.style.flex = `0 0 ${previewSize}px`;
  dialogUI.previewBox.style.alignSelf = isMobile ? 'center' : 'stretch';
  dialogUI.previewBox.style.borderRadius = isMobile ? '18px' : '24px';

  dialogUI.text.style.paddingTop = isMobile ? '28px' : '10px';

  dialogUI.title.style.fontSize = isMobile ? '28px' : '46px';
  dialogUI.subtitle.style.fontSize = isMobile ? '15px' : '21px';
  dialogUI.controls.style.fontSize = isMobile ? '15px' : '22px';
  dialogUI.stat1.style.fontSize = isMobile ? '18px' : '26px';
  dialogUI.stat2.style.fontSize = isMobile ? '18px' : '26px';
  dialogUI.extra.style.fontSize = isMobile ? '14px' : '20px';

  dialogUI.subtitle.style.marginBottom = isMobile ? '12px' : '26px';
  dialogUI.controls.style.marginBottom = isMobile ? '14px' : '28px';
  dialogUI.stat1.style.marginBottom = isMobile ? '8px' : '14px';
  dialogUI.stat2.style.marginBottom = isMobile ? '10px' : '18px';

  return metrics;
}

function createDialog() {
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.left = '0px';
  dialog.style.top = '0px';
  dialog.style.display = 'none';
  dialog.style.pointerEvents = 'auto';
  dialog.style.background = 'rgba(10, 12, 25, 0.97)';
  dialog.style.backdropFilter = 'blur(14px)';
  dialog.style.boxSizing = 'border-box';
  dialog.style.zIndex = '30';
  dialog.style.color = 'white';
  dialog.style.fontFamily = 'Arial, sans-serif';
  dialog.style.userSelect = 'none';
  dialog.style.overflow = 'hidden';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.innerHTML = '&times;';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '12px';
  closeButton.style.right = '12px';
  closeButton.style.width = '42px';
  closeButton.style.height = '42px';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '50%';
  closeButton.style.background = 'rgba(255,255,255,0.10)';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '28px';
  closeButton.style.lineHeight = '1';
  closeButton.style.cursor = 'pointer';
  closeButton.style.display = 'flex';
  closeButton.style.alignItems = 'center';
  closeButton.style.justifyContent = 'center';
  closeButton.style.padding = '0';
  closeButton.style.zIndex = '3';
  closeButton.style.transition = 'background 0.2s ease, transform 0.2s ease';
  dialog.appendChild(closeButton);

  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = 'rgba(255,255,255,0.18)';
    closeButton.style.transform = 'scale(1.05)';
  });

  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'rgba(255,255,255,0.10)';
    closeButton.style.transform = 'scale(1)';
  });

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.width = '100%';
  wrap.style.height = '100%';
  dialog.appendChild(wrap);

  const previewBox = document.createElement('div');
  previewBox.style.overflow = 'hidden';
  previewBox.style.background = 'rgba(255,255,255,0.04)';
  previewBox.style.cursor = 'grab';
  previewBox.style.boxShadow = '0 0 35px rgba(255,255,255,0.08)';
  previewBox.style.touchAction = 'none';
  wrap.appendChild(previewBox);

  const previewCanvas = document.createElement('canvas');
  previewCanvas.style.width = '100%';
  previewCanvas.style.height = '100%';
  previewCanvas.style.display = 'block';
  previewBox.appendChild(previewCanvas);

  const text = document.createElement('div');
  text.style.flex = '1';
  text.style.display = 'flex';
  text.style.flexDirection = 'column';
  text.style.justifyContent = 'flex-start';
  text.style.minWidth = '0';
  wrap.appendChild(text);

  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.lineHeight = '1.1';
  title.style.marginBottom = '12px';
  text.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.style.fontWeight = '600';
  text.appendChild(subtitle);

  const controls = document.createElement('div');
  controls.style.lineHeight = '1.7';
  controls.style.color = 'rgba(255,255,255,0.88)';
  controls.innerHTML = `
    Drag the planet preview to rotate it<br>
    Use the mouse wheel or touch drag to explore
  `;
  text.appendChild(controls);

  const stat1 = document.createElement('div');
  stat1.style.fontWeight = '600';
  stat1.style.color = 'rgba(255,255,255,0.96)';
  text.appendChild(stat1);

  const stat2 = document.createElement('div');
  stat2.style.fontWeight = '600';
  stat2.style.color = 'rgba(255,255,255,0.96)';
  text.appendChild(stat2);

  const extra = document.createElement('div');
  extra.style.lineHeight = '1.5';
  extra.style.color = 'rgba(255,255,255,0.72)';
  text.appendChild(extra);

  document.body.appendChild(dialog);

  const ui = {
    dialog,
    wrap,
    closeButton,
    previewBox,
    previewCanvas,
    text,
    title,
    subtitle,
    controls,
    stat1,
    stat2,
    extra
  };

  applyResponsiveDialogLayout(ui);
  return ui;
}

const sketch = ({ canvas, gl, width, height }) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context: gl
  });

  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 4000);

  let mainYaw = 0.0;
  let mainPitch = 0.35;
  let mainDistance = 760;
  let mainDragging = false;
  let lastMainPointerX = 0;
  let lastMainPointerY = 0;
  let activePreviewPointerId = null;
  let activeMainPointerId = null;

  const ambient = new THREE.AmbientLight(0xffffff, 0.52);
  scene.add(ambient);

  const sunLight = new THREE.PointLight(0xffdd99, 3.0, 2600);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(30, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xf5c542 })
  );
  scene.add(sun);

  const starsGeo = new THREE.BufferGeometry();
  const starCount = 900;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3 + 0] = (Math.random() - 0.5) * 3000;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2200;
    starPositions[i * 3 + 2] = -600 - Math.random() * 1800;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

  const stars = new THREE.Points(
    starsGeo,
    new THREE.PointsMaterial({
      size: 7,
      map: makeStarTexture(),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      color: 0xffffff
    })
  );
  scene.add(stars);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  let hoverPlanet = null;
  let selectedPlanet = null;
  let selectedOrbiter = null;
  let selectedScreen = { x: 0, y: 0 };

  const orbiters = planets.map((planet) => {
    const orbit = new THREE.Mesh(
      new THREE.RingGeometry(planet.radius - 0.35, planet.radius + 0.35, 220),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.10,
        side: THREE.DoubleSide
      })
    );

    orbit.rotation.x = Math.PI / 2;
    orbit.position.y = 0;
    scene.add(orbit);

    const planetTexture = loadTexture(planet.texture);

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.size, 64, 64),
      new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.7,
        metalness: 0.08
      })
    );

    mesh.position.set(planet.radius, 0, 0);
    mesh.userData.planet = planet;
    scene.add(mesh);

    if (planet.ring) {
      const ringTexture = loadTexture(planet.ringTexture);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(planet.size * 1.65, planet.size * 2.7, 220),
        new THREE.MeshBasicMaterial({
          map: ringTexture,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = Math.PI / 2.8;
      mesh.add(ring);
    }

    return {
      planet,
      orbit,
      mesh,
      angle: Math.random() * Math.PI * 2,
      frozenAngle: null
    };
  });

  const dialogUI = createDialog();

  function closeDialog() {
    selectedPlanet = null;
    selectedOrbiter = null;
    dialogUI.dialog.style.display = 'none';

    if (previewGroup) {
      previewScene.remove(previewGroup);
      previewGroup = null;
      previewMesh = null;
      previewAtmosphere = null;
    }
  }

  dialogUI.closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDialog();
  });

  const previewRenderer = new THREE.WebGLRenderer({
    canvas: dialogUI.previewCanvas,
    alpha: true,
    antialias: true
  });
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  previewRenderer.outputColorSpace = THREE.SRGBColorSpace;

  const previewScene = new THREE.Scene();
  previewScene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const previewKey = new THREE.DirectionalLight(0xffffff, 2.0);
  previewKey.position.set(140, 60, 180);
  previewScene.add(previewKey);

  const previewFill = new THREE.DirectionalLight(0x88aaff, 0.6);
  previewFill.position.set(-120, -30, 120);
  previewScene.add(previewFill);

  const previewCamera = new THREE.PerspectiveCamera(38, 1, 0.1, 2000);

  let previewGroup = null;
  let previewMesh = null;
  let previewAtmosphere = null;

  let draggingPreview = false;
  let lastPreviewPointerX = 0;
  let lastPreviewPointerY = 0;
  let previewYaw = 0.65;
  let previewPitch = 0.2;
  let previewDistance = 165;

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
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    previewGroup = new THREE.Group();

    const previewTexture = loadTexture(planet.texture);

    previewMesh = new THREE.Mesh(
      new THREE.SphereGeometry(54, 128, 128),
      new THREE.MeshStandardMaterial({
        map: previewTexture,
        roughness: 0.68,
        metalness: 0.08
      })
    );
    previewGroup.add(previewMesh);

    if (planet.name === 'Earth') {
      previewAtmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(57, 72, 72),
        new THREE.MeshBasicMaterial({
          color: 0x7ec8ff,
          transparent: true,
          opacity: 0.12,
          side: THREE.BackSide
        })
      );
      previewGroup.add(previewAtmosphere);
    } else {
      previewAtmosphere = null;
    }

    if (planet.ring) {
      const previewRingTexture = loadTexture(planet.ringTexture);
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(78, 122, 240),
        new THREE.MeshBasicMaterial({
          map: previewRingTexture,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide
        })
      );
      ring.rotation.x = Math.PI / 2.7;
      previewMesh.add(ring);
    }

    previewScene.add(previewGroup);
    syncPreviewRendererSize();
  }

  function toCanvasPosFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * rect.width,
      y: ((clientY - rect.top) / rect.height) * rect.height
    };
  }

  function updateHoverFromClient(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    pointer.x = (localX / rect.width) * 2 - 1;
    pointer.y = -(localY / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(orbiters.map((o) => o.mesh), false);
    hoverPlanet = hits.length ? hits[0].object.userData.planet : null;
  }

  function updateDialogStyle(planet) {
    const glow = hexToRgba(planet.tint, 0.75);
    const glowSoft = hexToRgba(planet.tint, 0.28);
    const glowBorder = hexToRgba(planet.tint, 0.95);

    dialogUI.dialog.style.boxShadow = `0 0 22px ${glow}, 0 0 42px ${glowSoft}`;
    dialogUI.dialog.style.border = `2px solid ${glowBorder}`;

    dialogUI.title.textContent = planet.name;
    dialogUI.subtitle.textContent = 'Planet Information';
    dialogUI.subtitle.style.color = glowBorder;
    dialogUI.stat1.textContent = `Diameter: ${planet.diameter}  •  Orbital period: ${planet.orbitalPeriod}`;
    dialogUI.stat2.textContent = `Distance from Sun: ${planet.distance}`;
    dialogUI.extra.textContent = planet.fact;
  }

  function updateDialogPosition() {
    if (!selectedPlanet) {
      dialogUI.dialog.style.display = 'none';
      return;
    }

    const metrics = applyResponsiveDialogLayout(dialogUI);
    syncPreviewRendererSize();

    const panelWidth = metrics.width;
    const panelHeight = metrics.height;
    const margin = metrics.margin;
    const mobileBottomGap = 12;

    let x;
    let y;

    if (metrics.isMobile) {
      x = margin;
      y = window.innerHeight - panelHeight - mobileBottomGap;
      y = Math.max(margin, y);
    } else {
      x = selectedScreen.x - panelWidth * 0.5;
      y = selectedScreen.y - panelHeight - 34;

      x = Math.max(margin, Math.min(window.innerWidth - panelWidth - margin, x));

      if (y < margin) {
        y = selectedScreen.y + 34;
      }

      y = Math.max(margin, Math.min(window.innerHeight - panelHeight - margin, y));
    }

    dialogUI.dialog.style.left = `${x}px`;
    dialogUI.dialog.style.top = `${y}px`;
    dialogUI.dialog.style.display = 'block';
  }

  function onCanvasPointerMove(e) {
    if (draggingPreview || (activePreviewPointerId !== null && e.pointerId === activePreviewPointerId)) {
      return;
    }

    const pos = toCanvasPosFromClient(e.clientX, e.clientY);

    if (mainDragging && e.pointerId === activeMainPointerId) {
      const dx = pos.x - lastMainPointerX;
      const dy = pos.y - lastMainPointerY;

      mainYaw += dx * 0.01;
      mainPitch += dy * 0.01;
      mainPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, mainPitch));

      lastMainPointerX = pos.x;
      lastMainPointerY = pos.y;
      canvas.style.cursor = 'grabbing';
      return;
    }

    updateHoverFromClient(e.clientX, e.clientY);
    canvas.style.cursor = hoverPlanet ? 'pointer' : 'grab';
  }

  function onCanvasPointerDown(e) {
    updateHoverFromClient(e.clientX, e.clientY);

    if (hoverPlanet) {
      selectedPlanet = hoverPlanet;
      selectedOrbiter = orbiters.find((o) => o.planet.name === hoverPlanet.name) || null;
      previewYaw = 0.65;
      previewPitch = 0.2;
      previewDistance = 165;
      buildPreviewPlanet(selectedPlanet);
      updateDialogStyle(selectedPlanet);
      updateDialogPosition();
      canvas.style.cursor = 'pointer';
      return;
    }

    const pos = toCanvasPosFromClient(e.clientX, e.clientY);
    mainDragging = true;
    activeMainPointerId = e.pointerId;
    lastMainPointerX = pos.x;
    lastMainPointerY = pos.y;
    canvas.style.cursor = 'grabbing';
  }

  function endMainDrag() {
    mainDragging = false;
    activeMainPointerId = null;
    canvas.style.cursor = hoverPlanet ? 'pointer' : 'grab';
  }

  function endPreviewDrag() {
    draggingPreview = false;
    activePreviewPointerId = null;
    dialogUI.previewBox.style.cursor = 'grab';
  }

  function onWindowPointerUp(e) {
    if (e.pointerId === activeMainPointerId) {
      endMainDrag();
    }
    if (e.pointerId === activePreviewPointerId) {
      endPreviewDrag();
    }
  }

  function onWheel(e) {
    if (dialogUI.previewBox.matches(':hover') && previewGroup) {
      e.preventDefault();
      previewDistance += e.deltaY * 0.08;
      previewDistance = Math.max(95, Math.min(320, previewDistance));
      return;
    }

    e.preventDefault();
    mainDistance += e.deltaY * 0.45;
    mainDistance = Math.max(240, Math.min(1800, mainDistance));
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      closeDialog();
    }
  }

  function onWindowResize() {
    applyResponsiveDialogLayout(dialogUI);
    syncPreviewRendererSize();
    updateDialogPosition();
  }

  dialogUI.previewBox.addEventListener('pointerdown', (e) => {
    if (!previewGroup) return;
    draggingPreview = true;
    activePreviewPointerId = e.pointerId;
    lastPreviewPointerX = e.clientX;
    lastPreviewPointerY = e.clientY;
    dialogUI.previewBox.style.cursor = 'grabbing';
    e.stopPropagation();
  });

  dialogUI.previewBox.addEventListener('pointermove', (e) => {
    if (!draggingPreview || e.pointerId !== activePreviewPointerId || !previewGroup) return;

    const dx = e.clientX - lastPreviewPointerX;
    const dy = e.clientY - lastPreviewPointerY;
    previewYaw += dx * 0.012;
    previewPitch += dy * 0.012;
    previewPitch = Math.max(-1.1, Math.min(1.1, previewPitch));
    lastPreviewPointerX = e.clientX;
    lastPreviewPointerY = e.clientY;
    dialogUI.previewBox.style.cursor = 'grabbing';
  });

  dialogUI.previewBox.addEventListener('pointerup', endPreviewDrag);
  dialogUI.previewBox.addEventListener('pointercancel', endPreviewDrag);
  dialogUI.previewBox.addEventListener('mouseleave', endPreviewDrag);

  dialogUI.previewBox.addEventListener('wheel', (e) => {
    e.preventDefault();
    previewDistance += e.deltaY * 0.08;
    previewDistance = Math.max(95, Math.min(320, previewDistance));
  }, { passive: false });

  canvas.addEventListener('pointermove', onCanvasPointerMove);
  canvas.addEventListener('pointerdown', onCanvasPointerDown);
  window.addEventListener('pointerup', onWindowPointerUp);
  window.addEventListener('pointercancel', onWindowPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onWindowResize);

  syncPreviewRendererSize();

  return {
    render({ width, height }) {
      camera.position.set(
        Math.cos(mainYaw) * Math.cos(mainPitch) * mainDistance,
        Math.sin(mainPitch) * mainDistance,
        Math.sin(mainYaw) * Math.cos(mainPitch) * mainDistance
      );
      camera.lookAt(0, 0, 0);

      orbiters.forEach((item) => {
        if (hoverPlanet === item.planet) {
          if (item.frozenAngle === null) item.frozenAngle = item.angle;
        } else {
          item.frozenAngle = null;
          item.angle += item.planet.speed;
        }

        const angle = item.frozenAngle !== null ? item.frozenAngle : item.angle;

        item.mesh.position.x = Math.cos(angle) * item.planet.radius;
        item.mesh.position.y = 0;
        item.mesh.position.z = Math.sin(angle) * item.planet.radius;

        item.mesh.rotation.y += 0.0018;
      });

      sun.rotation.y += 0.0012;
      renderer.render(scene, camera);

      if (selectedOrbiter) {
        const worldPos = new THREE.Vector3();
        selectedOrbiter.mesh.getWorldPosition(worldPos);
        const projected = worldPos.clone().project(camera);

        selectedScreen.x = (projected.x * 0.5 + 0.5) * width;
        selectedScreen.y = (-projected.y * 0.5 + 0.5) * height;

        updateDialogPosition();
      }

      if (selectedPlanet && previewGroup && previewMesh) {
        previewCamera.position.set(
          Math.cos(previewYaw) * Math.cos(previewPitch) * previewDistance,
          Math.sin(previewPitch) * previewDistance,
          Math.sin(previewYaw) * Math.cos(previewPitch) * previewDistance
        );
        previewCamera.lookAt(0, 0, 0);

        previewMesh.rotation.y += 0.0012;
        if (previewAtmosphere) previewAtmosphere.rotation.y -= 0.0008;

        previewRenderer.render(previewScene, previewCamera);
      }
    },

    resize({ viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();

      applyResponsiveDialogLayout(dialogUI);
      syncPreviewRendererSize();
      updateDialogPosition();
    },

    unload() {
      canvas.removeEventListener('pointermove', onCanvasPointerMove);
      canvas.removeEventListener('pointerdown', onCanvasPointerDown);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointercancel', onWindowPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onWindowResize);

      dialogUI.dialog.remove();
      previewRenderer.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);