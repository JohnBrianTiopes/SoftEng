import type { CharacterState } from './memento.ts';
import { CATALOG, type CatalogCategory } from './items.ts';
import { getThumbnail } from './three/thumbnails.ts';

export interface UIHandlers {
  onNameChange: (name: string) => void;
  onSelectItem: (categoryKey: CatalogCategory['key'], itemId: string) => void;
  onReset: () => void;
  onUndo: () => void;
  onSave: () => void;
}

export interface UIRefs {
  nameInput: HTMLInputElement;
  nameTag: HTMLDivElement;
  weaponStat: HTMLSpanElement;
  armorStat: HTMLSpanElement;
  tabButtons: Map<string, HTMLButtonElement>;
  itemGrid: HTMLDivElement;
  undoBtn: HTMLButtonElement;
  toast: HTMLDivElement;
}

let activeCategory: CatalogCategory['key'] = 'hair';
let toastTimer: number | undefined;

export function buildLayout(root: HTMLElement, handlers: UIHandlers): UIRefs {
  root.innerHTML = `
    <div class="game-window">
      <div class="game-header">
        <h1 class="pixel-font">Character Customizer</h1>
      </div>
      <div class="game-body">
        <div class="panel profile-panel">
          <div class="panel-title pixel-font">Profile</div>
          <div class="item-card-frame">
            <div class="field-label">Name</div>
            <input id="name-input" class="name-input" maxlength="14" value="RUNE" />
          </div>
          <div class="item-card-frame">
            <div class="stat-row"><span>Weapon</span><span class="stat-value" id="weapon-stat">-</span></div>
            <div class="stat-row"><span>Armor</span><span class="stat-value" id="armor-stat">-</span></div>
          </div>
          <p class="hint-text">Pick a category on the right and equip new gear. Every change is saved to your customization history.</p>
        </div>

        <div class="panel preview-panel">
          <div class="preview-nametag" id="preview-nametag">RUNE</div>
          <div class="preview-hint">Drag to rotate &middot; scroll to zoom</div>
          <div class="preview-mount" id="preview-mount"></div>
        </div>

        <div class="panel customize-panel">
          <div class="panel-title pixel-font">Customize</div>
          <div class="tab-row" id="tab-row"></div>
          <div class="item-grid" id="item-grid"></div>
        </div>
      </div>
      <div class="bottom-bar">
        <button id="reset-btn" class="pixel-btn danger">Reset</button>
        <button id="undo-btn" class="pixel-btn secondary" disabled>Undo</button>
        <button id="save-btn" class="pixel-btn">Save</button>
      </div>
    </div>
    <div class="toast" id="toast">Saved!</div>
  `;

  const nameInput = root.querySelector<HTMLInputElement>('#name-input')!;
  const nameTag = root.querySelector<HTMLDivElement>('#preview-nametag')!;
  const weaponStat = root.querySelector<HTMLSpanElement>('#weapon-stat')!;
  const armorStat = root.querySelector<HTMLSpanElement>('#armor-stat')!;
  const tabRow = root.querySelector<HTMLDivElement>('#tab-row')!;
  const itemGrid = root.querySelector<HTMLDivElement>('#item-grid')!;
  const undoBtn = root.querySelector<HTMLButtonElement>('#undo-btn')!;
  const resetBtn = root.querySelector<HTMLButtonElement>('#reset-btn')!;
  const saveBtn = root.querySelector<HTMLButtonElement>('#save-btn')!;
  const toast = root.querySelector<HTMLDivElement>('#toast')!;

  nameInput.addEventListener('change', () => handlers.onNameChange(nameInput.value));

  const tabButtons = new Map<string, HTMLButtonElement>();
  CATALOG.filter((c) => c.key !== 'armorColor')
    .concat(CATALOG.filter((c) => c.key === 'armorColor'))
    .forEach((category) => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.textContent = category.title;
      btn.addEventListener('click', () => {
        activeCategory = category.key;
        renderTabs(tabButtons);
        renderItemGrid(itemGrid, handlers);
      });
      tabRow.appendChild(btn);
      tabButtons.set(category.key, btn);
    });

  undoBtn.addEventListener('click', handlers.onUndo);
  resetBtn.addEventListener('click', handlers.onReset);
  saveBtn.addEventListener('click', handlers.onSave);

  renderTabs(tabButtons);
  renderItemGrid(itemGrid, handlers);

  return { nameInput, nameTag, weaponStat, armorStat, tabButtons, itemGrid, undoBtn, toast };
}

function renderTabs(tabButtons: Map<string, HTMLButtonElement>): void {
  tabButtons.forEach((btn, key) => {
    btn.classList.toggle('active', key === activeCategory);
  });
}

function renderItemGrid(grid: HTMLDivElement, handlers: UIHandlers): void {
  const category = CATALOG.find((c) => c.key === activeCategory)!;
  grid.innerHTML = '';
  category.items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.itemId = item.id;
    const thumb = getThumbnail(category.key, item.id);
    card.innerHTML = `
      <div class="equipped-tag">EQUIPPED</div>
      <div class="item-thumb"><img src="${thumb}" alt="${item.label}" width="56" height="56" /></div>
      <div class="item-label">${item.label}</div>
    `;
    card.addEventListener('click', () => handlers.onSelectItem(category.key, item.id));
    grid.appendChild(card);
  });
}

export function refreshUI(refs: UIRefs, state: CharacterState, hasHistory: boolean): void {
  if (document.activeElement !== refs.nameInput) {
    refs.nameInput.value = state.name;
  }
  refs.nameTag.textContent = state.name.trim() || 'RUNE';
  refs.weaponStat.textContent = state.weapon;
  refs.armorStat.textContent = state.armorColor;
  refs.undoBtn.disabled = !hasHistory;

  const category = CATALOG.find((c) => c.key === activeCategory)!;
  const selectedId = state[category.key as keyof CharacterState];
  refs.itemGrid.querySelectorAll<HTMLDivElement>('.item-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.itemId === selectedId);
  });
}

export function showToast(refs: UIRefs, message: string): void {
  refs.toast.textContent = message;
  refs.toast.classList.add('visible');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => refs.toast.classList.remove('visible'), 1400);
}
