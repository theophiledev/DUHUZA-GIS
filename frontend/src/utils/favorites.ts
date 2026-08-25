const FAVORITES_KEY = 'duhuza_favorites';

type FavoriteType = 'listing' | 'market';

function loadFavorites(): Record<FavoriteType, string[]> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return { listing: [], market: [] };
    return JSON.parse(raw) as Record<FavoriteType, string[]>;
  } catch {
    return { listing: [], market: [] };
  }
}

function saveFavorites(data: Record<FavoriteType, string[]>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
}

export function isFavorite(type: FavoriteType, id: string): boolean {
  return loadFavorites()[type]?.includes(id) ?? false;
}

export function toggleFavorite(type: FavoriteType, id: string): boolean {
  const data = loadFavorites();
  const list = data[type] ?? [];
  const exists = list.includes(id);
  data[type] = exists ? list.filter((x) => x !== id) : [...list, id];
  saveFavorites(data);
  return !exists;
}
