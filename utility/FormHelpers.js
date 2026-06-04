export const blockInvalidIdKeys = (e) => {
  if (["-", "+", "e", "E", "."].includes(e.key)) e.preventDefault();
};

export const toPositiveInt = (raw) => {
  if (raw === "") return "";
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed < 1 ? "" : String(parsed);
};
