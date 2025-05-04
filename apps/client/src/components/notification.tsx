import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface Props {
  inviterId: string;
  onAccept: () => void;
  onReject: () => void;
  autoRejectSeconds?: number;
}

const Notification: React.FC<Props> = ({
  inviterId,
  onAccept,
  onReject,
  autoRejectSeconds = 15,
}) => {
  const { t } = useTranslation();

  const [remaining, setRemaining] = useState(autoRejectSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onReject();
      return;
    }
    const timer = setTimeout(() => setRemaining((sec) => sec - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onReject]);

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white shadow-md rounded p-4 text-center transition-colors">
      <p className="mb-4 font-medium">{t('invite.new', { id: inviterId })}</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onAccept}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {t('invite.accept')}
        </button>
        <button
          onClick={onReject}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {t('invite.reject')}
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('invite.auto-reject', { duration: remaining })}
      </p>
    </div>
  );
};

export default Notification;
