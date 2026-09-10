import * as THREE from 'three';
import { loadCharacterModel } from './loadCharacterModel.ts';
import { buildHair, buildCrown, buildShield, buildCape, buildWeapon, buildShoe, buildAccent, buildFaceTexture } from './parts3d.ts';
import type { CharacterState } from '../memento.ts';
import { colorNumberOf } from '../items.ts';

const SKIN_COLOR = 0xe8b98a;

export class CharacterController {
  public readonly group = new THREE.Group();
  private ready = false;

  private hairSlot = new THREE.Group();
  private headAccessorySlot = new THREE.Group();
  private bodyAccessorySlot = new THREE.Group();
  private weaponSlot = new THREE.Group();
  private shoeSlotLeft = new THREE.Group();
  private shoeSlotRight = new THREE.Group();
  private accentSlot = new THREE.Group();
  private faceMesh!: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;

  private headMat!: THREE.MeshStandardMaterial;
  private torsoMat!: THREE.MeshStandardMaterial;
  private armMat!: THREE.MeshStandardMaterial;
  private legMat!: THREE.MeshStandardMaterial;

  public async load(url: string): Promise<void> {
    const { root, parts, boxes } = await loadCharacterModel(url);

    this.headMat = parts.head.material as THREE.MeshStandardMaterial;
    this.torsoMat = parts.torso.material as THREE.MeshStandardMaterial;
    this.armMat = parts.armRight.material as THREE.MeshStandardMaterial;
    parts.armLeft.material = this.armMat;
    this.legMat = parts.legLeft.material as THREE.MeshStandardMaterial;
    parts.legRight.material = this.legMat;
    this.headMat.color.setHex(SKIN_COLOR);

    const headSize = new THREE.Vector3();
    boxes.head.getSize(headSize);
    const headCenter = new THREE.Vector3();
    boxes.head.getCenter(headCenter);

    // Hair / crown sit on top of the head.
    this.hairSlot.position.set(headCenter.x, boxes.head.max.y, headCenter.z);
    this.headAccessorySlot.position.copy(this.hairSlot.position);

    // Weapon rides near the outer/bottom edge of the right arm (the hand).
    const armCenter = new THREE.Vector3();
    boxes.armRight.getCenter(armCenter);
    this.weaponSlot.position.set(boxes.armRight.max.x, boxes.armRight.min.y + 0.15, armCenter.z);

    // Shoes clamp onto the bottom of each leg.
    const legLCenter = new THREE.Vector3();
    boxes.legLeft.getCenter(legLCenter);
    this.shoeSlotLeft.position.set(legLCenter.x, boxes.legLeft.min.y, legLCenter.z);
    const legRCenter = new THREE.Vector3();
    boxes.legRight.getCenter(legRCenter);
    this.shoeSlotRight.position.set(legRCenter.x, boxes.legRight.min.y, legRCenter.z);

    // Armor trim sits across the chest; cape/shield also anchor to the torso.
    const torsoCenter = new THREE.Vector3();
    boxes.torso.getCenter(torsoCenter);
    this.accentSlot.position.copy(torsoCenter);
    this.bodyAccessorySlot.position.copy(torsoCenter);

    // Face decal on the front (+Z) of the head.
    const faceGeo = new THREE.PlaneGeometry(headSize.x * 0.78, headSize.y * 0.6);
    const faceMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
    this.faceMesh = new THREE.Mesh(faceGeo, faceMat);
    this.faceMesh.position.set(headCenter.x, headCenter.y - headSize.y * 0.04, boxes.head.max.z + 0.03);

    root.add(
      this.hairSlot,
      this.headAccessorySlot,
      this.bodyAccessorySlot,
      this.weaponSlot,
      this.shoeSlotLeft,
      this.shoeSlotRight,
      this.accentSlot,
      this.faceMesh,
    );
    this.group.add(root);
    this.ready = true;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public update(state: CharacterState): void {
    if (!this.ready) return;

    this.torsoMat.color.setHex(colorNumberOf('outfit', state.outfit));
    this.armMat.color.setHex(colorNumberOf('outfit', state.outfit));
    this.legMat.color.setHex(colorNumberOf('pants', state.pants));

    clearGroup(this.hairSlot);
    this.hairSlot.add(buildHair(state.hair, colorNumberOf('hair', state.hair)));

    clearGroup(this.weaponSlot);
    this.weaponSlot.add(buildWeapon(state.weapon, colorNumberOf('weapon', state.weapon)));

    clearGroup(this.shoeSlotLeft);
    clearGroup(this.shoeSlotRight);
    const shoeColor = colorNumberOf('shoes', state.shoes);
    this.shoeSlotLeft.add(buildShoe(state.shoes, shoeColor));
    this.shoeSlotRight.add(buildShoe(state.shoes, shoeColor));

    clearGroup(this.accentSlot);
    this.accentSlot.add(buildAccent(colorNumberOf('armorColor', state.armorColor)));

    clearGroup(this.headAccessorySlot);
    clearGroup(this.bodyAccessorySlot);
    const accessoryColor = colorNumberOf('accessory', state.accessory);
    if (state.accessory === 'Crown') {
      this.headAccessorySlot.add(buildCrown(accessoryColor));
    } else if (state.accessory === 'Shield') {
      const shield = buildShield(accessoryColor);
      shield.position.set(-1.5, -0.2, 0.7);
      this.bodyAccessorySlot.add(shield);
    } else if (state.accessory === 'Cape') {
      const cape = buildCape(accessoryColor);
      cape.position.set(0, -0.9, 1.1);
      this.bodyAccessorySlot.add(cape);
    }

    this.faceMesh.material.map = buildFaceTexture(state.face);
    this.faceMesh.material.needsUpdate = true;
  }
}

function clearGroup(group: THREE.Group): void {
  [...group.children].forEach((child) => {
    group.remove(child);
    child.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose();
    });
  });
}
