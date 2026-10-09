// Application constants

export const WATER_QUALITY_PARAMETERS = {
  TEMPERATURE: "temperature",
  PH: "ph",
  DISSOLVED_OXYGEN: "dissolvedOxygen",
  SALINITY: "salinity",
  TURBIDITY: "turbidity",
  AMMONIA: "ammonia",
};

export const PARAMETER_UNITS = {
  temperature: "°C",
  ph: "",
  dissolvedOxygen: "mg/L",
  salinity: "ppt",
  turbidity: "NTU",
  ammonia: "mg/L",
};

export const PARAMETER_LABELS = {
  temperature: "Nhiệt độ",
  ph: "Độ pH",
  dissolvedOxygen: "Oxy hòa tan",
  salinity: "Độ mặn",
  turbidity: "Độ đục",
  ammonia: "Amoniac",
};

export const ALERT_TYPES = {
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
  SUCCESS: "success",
};

export const REFRESH_INTERVALS = {
  REAL_TIME: 5000, // 5 seconds
  NORMAL: 30000, // 30 seconds
  SLOW: 60000, // 1 minute
};
