import { useState } from 'react';
import { socket } from '../helpers/socket/socket';
import { chatSockets } from '@shared';
import { useTranslation } from 'react-i18next';

const Invite: React.FC = () => {
  const { t } = useTranslation();

  const [inputId, setInputId] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    socket.emit(chatSockets.invite.new, { userId: inputId });
  };

  socket.on(chatSockets.invite.new, (): void => {
    setMessage('');
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <input
        className="border px-4 py-2 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
        placeholder={t('partner.id')}
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        type="submit"
      >
        {t('invite.send')}
      </button>
      {message && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </form>
  );
};

export default Invite;
