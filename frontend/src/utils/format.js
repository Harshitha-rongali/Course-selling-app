const priceFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatPrice(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return 'Price unavailable';
  }

  return priceFormatter.format(amount);
}

export function getCourseInitials(title) {
  const words = String(title || 'Course')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (words.length === 0) {
    return 'CO';
  }

  return words.map((word) => word.charAt(0).toUpperCase()).join('');
}
