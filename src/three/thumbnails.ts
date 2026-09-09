import * as THREE from 'three';
import { CATALOG, colorNumberOf } from '../items.ts';
import { buildHair, buildCrown, buildShield, buildCape, buildWeapon, buildShoe, buildFaceTexture } from './parts3d.ts';

const SIZE = 128;
const SKIN_COLOR = 0xe8b98a;

let renderer: THREE.WebGLRenderer | null = null;

function getRenderer(): THREE.WebGLRenderer {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(SIZE, SIZE);
    renderer.setPixelRatio(1);
  }
  return renderer;
}

function simpleBox(w: number, h: number, d: number, color: number): THREE.Mesh {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 }));
}

function buildThumbnailObject(categoryKey: string, id: string): { object: THREE.Object3D; distance: number } {
  const color = colorNumberOf(categoryKey, id);

  switch (categoryKey) {
    case 'hair':
      return { object: buildHair(id, color), distance: 2.6 };
    case 'face': {
      const g = new THREE.Group();
      g.add(simpleBox(1.2, 1.2, 1.2, SKIN_COLOR));
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.68),
        new THREE.MeshBasicMaterial({ map: buildFaceTexture(id), transparent: true, toneMapped: false }),
      );
      plane.position.z = 0.61;
      g.add(plane);
      return { object: g, distance: 2.6 };
    }
    case 'outfit': {
      const g = new THREE.Group();
      g.add(simpleBox(2, 2, 1, color));
      g.add(simpleBox(0.8, 2, 0.8, color).translateX(-1.35));
      g.add(simpleBox(0.8, 2, 0.8, color).translateX(1.35));
      return { object: g, distance: 4.6 };
    }
    case 'pants': {
      const g = new THREE.Group();
      g.add(simpleBox(0.9, 1.8, 0.9, color).translateX(-0.5));
      g.add(simpleBox(0.9, 1.8, 0.9, color).translateX(0.5));
      return { object: g, distance: 3.4 };
    }
    case 'shoes':
      return { object: buildShoe(id, color), distance: 2.2 };
    case 'weapon':
      return { object: buildWeapon(id, color), distance: 4.2 };
    case 'accessory': {
      if (id === 'Crown') return { object: buildCrown(color), distance: 2.4 };
      if (id === 'Shield') return { object: buildShield(color), distance: 3.0 };
      if (id === 'Cape') return { object: buildCape(color), distance: 5.5 };
      // None
      const g = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.08, 12, 24),
        new THREE.MeshStandardMaterial({ color: 0xc9bd9e, roughness: 0.6 }),
      );
      g.add(ring);
      return { object: g, distance: 2.4 };
    }
    case 'armorColor':
    default: {
      const g = new THREE.Group();
      g.add(simpleBox(1.4, 1.0, 0.4, color));
      g.add(simpleBox(1.5, 0.28, 0.44, color).translateY(0.5));
      return { object: g, distance: 2.8 };
    }
  }
}

function renderThumbnail(categoryKey: string, id: string): string {
  const gl = getRenderer();
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xfff2d8, 1.1);
  key.position.set(2.5, 3, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.35);
  fill.position.set(-3, -1, -2);
  scene.add(fill);

  const { object, distance } = buildThumbnailObject(categoryKey, id);
  object.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.computeBoundingBox();
  });
  scene.add(object);

  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  object.position.sub(center);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(distance * 0.55, distance * 0.4, distance * 0.85);
  camera.lookAt(0, 0, 0);

  gl.setSize(SIZE, SIZE);
  gl.setClearColor(0x000000, 0);
  gl.render(scene, camera);
  const dataUrl = gl.domElement.toDataURL('image/png');

  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(material)) material.forEach((m) => m.dispose());
    else material?.dispose();
  });

  return dataUrl;
}

const cache = new Map<string, string>();

export function getThumbnail(categoryKey: string, id: string): string {
  const key = `${categoryKey}:${id}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const dataUrl = renderThumbnail(categoryKey, id);
  cache.set(key, dataUrl);
  return dataUrl;
}

export function preloadAllThumbnails(): void {
  CATALOG.forEach((category) => {
    category.items.forEach((item) => getThumbnail(category.key, item.id));
  });
}
