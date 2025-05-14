// Simple implementation of normalize-color for web
function normalizeColor(color) {
  if (typeof color === 'number') {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
  return color;
}

export default normalizeColor; 