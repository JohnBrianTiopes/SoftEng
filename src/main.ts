import './style.css';

// ==========================================
// The Data Structure
// ==========================================
interface CharacterState {
  weapon: string;
  armorColor: string;
}

// ==========================================
// 1. MEMENTO (The Time Capsule)
// ==========================================
class CharacterSnapshot {
  private readonly state: CharacterState;

  constructor(stateToSave: CharacterState) {
    // We create a clone of the state so it cannot be accidentally modified
    this.state = { ...stateToSave };
  }

  public getSavedState(): CharacterState {
    return this.state;
  }
}

// ==========================================
// 2. ORIGINATOR (The Character Editor)
// ==========================================
class CharacterBuilder {
  private currentState: CharacterState;

  constructor() {
    this.currentState = { weapon: 'Wooden Stick', armorColor: 'Grey' };
  }

  public equipWeapon(weapon: string): void {
    this.currentState.weapon = weapon;
  }

  public dyeArmor(color: string): void {
    this.currentState.armorColor = color;
  }

  public getState(): CharacterState {
    return this.currentState;
  }

  // ORIGINATOR creates a Memento of its own state
  public save(): CharacterSnapshot {
    return new CharacterSnapshot(this.currentState);
  }

  // ORIGINATOR uses a Memento to overwrite its current state
  public restore(memento: CharacterSnapshot): void {
    this.currentState = memento.getSavedState();
  }
}

// ==========================================
// 3. CARETAKER (The Undo Manager)
// ==========================================
class CustomizationHistory {
  private builder: CharacterBuilder;
  private undoStack: CharacterSnapshot[] = [];

  constructor(builder: CharacterBuilder) {
    this.builder = builder;
  }

  // Saves a backup BEFORE a change is made
  public backup(): void {
    this.undoStack.push(this.builder.save());
  }

  // Pops the last backup and restores it
  public undo(): void {
    if (this.undoStack.length === 0) return;
    
    const lastSnapshot = this.undoStack.pop();
    if (lastSnapshot) {
      this.builder.restore(lastSnapshot);
    }
  }

  public hasHistory(): boolean {
    return this.undoStack.length > 0;
  }
}

// ==========================================
// DOM Interaction & Application Execution
// ==========================================
const builder = new CharacterBuilder();
const history = new CustomizationHistory(builder);

const weaponText = document.getElementById('char-weapon')!;
const colorText = document.getElementById('char-color')!;
const undoBtn = document.getElementById('undo') as HTMLButtonElement;

function updateUI() {
  const state = builder.getState();
  weaponText.textContent = `Weapon: ${state.weapon}`;
  colorText.textContent = `Armor Color: ${state.armorColor}`;
  
  // Enable or disable the undo button based on history
  undoBtn.disabled = !history.hasHistory();
}

// Event Listeners for UI Buttons
document.getElementById('equip-sword')!.addEventListener('click', () => {
  history.backup(); // 1. Save state BEFORE changing
  builder.equipWeapon('Steel Sword'); // 2. Make the change
  updateUI(); // 3. Update the screen
});

document.getElementById('equip-axe')!.addEventListener('click', () => {
  history.backup();
  builder.equipWeapon('Battle Axe');
  updateUI();
});

document.getElementById('dye-red')!.addEventListener('click', () => {
  history.backup();
  builder.dyeArmor('Red');
  updateUI();
});

undoBtn.addEventListener('click', () => {
  history.undo(); // Ask Caretaker to trigger the restore
  updateUI();
});

// Initial render
updateUI();