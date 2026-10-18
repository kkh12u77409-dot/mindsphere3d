// Three.js 3D Chamber & Graphics Engine for MindSphere 3D
// Resilient to virtualized / cloud emulator environments (MESA / software WebGL)
class Chamber3DEngine {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Camera orbit parameters
    this.target = new THREE.Vector3(0, 1.2, 0);
    this.spherical = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.defaultSpherical = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3 };
    this.isDragging = false;
    this.prevPointer = { x: 0, y: 0 };
    this.touchStartDist = 0;
    
    // Interactive 3D Objects
    this.interactiveObjects = [];
    this.puzzleGroup = new THREE.Group();
    this.doorGroup = new THREE.Group();
    this.particles = null;
    this.lights = [];
    this.doorLeft = null;
    this.doorRight = null;
    this.doorOpened = false;
    
    // Fallback 2D canvas support if WebGL is unavailable in emulator
    this.isFallback2D = false;
    this.canvas2D = null;
    this.ctx2D = null;

    // Animation tick
    this.clock = new THREE.Clock();
    this.animating = true;
    this.onObjectClick = null;
    this.currentLevelDef = null;
    this.currentPuzzleState = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth || 360;
    const height = this.container.clientHeight || window.innerHeight || 640;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.045);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.updateCameraPosition();

    // 3. Try Initializing WebGLRenderer with safe fallback flags for MESA / Emulator
    let webglCreated = false;
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
        precision: "mediump"
      });

      if (this.renderer && this.renderer.domElement) {
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(1);
        // Do not enable heavy shadow maps to avoid MESA rendernode search
        this.renderer.shadowMap.enabled = false;
        this.container.appendChild(this.renderer.domElement);
        webglCreated = true;
      }
    } catch (err) {
      console.warn("WebGL initialization failed, switching to 2.5D Canvas fallback:", err);
    }

    if (!webglCreated) {
      this.setupCanvas2DFallback(width, height);
      return;
    }

    // 4. Groups
    this.scene.add(this.puzzleGroup);
    this.scene.add(this.doorGroup);

    // 5. Environmental Lighting & Room Architecture
    this.setupRoomArchitecture();
    this.setupParticles();

    // 6. Bind Input Events
    this.bindEvents();

    // 7. Start Render Loop
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  setupCanvas2DFallback(width, height) {
    this.isFallback2D = true;
    this.canvas2D = document.createElement("canvas");
    this.canvas2D.width = width;
    this.canvas2D.height = height;
    this.canvas2D.style.width = "100%";
    this.canvas2D.style.height = "100%";
    this.canvas2D.style.display = "block";
    this.ctx2D = this.canvas2D.getContext("2d");
    this.container.appendChild(this.canvas2D);

    this.bindEventsFallback();
    this.renderFallback = this.renderFallback.bind(this);
    requestAnimationFrame(this.renderFallback);
  }

  setupRoomArchitecture() {
    // Ambient light
    this.ambientLight = new THREE.AmbientLight(0x1a2639, 1.5);
    this.scene.add(this.ambientLight);

    // Main key light (no shadow map to avoid MESA rendernode depth buffer searches)
    this.keyLight = new THREE.DirectionalLight(0x00f2fe, 1.6);
    this.keyLight.position.set(5, 12, 6);
    this.scene.add(this.keyLight);

    // Chamber Central Pedestal Light
    this.pointLight = new THREE.PointLight(0x9d4edd, 2.5, 15);
    this.pointLight.position.set(0, 3.5, 0);
    this.scene.add(this.pointLight);

    // Modular Floor & Grid
    const floorGeo = new THREE.CylinderGeometry(6.5, 7, 0.4, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.3,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    this.scene.add(floor);

    // Outer Glowing Ring on Floor
    const ringGeo = new THREE.RingGeometry(5.8, 6.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.01;
    this.scene.add(floorRing);

    // Central Puzzle Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.7, 1.0, 16);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      roughness: 0.2,
      metalness: 0.9
    });
    this.pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    this.pedestal.position.set(0, 0.5, 0);
    this.scene.add(this.pedestal);

    // Pedestal Top Glowing Inset
    const topGlowGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 16);
    this.topGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const topGlow = new THREE.Mesh(topGlowGeo, this.topGlowMat);
    topGlow.position.set(0, 1.02, 0);
    this.scene.add(topGlow);

    // Massive Futuristic Hydraulic Chamber Door (Back Wall)
    this.setupChamberDoor();
  }

  setupChamberDoor() {
    this.doorGroup.position.set(0, 0, -5.5);

    // Door Frame
    const frameGeo = new THREE.BoxGeometry(4.2, 4.4, 0.5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x141f36, metalness: 0.8, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.2;
    this.doorGroup.add(frame);

    // Door panels (Left & Right)
    const panelGeo = new THREE.BoxGeometry(1.6, 3.8, 0.3);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0e172a,
      metalness: 0.9,
      roughness: 0.2
    });

    this.doorLeft = new THREE.Mesh(panelGeo, panelMat);
    this.doorLeft.position.set(-0.85, 2.0, 0);
    this.doorGroup.add(this.doorLeft);

    this.doorRight = new THREE.Mesh(panelGeo, panelMat);
    this.doorRight.position.set(0.85, 2.0, 0);
    this.doorGroup.add(this.doorRight);

    // Glowing Neon Runes / Door Lines
    const stripGeo = new THREE.BoxGeometry(0.08, 3.2, 0.32);
    this.doorStripMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const stripL = new THREE.Mesh(stripGeo, this.doorStripMat);
    stripL.position.set(0.7, 0, 0);
    this.doorLeft.add(stripL);

    const stripR = new THREE.Mesh(stripGeo, this.doorStripMat);
    stripR.position.set(-0.7, 0, 0);
    this.doorRight.add(stripR);
  }

  setupParticles() {
    const count = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 14;
      positions[i + 1] = Math.random() * 8;
      positions[i + 2] = (Math.random() - 0.5) * 14;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.65
    });

    this.particles = new THREE.Points(geometry, mat);
    this.scene.add(this.particles);
  }

  setEnvironmentTheme(theme) {
    this.currentTheme = theme;
    if (this.isFallback2D) return;

    if (theme === "neon") {
      this.scene.background.setHex(0x060913);
      this.scene.fog.color.setHex(0x060913);
      if (this.keyLight) this.keyLight.color.setHex(0x00f2fe);
      if (this.pointLight) this.pointLight.color.setHex(0x4facfe);
      if (this.topGlowMat) this.topGlowMat.color.setHex(0x00f2fe);
      if (this.doorStripMat) this.doorStripMat.color.setHex(0x00f2fe);
    } else if (theme === "crystal") {
      this.scene.background.setHex(0x0c0817);
      this.scene.fog.color.setHex(0x0c0817);
      if (this.keyLight) this.keyLight.color.setHex(0x9d4edd);
      if (this.pointLight) this.pointLight.color.setHex(0xffb703);
      if (this.topGlowMat) this.topGlowMat.color.setHex(0x9d4edd);
      if (this.doorStripMat) this.doorStripMat.color.setHex(0xffb703);
    } else if (theme === "quantum") {
      this.scene.background.setHex(0x040b14);
      this.scene.fog.color.setHex(0x040b14);
      if (this.keyLight) this.keyLight.color.setHex(0xffb703);
      if (this.pointLight) this.pointLight.color.setHex(0x00f2fe);
      if (this.topGlowMat) this.topGlowMat.color.setHex(0xffb703);
      if (this.doorStripMat) this.doorStripMat.color.setHex(0x00f2fe);
    }
    this.doorOpened = false;
    if (this.doorLeft) this.doorLeft.position.x = -0.85;
    if (this.doorRight) this.doorRight.position.x = 0.85;
  }

  // Build 3D objects matching current puzzle definition
  buildPuzzle3D(levelDef, currentState) {
    this.currentLevelDef = levelDef;
    this.currentPuzzleState = currentState;

    if (this.isFallback2D) return;

    // Clear previous objects
    while (this.puzzleGroup.children.length > 0) {
      const obj = this.puzzleGroup.children[0];
      this.puzzleGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }
    this.interactiveObjects = [];

    const type = levelDef.type;
    if (type === "rotation" || type === "grand_puzzle") {
      this.buildRotationPuzzle3D(levelDef, currentState);
    } else if (type === "switch_network") {
      this.buildSwitchNetwork3D(levelDef, currentState);
    } else if (type === "sequence" || type === "pattern" || type === "logic_deduction") {
      this.buildInteractivePedestals3D(levelDef, currentState);
    }
  }

  buildRotationPuzzle3D(levelDef, currentState) {
    const rings = levelDef.rings;
    const radii = [0.8, 1.3, 1.8];

    rings.forEach((ringDef, idx) => {
      const radius = radii[idx] || (0.8 + idx * 0.5);
      const ringGeo = new THREE.TorusGeometry(radius, 0.08, 12, 36);
      const ringMat = new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x00f2fe : (idx === 1 ? 0x9d4edd : 0xffb703),
        metalness: 0.8,
        roughness: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(0, 1.2 + idx * 0.12, 0);
      ringMesh.userData = { isRing: true, ringId: ringDef.id, index: idx };

      // Glowing Notch
      const notchGeo = new THREE.BoxGeometry(0.18, 0.22, 0.22);
      const notchMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const notch = new THREE.Mesh(notchGeo, notchMat);
      notch.position.set(0, radius, 0);
      ringMesh.add(notch);

      // Current angle
      const curAngle = currentState.angles[ringDef.id] || 0;
      ringMesh.rotation.z = (curAngle * Math.PI) / 180;

      this.puzzleGroup.add(ringMesh);
      this.interactiveObjects.push(ringMesh);
    });

    // Central Energy Core Sphere
    const coreGeo = new THREE.SphereGeometry(0.4, 20, 20);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.4, 0);
    this.puzzleGroup.add(core);
  }

  buildSwitchNetwork3D(levelDef, currentState) {
    const count = levelDef.nodeCount;
    const radius = 1.6;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 10);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1b2842, metalness: 0.7, roughness: 0.3 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 1.3, z);
      this.puzzleGroup.add(pillar);

      const sphereGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const isActive = currentState.nodes[i];
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isActive ? 0x00f2fe : 0x334155,
        emissive: isActive ? 0x00f2fe : 0x000000,
        emissiveIntensity: isActive ? 0.9 : 0
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(x, 1.85, z);
      sphere.userData = { isSwitch: true, nodeIndex: i };

      this.puzzleGroup.add(sphere);
      this.interactiveObjects.push(sphere);
    }

    const lineMat = new THREE.LineBasicMaterial({ color: 0x4facfe, opacity: 0.45, transparent: true });
    for (let i = 0; i < count; i++) {
      const next = (i + 1) % count;
      const a1 = (i / count) * Math.PI * 2 - Math.PI / 2;
      const a2 = (next / count) * Math.PI * 2 - Math.PI / 2;
      const pts = [
        new THREE.Vector3(Math.cos(a1) * radius, 1.85, Math.sin(a1) * radius),
        new THREE.Vector3(Math.cos(a2) * radius, 1.85, Math.sin(a2) * radius)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(lineGeo, lineMat);
      this.puzzleGroup.add(line);
    }
  }

  buildInteractivePedestals3D(levelDef, currentState) {
    const count = levelDef.options ? levelDef.options.length : 0;
    const radius = 2.4;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.7, 12);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x162238, metalness: 0.8, roughness: 0.2 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(x, 0.85, z);
      this.puzzleGroup.add(base);

      const cubeGeo = new THREE.OctahedronGeometry(0.3, 0);
      const isSelected = currentState.selectedOption === levelDef.options[i];
      const cubeMat = new THREE.MeshStandardMaterial({
        color: isSelected ? 0xffb703 : 0x00f2fe,
        emissive: isSelected ? 0xffb703 : 0x00f2fe,
        emissiveIntensity: isSelected ? 0.9 : 0.4,
        metalness: 0.4,
        roughness: 0.1
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      cube.position.set(x, 1.5, z);
      cube.userData = { isOption: true, optionIndex: i, optionValue: levelDef.options[i] };

      this.puzzleGroup.add(cube);
      this.interactiveObjects.push(cube);
    }

    const centerGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const centerMat = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      emissive: 0x9d4edd,
      emissiveIntensity: 0.7,
      wireframe: true
    });
    this.centerHolo = new THREE.Mesh(centerGeo, centerMat);
    this.centerHolo.position.set(0, 1.7, 0);
    this.puzzleGroup.add(this.centerHolo);
  }

  openChamberDoor(onComplete) {
    if (this.doorOpened) return;
    this.doorOpened = true;

    if (this.isFallback2D) {
      setTimeout(() => { if (onComplete) onComplete(); }, 800);
      return;
    }

    const startL = this.doorLeft.position.x;
    const startR = this.doorRight.position.x;
    const targetL = -2.2;
    const targetR = 2.2;
    const duration = 1200;
    const startTime = performance.now();

    const anim = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.doorLeft.position.x = startL + (targetL - startL) * ease;
      this.doorRight.position.x = startR + (targetR - startR) * ease;

      if (progress < 1) {
        requestAnimationFrame(anim);
      } else {
        if (onComplete) onComplete();
      }
    };
    requestAnimationFrame(anim);
  }

  updateCameraPosition() {
    if (!this.camera) return;
    const x = this.target.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.target.y + this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.target.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  resetCamera() {
    this.spherical = Object.assign({}, this.defaultSpherical);
    this.updateCameraPosition();
  }

  bindEvents() {
    if (!this.renderer || !this.renderer.domElement) return;
    const dom = this.renderer.domElement;
    let dragDistance = 0;

    const onPointerDown = (clientX, clientY) => {
      this.isDragging = true;
      dragDistance = 0;
      this.prevPointer.x = clientX;
      this.prevPointer.y = clientY;
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.prevPointer.x;
      const dy = clientY - this.prevPointer.y;
      dragDistance += Math.hypot(dx, dy);

      this.spherical.theta -= dx * 0.007;
      this.spherical.phi -= dy * 0.007;
      this.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, this.spherical.phi));

      this.prevPointer.x = clientX;
      this.prevPointer.y = clientY;
      this.updateCameraPosition();
    };

    const onPointerUp = (clientX, clientY) => {
      if (this.isDragging && dragDistance < 10) {
        this.performRaycast(clientX, clientY);
      }
      this.isDragging = false;
    };

    dom.addEventListener("mousedown", (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", (e) => onPointerUp(e.clientX, e.clientY));

    dom.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        this.touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    window.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2 && this.touchStartDist > 0) {
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = this.touchStartDist / curDist;
        this.spherical.radius = Math.max(4.5, Math.min(13.0, this.spherical.radius * (1 + (factor - 1) * 0.06)));
        this.touchStartDist = curDist;
        this.updateCameraPosition();
      }
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
      if (e.changedTouches.length > 0) {
        onPointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      this.touchStartDist = 0;
    });

    window.addEventListener("resize", () => {
      const w = this.container.clientWidth || window.innerWidth;
      const h = this.container.clientHeight || window.innerHeight;
      if (this.camera && this.renderer) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
  }

  performRaycast(clientX, clientY) {
    if (!this.renderer || !this.camera) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && (!target.userData || Object.keys(target.userData).length === 0) && target.parent) {
        target = target.parent;
      }
      if (target && target.userData && this.onObjectClick) {
        this.onObjectClick(target.userData);
      }
    }
  }

  bindEventsFallback() {
    window.addEventListener("resize", () => {
      if (this.canvas2D) {
        this.canvas2D.width = this.container.clientWidth || window.innerWidth;
        this.canvas2D.height = this.container.clientHeight || window.innerHeight;
      }
    });
  }

  renderFallback() {
    if (!this.animating) return;
    requestAnimationFrame(this.renderFallback);

    if (!this.ctx2D || !this.canvas2D) return;
    const ctx = this.ctx2D;
    const w = this.canvas2D.width;
    const h = this.canvas2D.height;
    const time = Date.now() * 0.002;

    // Background
    ctx.fillStyle = "#060913";
    ctx.fillRect(0, 0, w, h);

    // Glowing chamber lines
    ctx.strokeStyle = "rgba(0, 242, 254, 0.15)";
    ctx.lineWidth = 1;
    const cx = w / 2;
    const cy = h / 2 - 40;

    for (let r = 60; r <= 220; r += 40) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Central Sphere & Rings in 2D Fallback
    const pulse = Math.sin(time) * 10;
    const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50 + pulse);
    grad.addColorStop(0, "#00f2fe");
    grad.addColorStop(0.7, "#9d4edd");
    grad.addColorStop(1, "transparent");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();

    // Render interactive rings if rotation puzzle
    if (this.currentLevelDef && (this.currentLevelDef.type === "rotation" || this.currentLevelDef.type === "grand_puzzle")) {
      const rings = this.currentLevelDef.rings || [];
      rings.forEach((r, idx) => {
        const rad = 75 + idx * 30;
        const ang = ((this.currentPuzzleState?.angles[r.id] || 0) * Math.PI) / 180;
        ctx.strokeStyle = idx === 0 ? "#00f2fe" : (idx === 1 ? "#9d4edd" : "#ffb703");
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Notch
        const nx = cx + Math.cos(ang - Math.PI / 2) * rad;
        const ny = cy + Math.sin(ang - Math.PI / 2) * rad * 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(nx, ny, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Render nodes if switch network
    if (this.currentLevelDef && this.currentLevelDef.type === "switch_network") {
      const count = this.currentLevelDef.nodeCount || 3;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + Math.cos(a) * 110;
        const ny = cy + Math.sin(a) * 55;
        const active = this.currentPuzzleState?.nodes[i];

        ctx.fillStyle = active ? "#00f2fe" : "#334155";
        ctx.beginPath();
        ctx.arc(nx, ny, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = active ? "#ffffff" : "#1e293b";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  render() {
    if (!this.animating) return;
    requestAnimationFrame(this.render);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    if (this.centerHolo) {
      this.centerHolo.rotation.y += delta * 0.6;
      this.centerHolo.rotation.x += delta * 0.4;
      this.centerHolo.position.y = 1.7 + Math.sin(elapsed * 2) * 0.06;
    }

    if (this.particles) {
      this.particles.rotation.y += delta * 0.03;
    }

    if (this.pointLight) {
      this.pointLight.intensity = 2.2 + Math.sin(elapsed * 3) * 0.5;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
