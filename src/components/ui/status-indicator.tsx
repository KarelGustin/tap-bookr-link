import { SaveStatus } from '@/hooks/use-autosave';

interface StatusIndicatorProps {
  status: SaveStatus;
  className?: string;
  retryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const StatusIndicator = ({ status, className = '', retryAction }: StatusIndicatorProps) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'saving':
        return { text: 'Opslaan…', icon: '•', className: 'text-blue-600' };
      case 'saved':
        return { text: 'Opgeslagen', icon: '✓', className: 'text-green-600' };
      case 'error':
        return { text: 'Kon niet opslaan', icon: '⚠', className: 'text-red-600' };
      default:
        return { text: '', icon: '', className: '' };
    }
  };

  const statusInfo = getStatusInfo();
  
  if (!statusInfo.text) return null;

  return (
    <div className={`absolute top-4 right-4 flex items-center gap-2 text-sm ${statusInfo.className} ${className}`}>
      <span className="font-medium">{statusInfo.icon}</span>
      <span>{statusInfo.text}</span>
      {retryAction && status === 'error' && (
        <button
          onClick={retryAction.onClick}
          className="text-xs underline hover:no-underline ml-2"
        >
          {retryAction.label}
        </button>
      )}
    </div>
  );
};
