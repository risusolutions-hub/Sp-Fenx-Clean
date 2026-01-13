// Issue categories with icons for service tickets
export const ISSUE_CATEGORIES = [
  { id: 'laser_output', label: 'Laser Output Failure', icon: '⚡' },
  { id: 'software', label: 'Software / Marking Error', icon: '💻' },
  { id: 'chiller', label: 'Chiller / Cooling Trip', icon: '❄️' },
  { id: 'physical', label: 'Physical Damage', icon: '🔧' },
  { id: 'power', label: 'Power Supply Issue', icon: '🔌' },
  { id: 'alignment', label: 'Alignment Problem', icon: '🎯' },
  { id: 'lens', label: 'Lens / Mirror Damage', icon: '🔍' },
  { id: 'control', label: 'Control Panel Error', icon: '🖥️' },
  { id: 'motion', label: 'Motion System Fault', icon: '⚙️' },
  { id: 'exhaust', label: 'Exhaust / Ventilation', icon: '💨' }
];

export const getCategoryLabel = (id) => {
  const category = ISSUE_CATEGORIES.find(c => c.id === id);
  return category?.label || id;
};

export const getCategoryIcon = (id) => {
  const category = ISSUE_CATEGORIES.find(c => c.id === id);
  return category?.icon || '📋';
};
