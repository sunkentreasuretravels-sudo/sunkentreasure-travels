export function resolveMedia(entity, country, regionMedia, globalFallback) {
  if (entity?.media?.hero) return entity.media.hero;
  if (country?.media?.hero) return country.media.hero;
  const region = country?.region?.toLowerCase()?.replaceAll(" ", "-");
  const regionAsset = regionMedia.find(item => item.id === region && item.hero);
  if (regionAsset?.hero) return regionAsset.hero;
  return globalFallback || null;
}
