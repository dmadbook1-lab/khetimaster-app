// Localised labels for the fixed vocabularies (category, level). Unknown
// values fall back to whatever the server sent.
export const catLabel = (t, scheme) => {
  const key = scheme.categoryKey || scheme.category;
  return t(`govUi.cat${String(key).replace(/\s+/g, '')}`, {
    defaultValue: scheme.category,
  });
};

export const levelLabel = (t, level) =>
  t(`govUi.level${level}`, {defaultValue: level});

export const catLabelFromKey = (t, key) =>
  t(`govUi.cat${String(key).replace(/\s+/g, '')}`, {defaultValue: key});
