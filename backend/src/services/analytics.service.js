exports.predictRevenue = (monthlyTotals = []) => {
  if (!monthlyTotals.length) return 0;

  const sum = monthlyTotals.reduce((acc, val) => acc + Number(val || 0), 0);
  const avg = sum / monthlyTotals.length;

  // Simple weighted signal that biases toward latest month
  const latest = Number(monthlyTotals[monthlyTotals.length - 1] || 0);
  const prediction = avg * 0.6 + latest * 0.4;

  return Number(prediction.toFixed(2));
};
