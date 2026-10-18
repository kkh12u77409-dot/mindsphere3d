import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LevelDefinition, PuzzlePlayState, EnvironmentTheme } from '../types/game';

interface Chamber3DProps {
  level: LevelDefinition | null;
  puzzleState: PuzzlePlayState | null;
  isDoorOpening: boolean;
  shakeTrigger?: number;
  isGhostMode?: boolean;
  cameraOverride?: { theta: number; phi: number; radius: number } | null;
  onObjectClick?: (data: { isRing?: boolean; ringId?: string; isSwitch?: boolean; nodeIndex?: number; isOption?: boolean; optionValue?: string }) => void;
  onDoorOpened?: () => void;
}

export const Chamber3D: React.FC<Chamber3DProps> = ({
  level,
  puzzleState,
  isDoorOpening,
  shakeTrigger = 0,
  isGhostMode = false,
  cameraOverride = null,
  onObjectClick,
  onDoorOpened
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer | null;
    interactiveObjects: THREE.Object3D[];
    puzzleGroup: THREE.Group;
    doorLeft: THREE.Mesh | null;
    doorRight: THREE.Mesh | null;
    particles: THREE.Points | null;
    centerHolo: THREE.Mesh | null;
    keyLight: THREE.DirectionalLight | null;
    pointLight: THREE.PointLight | null;
    topGlowMat: THREE.MeshBasicMaterial | null;
    doorStripMat: THREE.MeshBasicMaterial | null;
    spherical: { radius: number; theta: number; phi: number };
    defaultSpherical: { radius: number; theta: number; phi: number };
    updateCamera: () => void;
    resetCamera: () => void;
    triggerShake: () => void;
    openDoor: (onDone?: () => void) => void;
    setTheme: (theme: EnvironmentTheme) => void;
    buildPuzzle: (lvl: LevelDefinition, state: PuzzlePlayState) => void;
    cleanup: () => void;
  } | null>(null);

  // Expose camera controls to window
  useEffect(() => {
    (window as unknown as { resetChamberCamera?: () => void }).resetChamberCamera = () => {
      engineRef.current?.resetCamera();
    };
    (window as unknown as { getChamberCamera?: () => { theta: number; phi: number; radius: number } | null }).getChamberCamera = () => {
      if (!engineRef.current) return null;
      return {
        theta: engineRef.current.spherical.theta,
        phi: engineRef.current.spherical.phi,
        radius: engineRef.current.spherical.radius
      };
    };
    return () => {
      delete (window as unknown as { resetChamberCamera?: () => void }).resetChamberCamera;
      delete (window as unknown as { getChamberCamera?: () => void }).getChamberCamera;
    };
  }, []);

  // Sync camera override for Ghost Mode playback
  useEffect(() => {
    if (cameraOverride && engineRef.current) {
      engineRef.current.spherical.theta = cameraOverride.theta;
      engineRef.current.spherical.phi = cameraOverride.phi;
      engineRef.current.spherical.radius = cameraOverride.radius;
      engineRef.current.updateCamera();
    }
  }, [cameraOverride]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    scene.fog = new THREE.FogExp2(0x060913, 0.045);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const target = new THREE.Vector3(0, 1.2, 0);
    const spherical = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3 };
    const defaultSpherical = { radius: 8.5, theta: Math.PI / 4, phi: Math.PI / 3 };

    const updateCamera = () => {
      const x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const y = target.y + spherical.radius * Math.cos(spherical.phi);
      const z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.position.set(x, y, z);
      camera.lookAt(target);
    };
    updateCamera();

    // 3. Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        precision: 'mediump'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);
    } catch (err) {
      console.warn('WebGL init note:', err);
    }

    // 4. Groups
    const puzzleGroup = new THREE.Group();
    const doorGroup = new THREE.Group();
    scene.add(puzzleGroup);
    scene.add(doorGroup);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2639, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f2fe, 1.6);
    keyLight.position.set(5, 12, 6);
    scene.add(keyLight);

    const pointLight = new THREE.PointLight(0x9d4edd, 2.5, 15);
    pointLight.position.set(0, 3.5, 0);
    scene.add(pointLight);

    // 6. Architecture & Pedestal
    const floorGeo = new THREE.CylinderGeometry(6.5, 7, 0.4, 28);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      roughness: 0.3,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    const ringGeo = new THREE.RingGeometry(5.8, 6.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, side: THREE.DoubleSide });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = 0.01;
    scene.add(floorRing);

    const pedestalGeo = new THREE.CylinderGeometry(1.4, 1.7, 1.0, 18);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x111c30,
      roughness: 0.2,
      metalness: 0.9
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, 0.5, 0);
    scene.add(pedestal);

    const topGlowGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.05, 18);
    const topGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const topGlow = new THREE.Mesh(topGlowGeo, topGlowMat);
    topGlow.position.set(0, 1.02, 0);
    scene.add(topGlow);

    // 7. Hydraulic Chamber Blast Door (Back Wall)
    doorGroup.position.set(0, 0, -5.5);

    const frameGeo = new THREE.BoxGeometry(4.2, 4.4, 0.5);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x141f36, metalness: 0.8, roughness: 0.4 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 2.2;
    doorGroup.add(frame);

    const panelGeo = new THREE.BoxGeometry(1.6, 3.8, 0.3);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x0e172a, metalness: 0.9, roughness: 0.2 });

    const doorLeft = new THREE.Mesh(panelGeo, panelMat);
    doorLeft.position.set(-0.85, 2.0, 0);
    doorGroup.add(doorLeft);

    const doorRight = new THREE.Mesh(panelGeo, panelMat);
    doorRight.position.set(0.85, 2.0, 0);
    doorGroup.add(doorRight);

    const stripGeo = new THREE.BoxGeometry(0.08, 3.2, 0.32);
    const doorStripMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const stripL = new THREE.Mesh(stripGeo, doorStripMat);
    stripL.position.set(0.7, 0, 0);
    doorLeft.add(stripL);

    const stripR = new THREE.Mesh(stripGeo, doorStripMat);
    stripR.position.set(-0.7, 0, 0);
    doorRight.add(stripR);

    // 8. Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = Math.random() * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    let centerHolo: THREE.Mesh | null = null;
    let interactiveObjects: THREE.Object3D[] = [];

    // Helper functions
    const setTheme = (theme: EnvironmentTheme) => {
      if (theme === 'neon') {
        scene.background = new THREE.Color(0x060913);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x060913);
        keyLight.color.setHex(0x00f2fe);
        pointLight.color.setHex(0x4facfe);
        topGlowMat.color.setHex(0x00f2fe);
        doorStripMat.color.setHex(0x00f2fe);
      } else if (theme === 'crystal') {
        scene.background = new THREE.Color(0x0c0817);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x0c0817);
        keyLight.color.setHex(0x9d4edd);
        pointLight.color.setHex(0xffb703);
        topGlowMat.color.setHex(0x9d4edd);
        doorStripMat.color.setHex(0xffb703);
      } else if (theme === 'quantum') {
        scene.background = new THREE.Color(0x040b14);
        if (scene.fog) (scene.fog as THREE.FogExp2).color.setHex(0x040b14);
        keyLight.color.setHex(0xffb703);
        pointLight.color.setHex(0x00f2fe);
        topGlowMat.color.setHex(0xffb703);
        doorStripMat.color.setHex(0x00f2fe);
      }
      doorLeft.position.x = -0.85;
      doorRight.position.x = 0.85;
    };

    const buildPuzzle = (lvl: LevelDefinition, state: PuzzlePlayState) => {
      // Clear old puzzle objects
      while (puzzleGroup.children.length > 0) {
        const obj = puzzleGroup.children[0];
        puzzleGroup.remove(obj);
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
      }
      interactiveObjects = [];

      const type = lvl.type;
      if (type === 'rotation' || type === 'grand_puzzle') {
        const rings = lvl.rings || [];
        const radii = [0.8, 1.3, 1.8];

        rings.forEach((ringDef, idx) => {
          const radius = radii[idx] || (0.8 + idx * 0.5);
          const ringMeshGeo = new THREE.TorusGeometry(radius, 0.08, 14, 36);
          const ringMeshMat = new THREE.MeshStandardMaterial({
            color: idx === 0 ? 0x00f2fe : (idx === 1 ? 0x9d4edd : 0xffb703),
            metalness: 0.8,
            roughness: 0.2
          });
          const ringMesh = new THREE.Mesh(ringMeshGeo, ringMeshMat);
          ringMesh.rotation.x = Math.PI / 2;
          ringMesh.position.set(0, 1.2 + idx * 0.12, 0);
          ringMesh.userData = { isRing: true, ringId: ringDef.id, index: idx };

          // Glowing Notch indicator
          const notchMeshGeo = new THREE.BoxGeometry(0.18, 0.22, 0.22);
          const notchMeshMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const notch = new THREE.Mesh(notchMeshGeo, notchMeshMat);
          notch.position.set(0, radius, 0);
          ringMesh.add(notch);

          const curAngle = state.angles[ringDef.id] || 0;
          ringMesh.rotation.z = (curAngle * Math.PI) / 180;

          puzzleGroup.add(ringMesh);
          interactiveObjects.push(ringMesh);
        });

        // Central Energy Core Sphere
        const coreGeo = new THREE.SphereGeometry(0.4, 20, 20);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(0, 1.4, 0);
        puzzleGroup.add(core);
      }

      if (type === 'switch_network') {
        const count = lvl.nodeCount || 3;
        const radius = 1.6;

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.8, 12);
          const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1b2842, metalness: 0.7, roughness: 0.3 });
          const pillar = new THREE.Mesh(pillarGeo, pillarMat);
          pillar.position.set(x, 1.3, z);
          puzzleGroup.add(pillar);

          const sphereGeo = new THREE.SphereGeometry(0.25, 18, 18);
          const isActive = state.nodes[i];
          const sphereMat = new THREE.MeshStandardMaterial({
            color: isActive ? 0x00f2fe : 0x334155,
            emissive: isActive ? 0x00f2fe : 0x000000,
            emissiveIntensity: isActive ? 0.95 : 0
          });
          const sphere = new THREE.Mesh(sphereGeo, sphereMat);
          sphere.position.set(x, 1.85, z);
          sphere.userData = { isSwitch: true, nodeIndex: i };

          puzzleGroup.add(sphere);
          interactiveObjects.push(sphere);
        }

        const lineMat = new THREE.LineBasicMaterial({ color: 0x4facfe, opacity: 0.5, transparent: true });
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
          puzzleGroup.add(line);
        }
      }

      if (type === 'sequence' || type === 'pattern' || type === 'logic_deduction' || type === 'grand_puzzle') {
        const options = lvl.options || [];
        const count = options.length;
        const radius = 2.4;

        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const baseGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.7, 12);
          const baseMat = new THREE.MeshStandardMaterial({ color: 0x162238, metalness: 0.8, roughness: 0.2 });
          const base = new THREE.Mesh(baseGeo, baseMat);
          base.position.set(x, 0.85, z);
          puzzleGroup.add(base);

          const cubeGeo = new THREE.OctahedronGeometry(0.3, 0);
          const isSelected = state.selectedOption === options[i];
          const cubeMat = new THREE.MeshStandardMaterial({
            color: isSelected ? 0xffb703 : 0x00f2fe,
            emissive: isSelected ? 0xffb703 : 0x00f2fe,
            emissiveIntensity: isSelected ? 0.95 : 0.4,
            metalness: 0.4,
            roughness: 0.1
          });
          const cube = new THREE.Mesh(cubeGeo, cubeMat);
          cube.position.set(x, 1.5, z);
          cube.userData = { isOption: true, optionIndex: i, optionValue: options[i] };

          puzzleGroup.add(cube);
          interactiveObjects.push(cube);
        }

        const centerGeo = new THREE.IcosahedronGeometry(0.5, 0);
        const centerMat = new THREE.MeshStandardMaterial({
          color: 0x9d4edd,
          emissive: 0x9d4edd,
          emissiveIntensity: 0.7,
          wireframe: true
        });
        centerHolo = new THREE.Mesh(centerGeo, centerMat);
        centerHolo.position.set(0, 1.7, 0);
        puzzleGroup.add(centerHolo);
      }

      if (engineRef.current) {
        engineRef.current.interactiveObjects = interactiveObjects;
        engineRef.current.centerHolo = centerHolo;
      }
    };

    const openDoor = (onDone?: () => void) => {
      const startL = doorLeft.position.x;
      const startR = doorRight.position.x;
      const targetL = -2.2;
      const targetR = 2.2;
      const duration = 1200;
      const startTime = performance.now();

      const anim = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        doorLeft.position.x = startL + (targetL - startL) * ease;
        doorRight.position.x = startR + (targetR - startR) * ease;

        if (progress < 1) {
          requestAnimationFrame(anim);
        } else {
          if (onDone) onDone();
        }
      };
      requestAnimationFrame(anim);
    };

    const resetCamera = () => {
      spherical.radius = defaultSpherical.radius;
      spherical.theta = defaultSpherical.theta;
      spherical.phi = defaultSpherical.phi;
      updateCamera();
    };

    // User Orbit Drag and Raycasting
    let isDragging = false;
    let dragDist = 0;
    const prevPointer = { x: 0, y: 0 };
    let touchStartDist = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const dom = renderer ? renderer.domElement : container;

    const performRaycast = (clientX: number, clientY: number) => {
      if (!renderer) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjects, true);

      if (intersects.length > 0) {
        let tgt: THREE.Object3D | null = intersects[0].object;
        while (tgt && (!tgt.userData || Object.keys(tgt.userData).length === 0) && tgt.parent) {
          tgt = tgt.parent;
        }
        if (tgt && tgt.userData && onObjectClick) {
          onObjectClick(tgt.userData);
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragDist = 0;
      prevPointer.x = e.clientX;
      prevPointer.y = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      dragDist += Math.hypot(dx, dy);

      spherical.theta -= dx * 0.007;
      spherical.phi -= dy * 0.007;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi));

      prevPointer.x = e.clientX;
      prevPointer.y = e.clientY;
      updateCamera();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging && dragDist < 8) {
        performRaycast(e.clientX, e.clientY);
      }
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragDist = 0;
        prevPointer.x = e.touches[0].clientX;
        prevPointer.y = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - prevPointer.x;
        const dy = e.touches[0].clientY - prevPointer.y;
        dragDist += Math.hypot(dx, dy);

        spherical.theta -= dx * 0.007;
        spherical.phi -= dy * 0.007;
        spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi));

        prevPointer.x = e.touches[0].clientX;
        prevPointer.y = e.touches[0].clientY;
        updateCamera();
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const curDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = touchStartDist / curDist;
        spherical.radius = Math.max(4.5, Math.min(13.0, spherical.radius * (1 + (factor - 1) * 0.06)));
        touchStartDist = curDist;
        updateCamera();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0 && isDragging && dragDist < 10) {
        performRaycast(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      }
      isDragging = false;
      touchStartDist = 0;
    };

    const onResize = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (renderer) renderer.setSize(w, h);
    };

    dom.addEventListener('mousedown', onMouseDown as EventListener);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    dom.addEventListener('touchstart', onTouchStart as EventListener, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    // Camera Shake
    let shakeTimer = 0;
    const SHAKE_DURATION = 0.45;

    const triggerShake = () => {
      shakeTimer = SHAKE_DURATION;
      if (container) {
        container.classList.remove('camera-shake');
        void container.offsetWidth;
        container.classList.add('camera-shake');
        setTimeout(() => {
          container.classList.remove('camera-shake');
        }, 450);
      }
    };

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      if (centerHolo) {
        centerHolo.rotation.y += delta * 0.6;
        centerHolo.rotation.x += delta * 0.4;
        centerHolo.position.y = 1.7 + Math.sin(elapsed * 2) * 0.06;
      }

      if (particles) {
        particles.rotation.y += delta * 0.03;
      }

      if (pointLight) {
        pointLight.intensity = 2.2 + Math.sin(elapsed * 3) * 0.5;
      }

      // Subtle 3D camera shake jitter with smooth decay
      if (shakeTimer > 0) {
        shakeTimer -= delta;
        const progress = Math.max(0, shakeTimer / SHAKE_DURATION);
        const amplitude = Math.pow(progress, 1.8) * 0.14;
        camera.position.x += (Math.random() - 0.5) * 2 * amplitude;
        camera.position.y += (Math.random() - 0.5) * 2 * amplitude;
        camera.position.z += (Math.random() - 0.5) * 2 * amplitude;
      }

      if (renderer) {
        renderer.render(scene, camera);
      }
    };
    animate();

    engineRef.current = {
      scene,
      camera,
      renderer,
      interactiveObjects,
      puzzleGroup,
      doorLeft,
      doorRight,
      particles,
      centerHolo,
      keyLight,
      pointLight,
      topGlowMat,
      doorStripMat,
      spherical,
      defaultSpherical,
      updateCamera,
      resetCamera,
      triggerShake,
      openDoor,
      setTheme,
      buildPuzzle,
      cleanup: () => {
        cancelAnimationFrame(animId);
        dom.removeEventListener('mousedown', onMouseDown as EventListener);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        dom.removeEventListener('touchstart', onTouchStart as EventListener);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('resize', onResize);

        if (renderer && renderer.domElement) {
          renderer.dispose();
          if (renderer.domElement.parentElement) {
            renderer.domElement.parentElement.removeChild(renderer.domElement);
          }
        }
      }
    };

    return () => {
      engineRef.current?.cleanup();
      engineRef.current = null;
    };
  }, []);

  // Update theme and rebuild puzzle when level or puzzleState change
  useEffect(() => {
    if (!engineRef.current || !level || !puzzleState) return;
    engineRef.current.setTheme(level.environment);
    engineRef.current.buildPuzzle(level, puzzleState);
  }, [level, puzzleState]);

  // Trigger camera shake animation
  useEffect(() => {
    if (shakeTrigger > 0 && engineRef.current) {
      engineRef.current.triggerShake();
    }
  }, [shakeTrigger]);

  // Trigger door opening when chamber is solved
  useEffect(() => {
    if (isDoorOpening && engineRef.current) {
      engineRef.current.openDoor(() => {
        if (onDoorOpened) onDoorOpened();
      });
    }
  }, [isDoorOpening, onDoorOpened]);

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      className={isGhostMode ? 'ghost-mode-active' : ''}
    />
  );
};

