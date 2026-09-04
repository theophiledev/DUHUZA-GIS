import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createGisRequest, myGisRequests } from '../api';
import { Button, Card, EmptyState, ErrorAlert, Input, LoadingSpinner, PageHeader, Select, StatusBadge, Textarea } from '../components/ui';
import type { GisRequest } from '../types';
import { BadgeCheck, CheckCircle2, Clock, FileText, Lightbulb, Map, MapPin, MessageCircle, Satellite, Search, Send, Wallet, Zap } from 'lucide-react';

interface SampleParcel {
  id: string;
  upi: string;
  location: string;
  district: string;
  sector: string;
  areaSqm: number;
  zoning: string;
  surveyor: string;
  date: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
}

const SAMPLE_PARCELS: SampleParcel[] = [
  {
    id: 'p1',
    upi: '1/02/08/04/412A',
    location: 'Ndera, Gasabo (Kigali)',
    district: 'Gasabo',
    sector: 'Ndera',
    areaSqm: 1250,
    zoning: 'R2 - Low Density Residential',
    surveyor: 'Eng. Patrick Habimana (Reg #RW-SURV-2024-88)',
    date: '12 Mar 2026',
    lat: -1.9482,
    lng: 30.1265,
    polygon: [
      [-1.9478, 30.1260],
      [-1.9479, 30.1272],
      [-1.9488, 30.1270],
      [-1.9486, 30.1258],
    ],
  },
  {
    id: 'p2',
    upi: '1/03/11/02/109B',
    location: 'Gahanga, Kicukiro (Kigali)',
    district: 'Kicukiro',
    sector: 'Gahanga',
    areaSqm: 3400,
    zoning: 'C1 - Commercial & Mixed Use',
    surveyor: 'Eng. Eric Munyaneza (Reg #RW-SURV-2023-14)',
    date: '28 Feb 2026',
    lat: -1.9950,
    lng: 30.0820,
    polygon: [
      [-1.9940, 30.0810],
      [-1.9942, 30.0835],
      [-1.9960, 30.0832],
      [-1.9958, 30.0808],
    ],
  },
  {
    id: 'p3',
    upi: '1/01/04/02/788C',
    location: 'Nyarutarama, Gasabo (Kigali)',
    district: 'Gasabo',
    sector: 'Remera',
    areaSqm: 850,
    zoning: 'R1A - Single Family Villa',
    surveyor: 'Eng. Patrick Habimana (Reg #RW-SURV-2024-88)',
    date: '18 Jan 2026',
    lat: -1.9355,
    lng: 30.1042,
    polygon: [
      [-1.9350, 30.1036],
      [-1.9351, 30.1048],
      [-1.9360, 30.1046],
      [-1.9359, 30.1034],
    ],
  },
  {
    id: 'p4',
    upi: '5/07/03/01/224C',
    location: 'Nyamata, Bugesera (Eastern Province)',
    district: 'Bugesera',
    sector: 'Nyamata',
    areaSqm: 5000,
    zoning: 'A1 - Agricultural / Country Estate',
    surveyor: 'Eng. Alice Mukamana (Reg #RW-SURV-2025-02)',
    date: '04 Feb 2026',
    lat: -2.1540,
    lng: 30.2210,
    polygon: [
      [-2.1530, 30.2195],
      [-2.1532, 30.2225],
      [-2.1552, 30.2220],
      [-2.1550, 30.2192],
    ],
  },
  {
    id: 'p5',
    upi: '4/01/02/05/881A',
    location: 'Kinigi, Musanze (Northern Province)',
    district: 'Musanze',
    sector: 'Kinigi',
    areaSqm: 50000,
    zoning: 'A1 - Agricultural / Eco-Tourism',
    surveyor: 'Eng. Patrick Habimana (Reg #RW-SURV-2024-88)',
    date: '14 Feb 2026',
    lat: -1.5032,
    lng: 29.6341,
    polygon: [
      [-1.5015, 29.6320],
      [-1.5018, 29.6360],
      [-1.5050, 29.6355],
      [-1.5045, 29.6315],
    ],
  },
  {
    id: 'p6',
    upi: '3/04/01/03/312D',
    location: 'Gisenyi Waterfront, Rubavu (Western Province)',
    district: 'Rubavu',
    sector: 'Gisenyi',
    areaSqm: 1800,
    zoning: 'T1 - Tourism & Lakefront Villa',
    surveyor: 'Eng. Eric Munyaneza (Reg #RW-SURV-2023-14)',
    date: '20 Jan 2026',
    lat: -1.6834,
    lng: 29.2612,
    polygon: [
      [-1.6825, 29.2600],
      [-1.6826, 29.2625],
      [-1.6845, 29.2620],
      [-1.6842, 29.2598],
    ],
  },
];

