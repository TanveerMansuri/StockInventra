export function paginate<T>(items: T[], page: number, limit: number) {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const data = items.slice(startIndex, endIndex);
  const total = items.length;
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
