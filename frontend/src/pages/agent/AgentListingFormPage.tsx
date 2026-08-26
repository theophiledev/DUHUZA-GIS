import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createListing, myListings, updateListing } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, Select, Textarea } from '../../components/ui';
import { MediaUploader } from '../../components/MediaUploader';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';
import { getCells, getDistricts, getSectors, getVillages, getProvinceForDistrict, rwandaProvinces } from '../../utils/rwandaLocations';
import { FileText, Home, Image, MapPin } from 'lucide-react';
import { Lock } from 'lucide-react';

export function AgentListingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { lang, tr } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80',
  ]);
  const [form, setForm] = useState({
    category: 'HOUSE',
    listingType: 'SALE',
    price: '',
    privateLat: '-1.9501',
    privateLng: '30.0589',
    district: '',
    sector: '',
    cell: '',
    village: '',
    province: '',
    ownerName: '',
    ownerPhone: '',
    internalNotes: '',
    title: '',
    description: '',
    bedrooms: '',
  });

  useEffect(() => {
    if (!id) return;
    myListings().then((list) => {
      const l = list.find((x) => x.id === id);
      if (!l) return;
      const t = l.translations?.[0];
      setForm({
        category: l.category,
        listingType: l.listingType,
        price: String(l.price ?? ''),
        privateLat: String(l.privateLat ?? '-1.9501'),
        privateLng: String(l.privateLng ?? '30.0589'),
        district: l.district ?? '',
        sector: l.sector ?? '',
        cell: l.cell ?? '',
        village: l.village ?? '',
        province: getProvinceForDistrict(l.district ?? ''),
        ownerName: l.ownerName ?? '',
        ownerPhone: l.ownerPhone ?? '',
        internalNotes: l.internalNotes ?? '',
        title: t?.title ?? '',
        description: t?.description ?? '',
        bedrooms: Array.isArray(l.attributes)
          ? l.attributes.find((a) => a.key === 'bedrooms')?.value ?? ''
          : (l.attributes as Record<string, string>)?.bedrooms ?? '',
      });
      if (l.media && l.media.length > 0) {
        setMediaUrls(l.media.map((m) => m.url));
      }
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = {
      category: form.category,
      listingType: form.listingType,
      price: form.price ? Number(form.price) : undefined,
      privateLat: Number(form.privateLat),
      privateLng: Number(form.privateLng),
      district: form.district || undefined,
      sector: form.sector || undefined,
      cell: form.cell || undefined,
      village: form.village || undefined,
      ownerName: form.ownerName || undefined,
      ownerPhone: form.ownerPhone || undefined,
      internalNotes: form.internalNotes || undefined,
      attributes: form.bedrooms ? { bedrooms: form.bedrooms } : undefined,
      translations: [{ languageCode: lang, title: form.title, description: form.description }],
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
    };

    try {
      if (isEdit && id) {
        await updateListing(id, payload);
        showToast('Property listing updated successfully!', 'success');
      } else {
        await createListing(payload);
        showToast('Property draft saved successfully!', 'success');
      }
      navigate('/dashboard/agent/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={isEdit ? 'Edit Property Listing' : tr('createListing')}
      subtitle="Register property specifications, upload high-res photos, record private owner data, and submit for verification."
      actions={
        <Link to="/dashboard/agent/listings">
          <Button variant="secondary">← Back to My Listings</Button>
        </Link>
      }
    >
      <Card className="p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <ErrorAlert message={error} />}

          {/* Section 1: Basic Classification */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <Home size={18} strokeWidth={1.75} />
              <span>Classification & Pricing</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label={tr('category')}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="HOUSE">{tr('house')}</option>
                <option value="LAND">{tr('land')}</option>
                <option value="VEHICLE">{tr('vehicle')}</option>
                <option value="MOTORCYCLE">{tr('motorcycle')}</option>
              </Select>

              <Select
                label={tr('type')}
                value={form.listingType}
                onChange={(e) => setForm({ ...form, listingType: e.target.value })}
              >
                <option value="SALE">{tr('sale')}</option>
                <option value="RENT">{tr('rent')}</option>
              </Select>

              <Input
                label={`${tr('price')} (RWF)`}
                type="number"
                placeholder="e.g. 85000000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Title & Description */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <FileText size={18} strokeWidth={1.75} />
              <span>Public Details</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label={tr('title')}
                  placeholder="e.g. Modern 4-Bedroom Villa with Garden in Kicukiro"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Textarea
                  label={tr('description')}
                  placeholder="Provide comprehensive details, amenities, accessibility, water/power..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              {form.category === 'HOUSE' && (
                <Input
                  label="Bedrooms (Optional)"
                  placeholder="e.g. 4"
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Section 3: Enhanced Multi-Media Uploader */}
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50/50 p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Image size={18} strokeWidth={1.75} />
              <span>Property Photos & Media Gallery</span>
            </h3>
            <MediaUploader
              mediaUrls={mediaUrls}
              onChange={setMediaUrls}
              maxFiles={12}
              label="Upload Property Images"
              helperText="Add high quality photos. The first image will be used as the primary cover card photo."
            />
          </div>

          {/* Section 4: Rwanda Administrative Hierarchy */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
              <MapPin size={18} strokeWidth={1.75} />
              <span>Rwanda Administrative Location</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Select
                label={tr('province')}
                value={form.province}
                onChange={(e) =>
                  setForm({
                    ...form,
                    province: e.target.value,
                    district: '',
                    sector: '',
                    cell: '',
                    village: '',
                  })
                }
              >
                <option value="">{tr('selectProvince')}</option>
                {rwandaProvinces.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </Select>

              <Select
                label={tr('district')}
                value={form.district}
                disabled={!form.province}
                onChange={(e) =>
                  setForm({
                    ...form,
                    district: e.target.value,
                    sector: '',
                    cell: '',
                    village: '',
                  })
                }
              >
                <option value="">{tr('selectDistrict')}</option>
                {getDistricts(form.province).map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </Select>

              <Select
                label={tr('sector')}
                value={form.sector}
                disabled={!form.district}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sector: e.target.value,
                    cell: '',
                    village: '',
                  })
                }
              >
                <option value="">{tr('selectSector')}</option>
                {getSectors(form.province, form.district).map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </Select>

              <Select
                label={tr('cell')}
                value={form.cell}
                disabled={!form.sector}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cell: e.target.value,
                    village: '',
                  })
                }
              >
                <option value="">{tr('selectCell')}</option>
                {getCells(form.province, form.district, form.sector).map((cell) => (
                  <option key={cell} value={cell}>{cell}</option>
                ))}
              </Select>

              <Select
                label={tr('village')}
                value={form.village}
                disabled={!form.cell}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              >
                <option value="">{tr('selectVillage')}</option>
                {getVillages(form.province, form.district, form.sector, form.cell).map((village) => (
                  <option key={village} value={village}>{village}</option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Input
                label="Exact Latitude (Private GPS)"
                value={form.privateLat}
                onChange={(e) => setForm({ ...form, privateLat: e.target.value })}
              />
              <Input
                label="Exact Longitude (Private GPS)"
                value={form.privateLng}
                onChange={(e) => setForm({ ...form, privateLng: e.target.value })}
              />
            </div>
          </div>

          {/* Section 5: Private Owner Data */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
            <h3 className="font-bold text-amber-950 flex items-center gap-2">
              <Lock size={18} strokeWidth={1.75} />
              <span>Private Owner Information (Never Shown Publicly)</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Property Owner Full Name"
                placeholder="e.g. Marie Claire Mukamana"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
              />
              <Input
                label="Property Owner Phone Number"
                placeholder="+250 788 000 000"
                value={form.ownerPhone}
                onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Internal Agent Notes"
                  placeholder="Private negotiation terms, title deed number, commission agreement..."
                  value={form.internalNotes}
                  onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => navigate('/dashboard/agent/listings')} type="button">
              {tr('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="px-6 shadow-md">
              {loading ? tr('loading') : isEdit ? 'Save Changes' : 'Save as Draft'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