const DISTRICT_LOCATIONS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Kigali: { lat: -1.95, lng: 30.06, zoom: 12 },
  Gasabo: { lat: -1.92, lng: 30.12, zoom: 13 },
  Kicukiro: { lat: -1.98, lng: 30.10, zoom: 13 },
  Nyarugenge: { lat: -1.95, lng: 30.05, zoom: 13 },
  Bugesera: { lat: -2.15, lng: 30.22, zoom: 12 },
  Musanze: { lat: -1.50, lng: 29.63, zoom: 13 },
  Rubavu: { lat: -1.68, lng: 29.26, zoom: 13 },
};

export function GisPage() {
  const { user } = useAuth();
  const { tr } = useLanguage();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const polygonsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<SampleParcel | null>(SAMPLE_PARCELS[0]);
  const [pinnedCoords, setPinnedCoords] = useState<{ lat: number; lng: number }>({
    lat: -1.9482,
    lng: 30.1265,
  });

  // Request form state
  const [surveyType, setSurveyType] = useState('boundaryDemarcation');
  const [district, setDistrict] = useState('Gasabo');
  const [sector, setSector] = useState('Nyarutarama');
  const [parcelSize, setParcelSize] = useState('800');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cost estimator state
  const [calcType, setCalcType] = useState('boundary');
  const [calcSize, setCalcSize] = useState('standard');

  // Tracking state
  const [trackRef, setTrackRef] = useState('');
  const [trackedResult, setTrackedResult] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);

  // User's own requests if logged in
  const [myRequests, setMyRequests] = useState<GisRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [-1.95, 30.09],
      zoom: 12,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create LayerGroup for parcel polygons
    const polygonsLayerGroup = L.layerGroup().addTo(map);
    polygonsLayerGroupRef.current = polygonsLayerGroup;

    // Custom Icon for Selected Coordinates Pin
    const pinIcon = L.divIcon({
      className: 'gis-pin-wrapper',
      html: `
        <div style="background-color: #16a34a; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const initialMarker = L.marker([pinnedCoords.lat, pinnedCoords.lng], { icon: pinIcon })
      .addTo(map)
      .bindPopup('<b>Selected Survey Target</b><br/>Click anywhere to change coordinates')
      .openPopup();

    selectedMarkerRef.current = initialMarker;

    // Render Sample Parcels
    SAMPLE_PARCELS.forEach((parcel) => {
      const isInitialSelected = parcel.id === SAMPLE_PARCELS[0].id;

      const polygonLayer = L.polygon(parcel.polygon, {
        color: isInitialSelected ? '#15803d' : '#0284c7',
        fillColor: isInitialSelected ? '#22c55e' : '#38bdf8',
        fillOpacity: isInitialSelected ? 0.45 : 0.25,
        weight: isInitialSelected ? 3 : 2,
        dashArray: isInitialSelected ? undefined : '4, 4',
      });

      polygonLayer.bindTooltip(`<b>UPI: ${parcel.upi}</b><br/>${parcel.areaSqm} m² • ${parcel.zoning}`, {
        sticky: true,
      });

      polygonLayer.on('click', () => {
        setSelectedParcel(parcel);
        setPinnedCoords({ lat: parcel.lat, lng: parcel.lng });
        setDistrict(parcel.district);
        setSector(parcel.sector);

        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.setLatLng([parcel.lat, parcel.lng]);
        }

        map.panTo([parcel.lat, parcel.lng]);
      });

      polygonLayer.addTo(polygonsLayerGroup);
    });

    // Map Click Listener to drop pin and auto-fill coordinates
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const formattedLat = Number(lat.toFixed(5));
      const formattedLng = Number(lng.toFixed(5));

      setPinnedCoords({ lat: formattedLat, lng: formattedLng });

      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setLatLng([formattedLat, formattedLng]);
        selectedMarkerRef.current.bindPopup(
          `<b>Pinned Survey Point</b><br/>Lat: ${formattedLat}, Lng: ${formattedLng}`
        ).openPopup();
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update polygon highlight when selected parcel changes
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsLayerGroupRef.current) return;

    polygonsLayerGroupRef.current.clearLayers();

    SAMPLE_PARCELS.forEach((parcel) => {
      const isSelected = selectedParcel?.id === parcel.id;

      const polygonLayer = L.polygon(parcel.polygon, {
        color: isSelected ? '#16a34a' : '#0284c7',
        fillColor: isSelected ? '#22c55e' : '#38bdf8',
        fillOpacity: isSelected ? 0.45 : 0.25,
        weight: isSelected ? 3.5 : 2,
      });

      polygonLayer.bindTooltip(`<b>UPI: ${parcel.upi}</b><br/>${parcel.areaSqm} m² • ${parcel.location}`);

      polygonLayer.on('click', () => {
        setSelectedParcel(parcel);
        setPinnedCoords({ lat: parcel.lat, lng: parcel.lng });
        setDistrict(parcel.district);
        setSector(parcel.sector);

        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.setLatLng([parcel.lat, parcel.lng]);
        }
      });

      polygonsLayerGroupRef.current?.addLayer(polygonLayer);
    });
  }, [selectedParcel]);

  // Load client requests if logged in
  useEffect(() => {
    if (user && user.role === 'CLIENT') {
      setLoadingRequests(true);
      myGisRequests()
        .then(setMyRequests)
        .catch(() => {})
        .finally(() => setLoadingRequests(false));
    }
  }, [user]);

  // Handle survey submission
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitSuccess(false);

    if (!user) {
      setErrorMessage(tr('surveyLoginPrompt'));
      return;
    }

    setSubmitting(true);
    try {
      const purposeText = `${tr(surveyType as any)} | Location: ${district}, ${sector} | Size: ${parcelSize} m² | Tel: ${clientPhone} ${notes ? `| Note: ${notes}` : ''}`;

      await createGisRequest({
        parcelLat: pinnedCoords.lat,
        parcelLng: pinnedCoords.lng,
        purpose: purposeText,
      });

      setSubmitSuccess(true);
      setNotes('');

      if (user.role === 'CLIENT') {
        myGisRequests().then(setMyRequests).catch(() => {});
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : tr('error'));
    } finally {
      setSubmitting(false);
    }
  };

  // Quick jump map view to district
  const handleJumpDistrict = (dName: string) => {
    const target = DISTRICT_LOCATIONS[dName];
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.setView([target.lat, target.lng], target.zoom, { animate: true });
      setDistrict(dName);
    }
  };

  // Price calculation
  const getEstimatedPrice = () => {
    let base = 150000;
    if (calcType === 'topo') base = 250000;
    if (calcType === 'subdivision') base = 300000;
    if (calcType === 'transfer') base = 120000;
    if (calcType === 'permit') base = 220000;

    let multiplier = 1.0;
    if (calcSize === 'medium') multiplier = 1.4;
    if (calcSize === 'large') multiplier = 2.2;
    if (calcSize === 'hectare') multiplier = 3.8;

    return Math.round(base * multiplier).toLocaleString();
  };

  // Quick status tracker search
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackRef.trim()) return;

    setIsTracking(true);
    setTimeout(() => {
      setIsTracking(false);
      // Demo match or sample result
      if (trackRef.toUpperCase().includes('412') || trackRef.includes('1')) {
        setTrackedResult({
          refId: trackRef,
          upi: '1/02/08/04/412A',
          purpose: 'Cadastral Boundary Demarcation & Title Transfer',
          status: 'COMPLETED',
          surveyor: 'Eng. Patrick Habimana',
          completedDate: 'March 12, 2026',
          reportAvailable: true,
        });
      } else {
        setTrackedResult({
          refId: trackRef,
          upi: 'Pending Assignment',
          purpose: 'Topographical Land Survey Request',
          status: 'IN_PROGRESS',
          surveyor: 'Eng. Eric Munyaneza (Field Measurement Active)',
          completedDate: 'Estimated: 48 hours',
          reportAvailable: false,
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-800 to-emerald-950 p-8 text-white shadow-xl sm:p-12">
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              RLMUA ACCREDITED • RTK GNSS SUB-CM PRECISION
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {tr('gisHeroTitle')}
            </h1>
            <p className="mt-4 text-base text-brand-100 sm:text-lg">
              {tr('gisHeroSubtitle')}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#survey-form">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-6 py-2.5 text-base font-extrabold text-[#064E3B] shadow-lg hover:bg-emerald-50 active:translate-y-px transition-all cursor-pointer min-h-[42px]"
                >
                  {tr('requestSurveyNow')} →
                </button>
              </a>
              <a href="#interactive-map">
                <Button variant="secondary" className="border-emerald-400/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 text-base py-2.5 px-5">
                  <span className="inline-flex items-center gap-2"><Map size={16} strokeWidth={1.75} />{tr('interactiveMap')}</span>
                </Button>
              </a>
              <a href="#cost-estimator">
                <Button variant="secondary" className="border-emerald-400/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 text-base py-2.5 px-5">
                  <span className="inline-flex items-center gap-2"><Wallet size={16} strokeWidth={1.75} />{tr('calcEstimate')}</span>
                </Button>
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-emerald-700/50 pt-6 text-sm">
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-brand-200">Legal Cadastral Compliance</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">&lt; 2 cm</p>
                <p className="text-xs text-brand-200">RTK GPS Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">24-48h</p>
                <p className="text-xs text-brand-200">Turnaround in Kigali</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur shadow-2xl">
              <img
                src="/images/gis_field_surveyor.jpg"
                alt="Licensed Surveyor Rwanda"
                className="h-72 w-full rounded-xl object-cover shadow-md sm:h-80"
              />
              <div className="p-3">
                <div className="flex items-center justify-between text-xs text-brand-200">
                  <span className="font-semibold text-white">Field Cadastral Demarcation</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300">Live RTK Rover</span>
                </div>
                <p className="mt-1 text-xs text-brand-100">
                  Certified surveyor verifying beacon coordinates overlooking Kigali hills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE MAP SECTION */}
      <section id="interactive-map" className="scroll-mt-20">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tr('interactiveMap')}</h2>
            <p className="text-sm text-gray-600">{tr('clickMapToPin')}</p>
          </div>

          {/* Quick District Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-500">Jump:</span>
            {Object.keys(DISTRICT_LOCATIONS).map((dName) => (
              <button
                key={dName}
                type="button"
                onClick={() => handleJumpDistrict(dName)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  district === dName
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {dName}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Leaflet Map Box */}
          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 font-medium text-brand-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                    Selected Pin: {pinnedCoords.lat}, {pinnedCoords.lng}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800">
                    {SAMPLE_PARCELS.length} Verified Sample Parcels
                  </span>
                </div>
              </div>

              {/* Map Canvas */}
              <div
                ref={mapContainerRef}
                className="h-[460px] w-full"
                style={{ minHeight: '460px' }}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-emerald-500 opacity-60" />
                    Active Parcel Polygon
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-sky-500 opacity-60" />
                    Cadastral Boundary
                  </span>
                </div>
                <span className="inline-flex items-center gap-1"><Lightbulb size={14} strokeWidth={1.75} />Click on any green polygon to view verified parcel UPI data</span>
              </div>
            </div>
          </div>

          {/* Parcel Details & Quick Info Sidebar */}
          <div className="space-y-4 lg:col-span-4">
            {selectedParcel ? (
              <Card className="border-brand-200 bg-gradient-to-b from-brand-50/50 to-white">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <div>
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">
                      OFFICIAL CADASTRAL DEED
                    </span>
                    <h3 className="mt-1 text-base font-bold text-gray-900">{selectedParcel.upi}</h3>
                  </div>
                  <Map size={24} strokeWidth={1.75} className="text-brand-700" />
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{tr('location')}:</span>
                    <span className="font-semibold text-gray-800">{selectedParcel.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">{tr('parcelArea')}:</span>
                    <span className="font-bold text-brand-700">{selectedParcel.areaSqm.toLocaleString()} m² ({(selectedParcel.areaSqm / 10000).toFixed(2)} Ha)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Zoning Code:</span>
                    <span className="font-semibold text-gray-800">{selectedParcel.zoning}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Lead Surveyor:</span>
                    <span className="text-xs font-medium text-gray-700">{selectedParcel.surveyor}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Survey Date:</span>
                    <span className="font-medium text-gray-700">{selectedParcel.date}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  <span className="inline-flex items-start gap-1"><CheckCircle2 size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" /><span><strong>GeoJSON Coordinates Verified</strong>: 4 boundary beacons demarcated with RTK GNSS. Clean title ready for land transfer.</span></span>
                </div>

                <a href="#survey-form" className="mt-4 block">
                  <Button className="w-full text-xs font-semibold">
                    Request Survey at this Location
                  </Button>
                </a>
              </Card>
            ) : (
              <Card>
                <p className="text-sm text-gray-500">Select any parcel on the map to inspect its survey coordinates and UPI.</p>
              </Card>
            )}

            {/* Satellite Cadastral Preview */}
            <Card className="overflow-hidden p-0">
              <img
                src="/images/gis_satellite_cadastral.jpg"
                alt="Cadastral Overlay Kigali"
                className="h-36 w-full object-cover"
              />
              <div className="p-3 text-xs">
                <p className="font-semibold text-gray-900">Kigali City Cadastral Overlay</p>
                <p className="mt-0.5 text-gray-500">Integrated with Rwanda Master Plan & GIS zoning maps.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. SURVEY REQUEST FORM */}
      <section id="survey-form" className="scroll-mt-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="shadow-md">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold text-gray-900">{tr('requestSurveyNow')}</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Fill in your parcel details or click on the map above to auto-fill GPS coordinates.
                </p>
              </div>

              {errorMessage && <div className="mt-4"><ErrorAlert message={errorMessage} /></div>}

              {submitSuccess ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                  <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto text-green-600" />
                  <h3 className="mt-2 text-lg font-bold text-green-900">{tr('surveySuccessMsg')}</h3>
                  <p className="mt-1 text-sm text-green-700">
                    A licensed surveyor from Duhuza will reach out to you at {clientPhone || 'your contact phone'} within 2 hours.
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    variant="secondary"
                    className="mt-4 border-green-300 text-green-800 hover:bg-green-100"
                  >
                    Submit Another Survey
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSurvey} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tr('surveyPurpose')}</label>
                    <Select
                      value={surveyType}
                      onChange={(e) => setSurveyType(e.target.value)}
                      required
                    >
                      <option value="boundaryDemarcation">{tr('boundaryDemarcation')}</option>
                      <option value="topographicalSurvey">{tr('topographicalSurvey')}</option>
                      <option value="landSubdivision">{tr('landSubdivision')}</option>
                      <option value="titleTransferSurvey">{tr('titleTransferSurvey')}</option>
                      <option value="constructionPermit">{tr('constructionPermit')}</option>
                      <option value="agriculturalMapping">{tr('agriculturalMapping')}</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('district')}</label>
                      <Select value={district} onChange={(e) => setDistrict(e.target.value)}>
                        <option value="Gasabo">Gasabo (Kigali)</option>
                        <option value="Kicukiro">Kicukiro (Kigali)</option>
                        <option value="Nyarugenge">Nyarugenge (Kigali)</option>
                        <option value="Bugesera">Bugesera (Eastern)</option>
                        <option value="Rwamagana">Rwamagana (Eastern)</option>
                        <option value="Musanze">Musanze (Northern)</option>
                        <option value="Rubavu">Rubavu (Western)</option>
                        <option value="Huye">Huye (Southern)</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                      <Input
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        placeholder="e.g. Nyarutarama, Gahanga..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Latitude</label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={pinnedCoords.lat}
                        onChange={(e) => setPinnedCoords({ ...pinnedCoords, lat: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Longitude</label>
                      <Input
                        type="number"
                        step="0.00001"
                        value={pinnedCoords.lng}
                        onChange={(e) => setPinnedCoords({ ...pinnedCoords, lng: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('parcelSizeEst')}</label>
                      <Input
                        value={parcelSize}
                        onChange={(e) => setParcelSize(e.target.value)}
                        placeholder="e.g. 800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{tr('contactPhone')}</label>
                      <Input
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="+250 788 000 000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{tr('clientNotes')}</label>
                    <Textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter your UPI number (e.g. 1/02/08/04/412A), road access details, or specific surveyor requirements..."
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full font-bold py-3 text-base">
                    {submitting ? tr('loading') : <span className="inline-flex items-center gap-2"><Send size={18} strokeWidth={1.75} />{tr('requestSurveyNow')}</span>}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* COST ESTIMATOR CARD */}
          <div id="cost-estimator" className="space-y-6 lg:col-span-5 scroll-mt-20">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-white shadow-md">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                <Wallet size={24} strokeWidth={1.75} className="text-emerald-700" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{tr('calcEstimate')}</h3>
                  <p className="text-xs text-gray-500">Transparent standard pricing for land surveys in Rwanda</p>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Select Service Type</label>
                  <Select value={calcType} onChange={(e) => setCalcType(e.target.value)}>
                    <option value="boundary">Boundary Demarcation / UPI Verification</option>
                    <option value="topo">Topographical & 3D Contour Survey</option>
                    <option value="subdivision">Land Partitioning & Subdivision</option>
                    <option value="transfer">Title Deed Transfer Survey</option>
                    <option value="permit">Construction Permit Site Survey</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Parcel Surface Area</label>
                  <Select value={calcSize} onChange={(e) => setCalcSize(e.target.value)}>
                    <option value="standard">Standard Residential (Up to 800 m²)</option>
                    <option value="medium">Medium Estate (800 – 2,500 m²)</option>
                    <option value="large">Large Commercial Plot (2,500 – 10,000 m²)</option>
                    <option value="hectare">Agricultural / Multi-Hectare (1 – 10 Ha)</option>
                  </Select>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-white p-4 text-center shadow-inner">
                  <span className="text-xs font-medium text-gray-500">{tr('estCost')}</span>
                  <p className="mt-1 text-3xl font-extrabold text-brand-700">{getEstimatedPrice()} RWF</p>
                  <p className="mt-1 text-xs text-emerald-700 font-medium">
                    <span className="inline-flex items-center gap-1"><Zap size={14} strokeWidth={1.75} />Includes RTK GNSS field survey, signed report, & boundary GeoJSON</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* TRACK EXISTING SURVEY */}
            <Card>
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Search size={20} strokeWidth={1.75} className="text-brand-700" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">{tr('trackSurveyTitle')}</h3>
                  <p className="text-xs text-gray-500">Check survey progress, assigned surveyor & report status</p>
                </div>
              </div>

              <form onSubmit={handleTrackSubmit} className="mt-4 flex gap-2">
                <Input
                  value={trackRef}
                  onChange={(e) => setTrackRef(e.target.value)}
                  placeholder={tr('trackSurveyPlaceholder')}
                  required
                />
                <Button type="submit" disabled={isTracking}>
                  {isTracking ? tr('loading') : tr('trackBtn')}
                </Button>
              </form>

              {trackedResult && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3.5 text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span>Reference: {trackedResult.refId}</span>
                    <StatusBadge status={trackedResult.status} />
                  </div>
                  <p className="text-gray-700"><strong>UPI:</strong> {trackedResult.upi}</p>
                  <p className="text-gray-700"><strong>Surveyor:</strong> {trackedResult.surveyor}</p>
                  <p className="text-gray-500"><strong>Timeline:</strong> {trackedResult.completedDate}</p>
                  {trackedResult.reportAvailable && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <a
                        href="/images/gis_sample_report_preview.jpg"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-brand-700 hover:underline"
                      >
                        <span className="inline-flex items-center gap-1"><FileText size={14} strokeWidth={1.75} />Download Signed Cadastral Plan & Report (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE DUHUZA GIS (FEATURES SHOWCASE) */}
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{tr('surveyFeaturesTitle')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Engineered to deliver fast, verified, and legally accredited cadastral surveys across Rwanda.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-2xl text-brand-700">
              <BadgeCheck size={24} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">{tr('certifiedSurveyors')}</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">{tr('certifiedSurveyorsDesc')}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl text-emerald-700">
              <Satellite size={24} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">{tr('highPrecision')}</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">{tr('highPrecisionDesc')}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-2xl text-sky-700">
              <FileText size={24} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">{tr('officialReports')}</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">{tr('officialReportsDesc')}</p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 transition hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl text-amber-700">
              <Clock size={24} strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-bold text-gray-900">{tr('fastDelivery')}</h3>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">{tr('fastDeliveryDesc')}</p>
          </div>
        </div>
      </section>

      {/* 5. SAMPLE CADASTRAL SURVEY REPORT PREVIEW */}
      <section className="grid gap-6 lg:grid-cols-12 items-center rounded-3xl border border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
        <div className="lg:col-span-6">
          <span className="rounded bg-brand-500/20 px-2.5 py-1 text-xs font-bold text-brand-300">
            OFFICIAL SAMPLE PREVIEW
          </span>
          <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{tr('sampleSurveysTitle')}</h2>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            Every survey conducted via Duhuza generates a legally binding survey report containing beacon coordinates (UTM 35S), elevation contours, polygon perimeter, and RLMUA validation seal.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/images/gis_sample_report_preview.jpg" target="_blank" rel="noreferrer">
              <Button className="bg-brand-600 text-white hover:bg-brand-700 font-semibold text-sm">
                <span className="inline-flex items-center gap-2"><FileText size={16} strokeWidth={1.75} />{tr('viewSampleReport')}</span>
              </Button>
            </a>
            <a href="https://wa.me/250788100001?text=Hello%20Duhuza%20GIS%20Team%2C%20I%20would%20like%20to%20inquire%20about%20a%20land%20survey" target="_blank" rel="noreferrer">
              <Button variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20 text-sm">
                <span className="inline-flex items-center gap-2"><MessageCircle size={16} strokeWidth={1.75} />{tr('contactWhatsapp')}</span>
              </Button>
            </a>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
            <img
              src="/images/gis_sample_report_preview.jpg"
              alt="Official Cadastral Report Sample"
              className="h-64 w-full object-cover sm:h-72"
            />
          </div>
        </div>
      </section>

      {/* 6. LOGGED-IN CLIENT GIS REQUESTS (IF ANY) */}
      {user && user.role === 'CLIENT' && (
        <section className="space-y-4">
          <PageHeader
            title={tr('myApplications')}
            subtitle="Your active and completed survey requests"
            action={<Link to="/dashboard/client/gis"><Button variant="secondary">Open Dashboard</Button></Link>}
          />
          {loadingRequests && <LoadingSpinner label={tr('loading')} />}
          {!loadingRequests && myRequests.length === 0 && (
            <EmptyState message="You have no previous survey requests on record." />
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {myRequests.map((r) => (
              <Card key={r.id} className="border-l-4 border-l-brand-600">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-2">{r.purpose}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} strokeWidth={1.75} />Coordinates: {r.parcelLat}, {r.parcelLng}</span>
                </p>
                {r.reportUrl && (
                  <div className="mt-3">
                    <a
                      href={r.reportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-brand-700 hover:underline"
                    >
                      <span className="inline-flex items-center gap-1"><FileText size={14} strokeWidth={1.75} />Download Survey Plan</span>
                    </a>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
