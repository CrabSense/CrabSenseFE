// Utility functions for CrabSense application

// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Check if water quality parameter is within safe range
export const isParameterSafe = (parameter, value) => {
  const safeRanges = {
    temperature: { min: 20, max: 30 },
    ph: { min: 7.0, max: 8.5 },
    dissolvedOxygen: { min: 5.0, max: 10.0 },
    salinity: { min: 25, max: 35 },
  };

  const range = safeRanges[parameter];
  if (!range) return null;

  return value >= range.min && value <= range.max;
};

// Get status color based on parameter safety
export const getStatusColor = (isSafe) => {
  if (isSafe === null) return "gray";
  return isSafe ? "green" : "red";
};

// Calculate average of array of numbers
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Format number with decimal places
export const formatNumber = (number, decimals = 2) => {
  return Number(number).toFixed(decimals);
};
