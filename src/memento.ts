// ==========================================
// The Data Structure
// ==========================================
export interface CharacterState {
  name: string;
  hair: string;
  face: string;
  outfit: string;
  pants: string;
  shoes: string;
  weapon: string;
  armorColor: string;
  accessory: string;
}

export const DEFAULT_CHARACTER_STATE: CharacterState = {
  name: 'RUNE',
  hair: 'Spiky',
  face: 'Default',
  outfit: 'Knight',
  pants: 'Knight',
  shoes: 'Boots',
  weapon: 'Wooden Stick',
  armorColor: 'Grey',
  accessory: 'None',
};

// ==========================================
// 1. MEMENTO (The Time Capsule)
// ==========================================
export class CharacterSnapshot {
  private readonly state: CharacterState;

  constructor(stateToSave: CharacterState) {
    // We create a clone of the state so it cannot be accidentally modified
    this.state = { ...stateToSave };
  }

  public getSavedState(): CharacterState {
    return { ...this.state };
  }
}

// ==========================================
// 2. ORIGINATOR (The Character Editor)
// ==========================================
export class CharacterBuilder {
  private currentState: CharacterState;

  constructor(initialState: CharacterState = DEFAULT_CHARACTER_STATE) {
    this.currentState = { ...initialState };
  }

  public setName(name: string): void {
    this.currentState.name = name;
  }

  public setHair(hair: string): void {
    this.currentState.hair = hair;
  }

  public setFace(face: string): void {
    this.currentState.face = face;
  }

  public equipOutfit(outfit: string): void {
    this.currentState.outfit = outfit;
  }

  public equipPants(pants: string): void {
    this.currentState.pants = pants;
  }

  public equipShoes(shoes: string): void {
    this.currentState.shoes = shoes;
  }

  public equipWeapon(weapon: string): void {
    this.currentState.weapon = weapon;
  }

  public dyeArmor(color: string): void {
    this.currentState.armorColor = color;
  }

  public equipAccessory(accessory: string): void {
    this.currentState.accessory = accessory;
  }

  public resetToDefault(): void {
    this.currentState = { ...DEFAULT_CHARACTER_STATE };
  }

  public getState(): CharacterState {
    return { ...this.currentState };
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
export class CustomizationHistory {
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

  public clear(): void {
    this.undoStack = [];
  }
}
