import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from './ui';

interface WhatsAppButtonProps {
  fetchUrl: () => Promise<{ url: string }>;
  label: string;
  className?: string;
}

export function WhatsAppButton({ fetchUrl, label, className = '' }: WhatsAppButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const { url } = await fetchUrl();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get WhatsApp link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        disabled={loading}
        className={`bg-[#25D366] hover:bg-[#1da851] ${className}`}
      >
        {loading ? '...' : <span className="inline-flex items-center gap-2"><MessageCircle size={18} strokeWidth={1.75} />{label}</span>}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
