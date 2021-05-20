/**
 * @name Get contrasting text color
 * @description Get contrasting text color  from a color
 * @param bgColor  Background color of text.
 * @returns contrasting text color
 */

export const getContrastingTextColor = (bgColor: string) => {
  const color = bgColor.replace('#', '');
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  // http://stackoverflow.com/a/3943023/112731
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
};
