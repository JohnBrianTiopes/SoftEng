import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface Scene3D {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  dispose: () => void;
}

export function createScene3D(mount: HTMLElement): Scene3D {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.6, 11);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  renderer.domElement.classList.add('three-canvas');

  // Lighting: soft ambient fill + a key spotlight for that "on a pedestal" look.
  scene.add(new THREE.AmbientLight(0xfff4d8, 0.7));
  const hemi = new THREE.HemisphereLight(0xfff2cf, 0x4a3418, 0.6);
  scene.add(hemi);

  const spot = new THREE.SpotLight(0xfff4d0, 60, 24, Math.PI / 5, 0.5, 1.4);
  spot.position.set(0, 7, 5);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  scene.add(spot);
  scene.add(spot.target);

  const rim = new THREE.DirectionalLight(0xffe9b8, 0.35);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  // Ground + wooden pedestal, aligned so the character's feet (y ≈ -2.55
  // once the rig is recentered) land exactly on the pedestal's top surface.
  const feetY = -2.55;
  const pedestalHeight = 0.4;
  const pedestalTop = feetY;
  const pedestalCenterY = pedestalTop - pedestalHeight / 2;

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 48),
    new THREE.MeshStandardMaterial({ color: 0xcdb87e, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = pedestalCenterY - pedestalHeight / 2 - 0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.7, 1.85, pedestalHeight, 24),
    new THREE.MeshStandardMaterial({ color: 0x6e4527, roughness: 0.9 }),
  );
  pedestal.position.y = pedestalCenterY;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, -0.15, 0);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 16;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.58;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 2.2;
  controls.update();

  renderer.domElement.addEventListener('pointerdown', () => {
    controls.autoRotate = false;
  });

  function resize(): void {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  let rafId = 0;
  function animate(): void {
    controls.update();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }
  animate();

  return {
    scene,
    camera,
    renderer,
    controls,
    dispose: () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      renderer.dispose();
    },
  };
}
