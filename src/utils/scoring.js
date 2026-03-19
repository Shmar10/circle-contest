export const calculateScore = (d1, d2, d3, d4, selectedGrade) => {
  const measurements = [d1, d2, d3, d4].map(Number);
  const mean = measurements.reduce((a, b) => a + b, 0) / 4;
  
  if (mean === 0) return 0;
  
  const totalDeviation = measurements.reduce((sum, val) => sum + Math.abs(val - mean), 0);
  const avgDeviation = totalDeviation / 4;
  
  let errorPercentage = (avgDeviation / mean) * 100;

  switch (selectedGrade) {
    case 'A': errorPercentage -= 0.5; break;
    case 'B': errorPercentage += 0.5; break;
    case 'C': errorPercentage += 1.0; break;
    case 'D': errorPercentage += 1.5; break;
    case 'None':
    default: break;
  }

  errorPercentage = Math.max(0, errorPercentage);
  return Number(errorPercentage.toFixed(2));
};

export const getAverageScore = (rounds) => {
  if (!rounds || rounds.length === 0) return 0;
  const total = rounds.reduce((sum, r) => sum + r.score, 0);
  return total / rounds.length;
};
