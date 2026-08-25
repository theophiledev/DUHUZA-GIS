import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui';

export function HomePage() {
  const { tr } = useLanguage();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-950 px-6 py-16 text-white sm:px-12 sm:py-20 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-brand-100 backdrop-blur">
            🇷🇼 RWANDA'S MULTI-VERTICAL PROPERTY & LAND PLATFORM
          </div>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight leading-tight">
            {tr('appName')}
          </h1>
          <p className="mt-4 text-lg text-brand-100 sm:text-xl leading-relaxed">
            {tr('heroSubtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/listings">
              <Button className="bg-white text-brand-900 shadow-lg hover:bg-brand-50 font-bold px-6 py-3 text-base">
                🏡 {tr('browseProperties')}
              </Button>
            </Link>
            <Link to="/gis">
              <Button variant="secondary" className="border-emerald-300/40 bg-emerald-500/20 text-white backdrop-blur hover:bg-emerald-500/30 font-bold px-6 py-3 text-base">
                🗺️ {tr('gisNav')}
              </Button>
            </Link>
            <Link to="/market">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-5 py-3 text-base">
                🛍️ {tr('market')}
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-5 py-3 text-base">
                💼 {tr('jobs')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Background Pattern */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
      </section>

      {/* Featured GIS & Land Survey Highlight Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-brand-50/40 to-white p-6 sm:p-8 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              NEW • GIS & LAND SURVEYING
            </span>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {tr('gisHeroTitle')}
            </h2>
            <p className="text-sm text-gray-600 sm:text-base leading-relaxed">
              Need your land surveyed, boundaries verified, or a certified cadastral plan for a land title transfer or construction permit? Connect with RLMUA-accredited surveyors with RTK GNSS sub-cm accuracy.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/gis">
                <Button className="font-bold">
                  🚀 {tr('requestSurveyNow')} →
                </Button>
              </Link>
              <Link to="/gis#interactive-map">
                <Button variant="secondary">
                  🗺️ {tr('interactiveMap')}
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <img
                src="/images/gis_field_surveyor.jpg"
                alt="Licensed Surveyor"
                className="h-36 w-full object-cover transition hover:scale-105"
              />
              <p className="p-2 text-center text-xs font-medium text-gray-700 bg-white">RTK Field Survey</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <img
                src="/images/gis_satellite_cadastral.jpg"
                alt="Cadastral Map"
                className="h-36 w-full object-cover transition hover:scale-105"
              />
              <p className="p-2 text-center text-xs font-medium text-gray-700 bg-white">Cadastral Mapping</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Explore Duhuza Ecosystem</h2>
            <p className="text-sm text-gray-500">Fast, secure and verified listings across Rwanda</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/listings"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-brand-300"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src="/images/house_kigali_modern.jpg"
                alt="Properties"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-3 text-lg font-bold text-white">🏡 {tr('listings')}</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">{tr('browseProperties')}</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-brand-700 group-hover:underline">
                Explore Houses, Land & Rentals →
              </span>
            </div>
          </Link>

          <Link
            to="/gis"
            className="group overflow-hidden rounded-2xl border border-emerald-300 bg-white shadow-sm transition hover:shadow-lg hover:border-emerald-500"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src="/images/gis_field_surveyor.jpg"
                alt="GIS Land Surveys"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 to-transparent" />
              <span className="absolute bottom-3 left-3 text-lg font-bold text-white">🗺️ {tr('gisNav')}</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">Land surveys, UPI demarcation & contour mapping</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-brand-700 group-hover:underline">
                Book a Certified Surveyor →
              </span>
            </div>
          </Link>

          <Link
            to="/market"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-brand-300"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src="/images/market_electronics.jpg"
                alt="Isoko Market"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-3 text-lg font-bold text-white">🛍️ {tr('market')}</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">{tr('createMarketItem')}</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-brand-700 group-hover:underline">
                Browse Electronics, Goods & More →
              </span>
            </div>
          </Link>

          <Link
            to="/services"
            className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-brand-300"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
              <img
                src="/images/service_surveyor.jpg"
                alt="Services"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute bottom-3 left-3 text-lg font-bold text-white">🛠️ {tr('services')}</span>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600">{tr('registerAsProvider')}</p>
              <span className="mt-3 inline-flex items-center text-xs font-bold text-brand-700 group-hover:underline">
                Find Certified Experts →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
