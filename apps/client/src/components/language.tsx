import { useTranslation } from 'react-i18next';

const Language = () => {
  const { i18n } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  return (
    <select
      onChange={handleChange}
      value={i18n.language}
      className="absolute top-4 right-4 border px-2 py-1 rounded"
    >
      <option value="en">EN</option>
      <option value="ru">RU</option>
      <option value="ua">UA</option>
    </select>
  );
};

export default Language;
