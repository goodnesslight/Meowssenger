import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Language: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = localStorage.getItem('lang');
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [i18n]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang: string = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <select
      value={i18n.language}
      onChange={handleChange}
      className="
        absolute top-4 right-4
        border px-2 py-1 rounded
        bg-white text-black
        dark:bg-gray-800 dark:text-white dark:border-gray-600
        transition-colors
      "
    >
      <option value="en">EN</option>
      <option value="ru">RU</option>
      <option value="ua">UA</option>
    </select>
  );
};

export default Language;
