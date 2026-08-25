import locations from '../../../Rwanda-locations.json';

export interface RwandaLocation {
  province_name: string;
  district_name: string;
  sector_name: string;
  cell_name: string;
  village_name: string;
}

const rows = locations as RwandaLocation[];

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export const rwandaProvinces = unique(rows.map((row) => row.province_name));

export function getDistricts(province?: string) {
  return unique(rows.filter((row) => !province || row.province_name === province).map((row) => row.district_name));
}

export function getSectors(province?: string, district?: string) {
  return unique(rows
    .filter((row) => (!province || row.province_name === province) && (!district || row.district_name === district))
    .map((row) => row.sector_name));
}

export function getCells(province?: string, district?: string, sector?: string) {
  return unique(rows
    .filter((row) => (!province || row.province_name === province)
      && (!district || row.district_name === district)
      && (!sector || row.sector_name === sector))
    .map((row) => row.cell_name));
}

export function getVillages(province?: string, district?: string, sector?: string, cell?: string) {
  return unique(rows
    .filter((row) => (!province || row.province_name === province)
      && (!district || row.district_name === district)
      && (!sector || row.sector_name === sector)
      && (!cell || row.cell_name === cell))
    .map((row) => row.village_name));
}

export function getProvinceForDistrict(district: string) {
  return rows.find((row) => row.district_name === district)?.province_name ?? '';
}