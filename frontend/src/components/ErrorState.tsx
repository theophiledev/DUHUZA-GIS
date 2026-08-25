import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui';

interface ErrorStateProps {
  onRetry?: () => void;
  titleKey?: 'errorLoadProperties' | 'errorLoadMarket' | 'errorLoadJobs' | 'errorLoadServices';
}

export function ErrorState({ onRetry, titleKey = 'errorLoadProperties' }: ErrorStateProps) {
  const { tr } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">⚠️</div>
      <h2 className="text-lg font-semibold text-gray-900">{tr(titleKey)}</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">{tr('errorServerSubtitle')}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-6 min-w-[140px]">
          {tr('tryAgain')}
        </Button>
      )}
    </div>
  );
}
