import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export type BodyPartRole = 'head' | 'torso' | 'armLeft' | 'armRight' | 'legLeft' | 'legRight';

export interface CharacterParts {
  root: THREE.Group;
  parts: Record<BodyPartRole, THREE.Mesh>;
  boxes: Record<BodyPartRole, THREE.Box3>;
}

const loader = new OBJLoader();

function meshesOf(root: THREE.Object3D): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  return meshes;
}

/**
 * Classifies the 6 blocky body-part meshes purely from their local bounding
 * boxes, so this works regardless of how the groups happen to be named in
 * the source .obj file (the provided asset names them "Player1".."Player6").
 */
function classifyParts(meshes: THREE.Mesh[]): {
  parts: Record<BodyPartRole, THREE.Mesh>;
  boxes: Record<BodyPartRole, THREE.Box3>;
} {
  interface Info {
    mesh: THREE.Mesh;
    box: THREE.Box3;
    center: THREE.Vector3;
    size: THREE.Vector3;
  }

  const infos: Info[] = meshes.map((mesh) => {
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!.clone();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    return { mesh, box, center, size };
  });

  // Legs: the two parts with the lowest vertical center.
  const byY = [...infos].sort((a, b) => a.center.y - b.center.y);
  const legs = byY.slice(0, 2);
  const rest = byY.slice(2);

  // Torso: among the remainder, the widest part along X.
  const torsoInfo = [...rest].sort((a, b) => b.size.x - a.size.x)[0];
  const afterTorso = rest.filter((i) => i !== torsoInfo);

  // Head: the remaining part with the highest vertical center.
  const headInfo = [...afterTorso].sort((a, b) => b.center.y - a.center.y)[0];
  const arms = afterTorso.filter((i) => i !== headInfo);

  const legLeft = legs.find((i) => i.center.x <= 0) ?? legs[0];
  const legRight = legs.find((i) => i !== legLeft) ?? legs[1];
  const armLeft = arms.find((i) => i.center.x <= 0) ?? arms[0];
  const armRight = arms.find((i) => i !== armLeft) ?? arms[1];

  return {
    parts: {
      head: headInfo.mesh,
      torso: torsoInfo.mesh,
      armLeft: armLeft.mesh,
      armRight: armRight.mesh,
      legLeft: legLeft.mesh,
      legRight: legRight.mesh,
    },
    boxes: {
      head: headInfo.box,
      torso: torsoInfo.box,
      armLeft: armLeft.box,
      armRight: armRight.box,
      legLeft: legLeft.box,
      legRight: legRight.box,
    },
  };
}

export async function loadCharacterModel(url: string): Promise<CharacterParts> {
  const obj = await loader.loadAsync(url);

  const meshes = meshesOf(obj);
  const { parts, boxes } = classifyParts(meshes);

  // Recenter on the origin by baking the offset directly into each mesh's
  // geometry (rather than shifting the parent group's transform). That way
  // `root` stays at identity and the returned `boxes` - which we also shift
  // here - describe the *same* local coordinate space that `root`'s children
  // (hair/weapon/accessory anchors, all parented under `root`) live in.
  const fullBox = new THREE.Box3();
  Object.values(boxes).forEach((b) => fullBox.union(b));
  const center = new THREE.Vector3();
  fullBox.getCenter(center);

  meshes.forEach((mesh) => {
    mesh.geometry.translate(-center.x, -center.y, -center.z);
    mesh.geometry.computeBoundingBox();
    mesh.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0.05 });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
  Object.values(boxes).forEach((b) => {
    b.min.sub(center);
    b.max.sub(center);
  });

  return { root: obj, parts, boxes };
}
