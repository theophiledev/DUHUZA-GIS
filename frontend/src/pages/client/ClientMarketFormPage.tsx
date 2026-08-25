import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createMarketItem } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, Select, Textarea } from '../../components/ui';
import { MediaUploader } from '../../components/MediaUploader';
import { showToast } from '../../components/Toast';
import { useLanguage } from '../../context/LanguageContext';

export function ClientMarketFormPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
  ]);
  const [form, setForm] = useState({
    category: 'Electronics',
    title: '',
    description: '',
    price: '',
    district: 'Kigali',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createMarketItem({
        category: form.category,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        district: form.district || undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      });
      showToast('Item submitted for marketplace review!', 'success');
      navigate('/dashboard/client/market');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={tr('createMarketItem')}
      subtitle="List an item on the self-serve Isoko marketplace for buyers across Rwanda."
      actions={
        <Link to="/dashboard/client/market">
          <Button variant="secondary">← Back to My Market Items</Button>
        </Link>
      }
    >
      <Card className="max-w-3xl p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <ErrorAlert message={error} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={tr('category')}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="Electronics">Electronics & Phones</option>
              <option value="Furniture">Home Furniture</option>
              <option value="Vehicles & Parts">Vehicles & Parts</option>
              <option value="Produce & Food">Produce & Farm Food</option>
              <option value="Fashion & Apparel">Fashion & Apparel</option>
              <option value="Construction & Tools">Construction & Tools</option>
              <option value="Other">Other Goods</option>
            </Select>

            <Input
              label={`${tr('price')} (RWF)`}
              type="number"
              placeholder="e.g. 150000"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <div className="sm:col-span-2">
              <Input
                label={tr('title')}
                placeholder="e.g. iPhone 13 Pro Max 256GB Sierra Blue"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label={tr('description')}
                placeholder="Describe the condition, features, warranty, pickup location..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label={tr('district')}
                placeholder="e.g. Gasabo, Kigali"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </div>
          </div>

          {/* Media Uploader */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
            <MediaUploader
              mediaUrls={mediaUrls}
              onChange={setMediaUrls}
              maxFiles={6}
              label="Item Photos"
              helperText="Upload clear photos of your item from multiple angles."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => navigate('/dashboard/client/market')} type="button">
              {tr('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="px-6 shadow-md">
              {loading ? tr('loading') : 'Post Item on Isoko'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
