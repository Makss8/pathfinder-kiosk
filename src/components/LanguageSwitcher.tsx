import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Language } from '@/i18n/translations';
import { Button } from '@/components/ui/button';

const flags: Record<Language, string> = {
  en: '🇬🇧',
  pl: '🇵🇱',
};

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2">
      {(Object.keys(flags) as Language[]).map((lang) => (
        <Button
          key={lang}
          variant={language === lang ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLanguage(lang)}
          className={`text-2xl px-3 py-1 h-10 ${
            language === lang
              ? 'bg-primary/20 border-primary'
              : 'bg-card/50 border-border hover:bg-card'
          }`}
        >
          {flags[lang]}
        </Button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
