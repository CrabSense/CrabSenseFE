const boxStatusKeys = {
  empty: "boxStatusEmpty",
  active: "boxStatusActive",
  occupied: "boxStatusOccupied",
  molting: "boxStatusMolting",
  quarantine: "boxStatusQuarantine",
  maintenance: "boxStatusMaintenance",
  harvested: "boxStatusHarvested",
  watch: "boxStatusWatch",
};

const generalStatusKeys = {
  active: "active",
  inactive: "inactive",
  closed: "closed",
};

export function translateFarmStatus(value, t, type = "general") {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value).trim();
  const normalized = raw.toLowerCase();

  const dictionary = type === "box" ? boxStatusKeys : generalStatusKeys;

  const translationKey = dictionary[normalized];

  return translationKey ? t(`farm.${translationKey}`) : raw;
}

export function formatFarmMessage(template, values = {}) {
  return String(template ?? "").replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? String(values[key])
      : match,
  );
}
