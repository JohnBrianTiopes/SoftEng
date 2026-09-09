import * as THREE from 'three';

function box(w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 }),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function metalBox(w: number, h: number, d: number, color: number, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = box(w, h, d, color, x, y, z);
  (mesh.material as THREE.MeshStandardMaterial).metalness = 0.75;
  (mesh.material as THREE.MeshStandardMaterial).roughness = 0.3;
  return mesh;
}

function cone(radius: number, height: number, color: number, x = 0, y = 0, z = 0, rotX = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 8),
    new THREE.MeshStandardMaterial({ color, roughness: 0.5 }),
  );
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotX;
  mesh.castShadow = true;
  return mesh;
}

export function buildHair(kind: string, colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'hair';
  switch (kind) {
    case 'Spiky': {
      for (let i = -2; i <= 2; i++) {
        g.add(cone(0.16, 0.5, colorHex, i * 0.2, 0.35 + Math.abs(i) * -0.04, 0));
      }
      g.add(box(1.15, 0.22, 1.15, colorHex, 0, 0.05, 0));
      break;
    }
    case 'Short': {
      g.add(box(1.2, 0.28, 1.2, colorHex, 0, 0.1, 0));
      break;
    }
    case 'Long': {
      g.add(box(1.2, 0.32, 1.2, colorHex, 0, 0.12, 0));
      g.add(box(1.24, 1.1, 0.22, colorHex, 0, -0.45, 0.55));
      break;
    }
    default: {
      g.add(box(1.18, 0.24, 1.18, colorHex, 0, 0.08, 0));
    }
  }
  return g;
}

export function buildCrown(colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'crown';
  g.add(box(1.28, 0.22, 1.28, colorHex, 0, 0, 0));
  for (let i = -2; i <= 2; i += 2) {
    g.add(cone(0.14, 0.3, colorHex, i * 0.32, 0.24, 0));
  }
  g.add(cone(0.14, 0.3, colorHex, 0, 0.24, 0));
  return g;
}

export function buildShield(colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'shield';
  g.add(metalBox(0.14, 1.5, 1.0, colorHex));
  g.add(box(0.06, 0.4, 0.4, 0xe8b923, 0.1, 0, 0));
  return g;
}


export function buildCape(colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'cape';
  const geo = new THREE.CylinderGeometry(1.9, 1.9, 3.4, 12, 1, true, Math.PI - 0.55, 1.1);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: colorHex, side: THREE.DoubleSide, roughness: 0.8 }));
  mesh.castShadow = true;
  g.add(mesh);
  return g;
}

export function buildWeapon(kind: string, colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'weapon';
  switch (kind) {
    case 'Steel Sword': {
      g.add(metalBox(0.16, 1.7, 0.05, colorHex, 0, 0.9, 0));
      g.add(metalBox(0.5, 0.14, 0.14, 0xa97e14, 0, 0.05, 0));
      g.add(box(0.14, 0.35, 0.14, 0x3a2c1d, 0, -0.2, 0));
      break;
    }
    case 'Battle Axe': {
      g.add(box(0.13, 1.6, 0.13, 0x6b4226, 0, 0.6, 0));
      const headGeo = new THREE.ConeGeometry(0.55, 0.7, 4);
      const axeHead = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.7, roughness: 0.3 }));
      axeHead.rotation.z = Math.PI / 2;
      axeHead.position.set(0.35, 1.2, 0);
      axeHead.castShadow = true;
      g.add(axeHead);
      break;
    }
    case 'Magic Staff': {
      g.add(box(0.12, 2.0, 0.12, 0x6b4226, 0, 0.8, 0));
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 16),
        new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.6, roughness: 0.3 }),
      );
      orb.position.set(0, 1.9, 0);
      g.add(orb);
      break;
    }
    default: {
      g.add(box(0.12, 1.5, 0.12, colorHex, 0, 0.65, 0));
    }
  }
  return g;
}


export function buildShoe(kind: string, colorHex: number): THREE.Mesh {
  const metallic = kind === 'Armor Boots';
  const mesh = metallic ? metalBox(1.02, 0.4, 1.02, colorHex) : box(1.02, 0.4, 1.02, colorHex);
  mesh.name = 'shoe';
  return mesh;
}

export function buildAccent(colorHex: number): THREE.Group {
  const g = new THREE.Group();
  g.name = 'accent';
  g.add(box(2.05, 0.28, 1.05, colorHex, 0, 0, 0));
  g.add(box(2.05, 0.18, 1.05, colorHex, 0, 0.85, 0));
  return g;
}

const faceTextureCache = new Map<string, THREE.Texture>();

export function buildFaceTexture(expression: string): THREE.Texture {
  const cached = faceTextureCache.get(expression);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#392b1b';

  const eyeY = size * 0.42;
  const eyeSize = size * 0.09;

  if (expression === 'Cool') {
    ctx.fillRect(size * 0.16, eyeY - eyeSize * 0.6, size * 0.68, eyeSize * 1.1);
  } else {
    const leftX = size * 0.28;
    const rightX = size * 0.72;
    if (expression === 'Serious') {
      ctx.save();
      ctx.translate(leftX, eyeY);
      ctx.rotate(-0.15);
      ctx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize * 0.7);
      ctx.restore();
      ctx.save();
      ctx.translate(rightX, eyeY);
      ctx.rotate(0.15);
      ctx.fillRect(-eyeSize / 2, -eyeSize / 2, eyeSize, eyeSize * 0.7);
      ctx.restore();
    } else {
      ctx.fillRect(leftX - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);
      ctx.fillRect(rightX - eyeSize / 2, eyeY - eyeSize / 2, eyeSize, eyeSize);
    }
  }

  const mouthY = size * 0.66;
  ctx.beginPath();
  if (expression === 'Happy') {
    ctx.arc(size / 2, mouthY - size * 0.04, size * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = size * 0.045;
    ctx.strokeStyle = '#392b1b';
    ctx.stroke();
  } else if (expression === 'Serious') {
    ctx.fillRect(size * 0.36, mouthY, size * 0.28, size * 0.035);
  } else if (expression === 'Cool') {
    ctx.fillRect(size * 0.38, mouthY, size * 0.24, size * 0.04);
  } else {
    ctx.fillRect(size * 0.37, mouthY, size * 0.26, size * 0.045);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  faceTextureCache.set(expression, texture);
  return texture;
}
