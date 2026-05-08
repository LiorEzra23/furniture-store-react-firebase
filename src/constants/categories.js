export const CATEGORY_OPTIONS = [
  { value: 'bed', label: 'מיטה' },
  { value: 'wardrobe', label: 'ארון' },
  { value: 'sofa', label: 'ספה' },
];

export function getCategoryLabel(categoryValue) {
  return CATEGORY_OPTIONS.find((category) => category.value === categoryValue)?.label || '';
}
