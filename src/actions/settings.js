export const UPDATE_SORT_ORDER = 'UPDATE_SORT_ORDER';

export function updateSortOrder(sortOrder) {
  return { type: UPDATE_SORT_ORDER, sortOrder };
}
