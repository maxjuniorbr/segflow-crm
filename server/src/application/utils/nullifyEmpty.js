export const nullifyEmpty = (value) => (value != null && String(value).trim() !== '') ? value : null;
