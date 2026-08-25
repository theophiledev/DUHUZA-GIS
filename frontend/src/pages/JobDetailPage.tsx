import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { applyToJob, getJob } from '../api';
import { Button, Card, ErrorAlert, Input, LoadingSpinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import type { Job } from '../types';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { tr } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [applyMsg, setApplyMsg] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    getJob(id).then(setJob).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setApplyMsg('');
    try {
      await applyToJob(id, cvUrl || undefined);
      setApplyMsg('Application submitted!');
    } catch (e) {
      setApplyMsg(e instanceof Error ? e.message : tr('error'));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner label={tr('loading')} />;
  if (error) return <ErrorAlert message={error} />;
  if (!job) return null;

  return (
    <Card className="max-w-2xl">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-sm text-gray-500">{job.location ?? '—'} · {job.salaryRange ?? '—'}</p>
      {job.deadline && <p className="text-sm text-gray-500">{tr('deadline')}: {new Date(job.deadline).toLocaleDateString()}</p>}
      <p className="mt-4 whitespace-pre-wrap">{job.description}</p>
      {user?.role === 'CLIENT' && (
        <div className="mt-6 space-y-3 border-t pt-4">
          <Input label="CV URL (optional)" value={cvUrl} onChange={(e) => setCvUrl(e.target.value)} placeholder="https://..." />
          <Button onClick={handleApply} disabled={applying}>{applying ? tr('loading') : tr('apply')}</Button>
          {applyMsg && <p className="text-sm text-gray-600">{applyMsg}</p>}
        </div>
      )}
      {!user && <p className="mt-4 text-sm text-gray-500">{tr('login')} to {tr('apply').toLowerCase()}</p>}
    </Card>
  );
}
