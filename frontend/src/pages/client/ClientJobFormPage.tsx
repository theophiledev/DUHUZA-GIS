import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createJob } from '../../api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button, Card, ErrorAlert, Input, Textarea } from '../../components/ui';
import { useLanguage } from '../../context/LanguageContext';

export function ClientJobFormPage() {
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: 'Kigali, Rwanda',
    salaryRange: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createJob(form);
      navigate('/dashboard/client/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title={tr('postJob')}
      subtitle="Publish an employment opportunity or skilled contract role to connect with candidates."
      actions={
        <Link to="/dashboard/client/jobs">
          <Button variant="secondary">← Back to My Jobs</Button>
        </Link>
      }
    >
      <Card className="max-w-2xl p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorAlert message={error} />}

          <Input
            label={tr('title')}
            placeholder="e.g. Senior Land Surveyor / Civil Site Engineer"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Textarea
            label={tr('description')}
            placeholder="Describe role responsibilities, qualifications, requirements, schedule, deadline..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={5}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={tr('location')}
              placeholder="e.g. Kigali / Remote / Musanze"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <Input
              label={tr('salaryRange')}
              placeholder="e.g. 500,000 – 800,000 RWF/month"
              value={form.salaryRange}
              onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" onClick={() => navigate('/dashboard/client/jobs')} type="button">
              {tr('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="px-6 shadow-md">
              {loading ? tr('loading') : 'Submit Vacancy for Approval'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
