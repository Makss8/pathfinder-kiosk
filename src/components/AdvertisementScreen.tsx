import React, { useEffect, useState, useCallback } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useLanguage } from '@/i18n/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

interface AdvertisementScreenProps {
  onTouch: () => void;
}

const AdvertisementScreen: React.FC<AdvertisementScreenProps> = ({ onTouch }) => {
  const { advertisements } = useMapStore();
  const { t } = useLanguage();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const activeAds = advertisements.filter((ad) => ad.active);

  useEffect(() => {
    if (activeAds.length === 0) return;

    const currentAd = activeAds[currentAdIndex];
    const timer = setTimeout(() => {
      setCurrentAdIndex((prev) => (prev + 1) % activeAds.length);
    }, (currentAd?.duration || 5) * 1000);

    return () => clearTimeout(timer);
  }, [currentAdIndex, activeAds]);

  const handleInteraction = useCallback(() => {
    onTouch();
  }, [onTouch]);

  if (activeAds.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-gradient-to-br from-background via-secondary to-background flex flex-col items-center justify-center cursor-pointer z-50"
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>
        <div className="text-center animate-pulse">
          <h1 className="text-6xl font-display font-bold text-foreground mb-8">
            {t('app.title')}
          </h1>
          <p className="text-2xl text-muted-foreground">
            {t('app.touchToStart')}
          </p>
        </div>
      </div>
    );
  }

  const currentAd = activeAds[currentAdIndex];

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer z-50 overflow-hidden"
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>
      
      {/* Ad Image */}
      <img
        src={currentAd.imageUrl}
        alt="Advertisement"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
      />
      
      {/* Overlay with touch prompt */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 flex items-end justify-center pb-16">
        <div className="text-center animate-pulse">
          <p className="text-3xl text-white font-medium drop-shadow-lg">
            {t('app.touchToStart')}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      {activeAds.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {activeAds.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentAdIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertisementScreen;
