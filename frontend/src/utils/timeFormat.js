export const parseDurationToMinutes = (input) => {
  if (!input) return 0;
  const str = String(input).trim().toLowerCase();
  
  // If it's just a number like "230"
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  // If it's something like "3h 50m" or "3h50m" or "3 h 50 m"
  let hours = 0;
  let minutes = 0;
  const hMatch = str.match(/(\d+)\s*h/);
  const mMatch = str.match(/(\d+)\s*m/);

  if (hMatch) hours = parseInt(hMatch[1], 10);
  if (mMatch) minutes = parseInt(mMatch[1], 10);

  if (hMatch || mMatch) {
    return (hours * 60) + minutes;
  }

  // Fallback to numeric parsing of whatever is there
  const fallback = parseInt(str.replace(/\D/g, ''), 10);
  return isNaN(fallback) ? 0 : fallback;
};

export const formatMinutesToDisplay = (totalMinutes) => {
  if (!totalMinutes || isNaN(totalMinutes)) return '';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};
