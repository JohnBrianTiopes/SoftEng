import './style.css';
import { CharacterBuilder, CustomizationHistory, DEFAULT_CHARACTER_STATE } from './memento.ts';
import { buildLayout, refreshUI, showToast } from './ui.ts';
import type { CatalogCategory } from './items.ts';
import { preloadAllThumbnails } from './three/thumbnails.ts';
import { createScene3D } from './three/sceneSetup.ts';
import { CharacterController } from './three/characterController.ts';

// ==========================================
// Originator + Caretaker (Memento pattern)
// ==========================================
const builder = new CharacterBuilder(DEFAULT_CHARACTER_STATE);
const history = new CustomizationHistory(builder);

const app = document.getElementById('app')!;
const character = new CharacterController();

function render(): void {
  const state = builder.getState();
  character.update(state);
  refreshUI(uiRefs, state, history.hasHistory());
}

function applyChange(mutate: (b: CharacterBuilder) => void): void {
  history.backup(); // 1. Save current state through the Memento system
  mutate(builder); // 2. Change the state
  render(); // 3. Update the UI
}

const uiRefs = buildLayout(app, {
  onNameChange: (name: string) => applyChange((b) => b.setName(name || 'RUNE')),
  onSelectItem: (categoryKey: CatalogCategory['key'], itemId: string) => {
    applyChange((b) => {
      switch (categoryKey) {
        case 'hair':
          b.setHair(itemId);
          break;
        case 'face':
          b.setFace(itemId);
          break;
        case 'outfit':
          b.equipOutfit(itemId);
          break;
        case 'pants':
          b.equipPants(itemId);
          break;
        case 'shoes':
          b.equipShoes(itemId);
          break;
        case 'weapon':
          b.equipWeapon(itemId);
          break;
        case 'accessory':
          b.equipAccessory(itemId);
          break;
        case 'armorColor':
          b.dyeArmor(itemId);
          break;
      }
    });
  },
  onReset: () => {
    history.backup();
    builder.resetToDefault();
    render();
    showToast(uiRefs, 'Reset!');
  },
  onUndo: () => {
    history.undo();
    render();
  },
  onSave: () => {
    showToast(uiRefs, 'Saved!');
  },
});

// The 3D item-card thumbnails and the live preview both use procedural
// geometry, so we can render every thumbnail up front (cheap, all-local).
preloadAllThumbnails();

const previewMount = document.getElementById('preview-mount')!;
createScene3D(previewMount).scene.add(character.group);

character
  .load('/models/character.obj')
  .then(render)
  .catch((err) => {
    console.error('Failed to load character model', err);
  });

// @ts-expect-error debug hook, removed before delivery
window.__debugCharacter = character;

// Initial UI render (before the model finishes loading, so the panels aren't blank)
render();
