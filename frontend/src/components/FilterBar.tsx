import type { ReactNode } from 'react';
import { getDistricts, getSectors, rwandaProvinces } from '../utils/rwandaLocations';

function SearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
    </svg>
  );
}

function PinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-10a7 7 0 10-14 0c0 5.5 7 10 7 10z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

function TagIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 11l8.59 8.59a2 2 0 002.83 0L21 13.17a2 2 0 000-2.83L12.59 2.41a2 2 0 00-2.83 0L3 9.17a2 2 0 000 2.83z" />
    </svg>
  );
}

interface FilterSelectProps {
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}

function FilterSelect({ icon, value, onChange, options, ariaLabel }: FilterSelectProps) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      <span className="pointer-events-none absolute left-3 text-gray-400">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-sm text-gray-800 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-gray-400">▾</span>
    </div>
  );
}

export interface ListingFilters {
  category: string;
  listingType: string;
  province: string;
  district: string;
  sector: string;
  minPrice: string;
  maxPrice: string;
}

interface ListingFilterBarProps {
  filters: ListingFilters;
  onChange: (filters: ListingFilters) => void;
  onSearch: () => void;
  tr: (key: import('../i18n/translations').TranslationKey) => string;
}

const PRICE_PRESETS = [
  { value: '', min: '', max: '', labelKey: 'budgetAny' as const },
  { value: '0-10000000', min: '0', max: '10000000', labelKey: 'budgetUnder10M' as const },
  { value: '10000000-50000000', min: '10000000', max: '50000000', labelKey: 'budget10to50M' as const },
  { value: '50000000-100000000', min: '50000000', max: '100000000', labelKey: 'budget50to100M' as const },
  { value: '100000000-', min: '100000000', max: '', labelKey: 'budgetOver100M' as const },
];

export function ListingFilterBar({ filters, onChange, onSearch, tr }: ListingFilterBarProps) {
  const priceValue = PRICE_PRESETS.find(
    (p) => p.min === filters.minPrice && p.max === filters.maxPrice
  )?.value ?? '';

  const setPricePreset = (value: string) => {
    const preset = PRICE_PRESETS.find((p) => p.value === value) ?? PRICE_PRESETS[0];
    onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
  };

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <FilterSelect
          icon={<TagIcon />}
          ariaLabel={tr('category')}
          value={filters.category}
          onChange={(category) => onChange({ ...filters, category })}
          options={[
            { value: '', label: tr('allCategories') },
            { value: 'HOUSE', label: tr('house') },
            { value: 'LAND', label: tr('land') },
            { value: 'VEHICLE', label: tr('vehicle') },
            { value: 'MOTORCYCLE', label: tr('motorcycle') },
          ]}
        />
        <FilterSelect
          icon={<TagIcon />}
          ariaLabel={tr('type')}
          value={filters.listingType}
          onChange={(listingType) => onChange({ ...filters, listingType })}
          options={[
            { value: '', label: tr('allTypes') },
            { value: 'SALE', label: tr('sale') },
            { value: 'RENT', label: tr('rent') },
          ]}
        />
        <FilterSelect
          icon={<PinIcon />}
          ariaLabel={tr('province')}
          value={filters.province}
          onChange={(province) => onChange({ ...filters, province, district: '', sector: '' })}
          options={[{ value: '', label: tr('allProvinces') }, ...rwandaProvinces.map((province) => ({ value: province, label: province }))]}
        />
        <FilterSelect
          icon={<PinIcon />}
          ariaLabel={tr('district')}
          value={filters.district}
          onChange={(district) => onChange({ ...filters, district, sector: '' })}
          options={[{ value: '', label: tr('allDistricts') }, ...getDistricts(filters.province).map((district) => ({ value: district, label: district }))]}
        />
        <FilterSelect
          icon={<PinIcon />}
          ariaLabel={tr('sector')}
          value={filters.sector}
          onChange={(sector) => onChange({ ...filters, sector })}
          options={[{ value: '', label: tr('allSectors') }, ...getSectors(filters.province, filters.district).map((sector) => ({ value: sector, label: sector }))]}
        />
        <FilterSelect
          icon={<SearchIcon />}
          ariaLabel={tr('price')}
          value={priceValue}
          onChange={setPricePreset}
          options={PRICE_PRESETS.map((p) => ({ value: p.value, label: tr(p.labelKey) }))}
        />
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 lg:w-auto lg:min-w-[140px]"
        >
          <SearchIcon className="h-4 w-4" />
          {tr('search')}
        </button>
      </div>
    </div>
  );
}

interface SimpleFilterBarProps {
  category: string;
  district: string;
  onCategoryChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
  onSearch: () => void;
  tr: (key: import('../i18n/translations').TranslationKey) => string;
  categoryOptions?: { value: string; label: string }[];
}

export function SimpleFilterBar({
  category,
  district,
  onCategoryChange,
  onDistrictChange,
  onSearch,
  tr,
  categoryOptions,
}: SimpleFilterBarProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <FilterSelect
          icon={<TagIcon />}
          ariaLabel={tr('category')}
          value={category}
          onChange={onCategoryChange}
          options={categoryOptions ?? [
            { value: '', label: tr('allCategories') },
            { value: 'electronics', label: tr('categoryElectronics') },
            { value: 'furniture', label: tr('categoryFurniture') },
            { value: 'produce', label: tr('categoryProduce') },
          ]}
        />
        <FilterSelect
          icon={<PinIcon />}
          ariaLabel={tr('district')}
          value={district}
          onChange={onDistrictChange}
          options={[
            { value: '', label: tr('allDistricts') },
            ...getDistricts().map((district) => ({ value: district, label: district })),
          ]}
        />
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto sm:min-w-[140px]"
        >
          <SearchIcon className="h-4 w-4" />
          {tr('search')}
        </button>
      </div>
    </div>
  );
}

interface LocationFilterBarProps {
  location: string;
  onLocationChange: (v: string) => void;
  onSearch: () => void;
  tr: (key: import('../i18n/translations').TranslationKey) => string;
}

export function LocationFilterBar({ location, onLocationChange, onSearch, tr }: LocationFilterBarProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-3 text-gray-400"><PinIcon /></span>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder={tr('locationPlaceholder')}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 sm:w-auto sm:min-w-[140px]"
        >
          <SearchIcon className="h-4 w-4" />
          {tr('search')}
        </button>
      </div>
    </div>
  );
}

export { SearchIcon, PinIcon };
