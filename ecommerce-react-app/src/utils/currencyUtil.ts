export const formatPrice = (price: number | null) => {
  if (price === null) {
    return null;
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};
