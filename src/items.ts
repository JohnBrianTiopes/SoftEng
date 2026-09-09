export interface CatalogItem {
  id: string;
  label: string;
  swatch: string;
}

export interface CatalogCategory {
  key: 'hair' | 'face' | 'outfit' | 'pants' | 'shoes' | 'weapon' | 'accessory' | 'armorColor';
  title: string;
  items: CatalogItem[];
}

export const CATALOG: CatalogCategory[] = [
  {
    key: 'hair',
    title: 'Hair',
    items: [
      { id: 'Default', label: 'Default', swatch: '#6b4a2f' },
      { id: 'Spiky', label: 'Spiky', swatch: '#3d2a1a' },
      { id: 'Short', label: 'Short', swatch: '#8a5a2b' },
      { id: 'Long', label: 'Long', swatch: '#4a2e17' },
    ],
  },
  {
    key: 'face',
    title: 'Face',
    items: [
      { id: 'Default', label: 'Default', swatch: '#e8b98a' },
      { id: 'Happy', label: 'Happy', swatch: '#e8b98a' },
      { id: 'Cool', label: 'Cool', swatch: '#e8b98a' },
      { id: 'Serious', label: 'Serious', swatch: '#e8b98a' },
    ],
  },
  {
    key: 'outfit',
    title: 'Outfit',
    items: [
      { id: 'Knight', label: 'Knight', swatch: '#7d8896' },
      { id: 'Warrior', label: 'Warrior', swatch: '#7a4a2d' },
      { id: 'Adventurer', label: 'Adventurer', swatch: '#3f6b46' },
      { id: 'Casual', label: 'Casual', swatch: '#4a6fa5' },
    ],
  },
  {
    key: 'pants',
    title: 'Pants',
    items: [
      { id: 'Default', label: 'Default', swatch: '#a5824f' },
      { id: 'Knight', label: 'Knight', swatch: '#6b7480' },
      { id: 'Dark', label: 'Dark', swatch: '#31302e' },
      { id: 'Light', label: 'Light', swatch: '#d8c9a3' },
    ],
  },
  {
    key: 'shoes',
    title: 'Shoes',
    items: [
      { id: 'Boots', label: 'Boots', swatch: '#5a3a20' },
      { id: 'Armor Boots', label: 'Armor Boots', swatch: '#8891a0' },
      { id: 'Dark Boots', label: 'Dark Boots', swatch: '#26221e' },
    ],
  },
  {
    key: 'weapon',
    title: 'Weapon',
    items: [
      { id: 'Wooden Stick', label: 'Wooden Stick', swatch: '#8a5a2b' },
      { id: 'Steel Sword', label: 'Steel Sword', swatch: '#c3c9d1' },
      { id: 'Battle Axe', label: 'Battle Axe', swatch: '#9aa2ac' },
      { id: 'Magic Staff', label: 'Magic Staff', swatch: '#8e5bd6' },
    ],
  },
  {
    key: 'accessory',
    title: 'Accessory',
    items: [
      { id: 'None', label: 'None', swatch: '#c9bd9e' },
      { id: 'Cape', label: 'Cape', swatch: '#8a2b2b' },
      { id: 'Shield', label: 'Shield', swatch: '#7d8896' },
      { id: 'Crown', label: 'Crown', swatch: '#e8b923' },
    ],
  },
  {
    key: 'armorColor',
    title: 'Armor Color',
    items: [
      { id: 'Grey', label: 'Grey', swatch: '#8b8f96' },
      { id: 'Red', label: 'Red', swatch: '#a33333' },
      { id: 'Green', label: 'Green', swatch: '#3f7a45' },
      { id: 'Blue', label: 'Blue', swatch: '#33628f' },
    ],
  },
];

export function swatchOf(categoryKey: string, id: string): string {
  const category = CATALOG.find((c) => c.key === categoryKey);
  const item = category?.items.find((i) => i.id === id);
  return item?.swatch ?? '#999999';
}

export function colorNumberOf(categoryKey: string, id: string): number {
  return parseInt(swatchOf(categoryKey, id).replace('#', ''), 16);
}
