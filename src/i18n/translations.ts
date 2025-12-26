export type Language = 'en' | 'pl';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'app.title': 'Indoor Navigation',
    'app.touchToStart': 'Touch to start',
    'app.returnToAds': 'Returning to screen saver...',
    
    // Map
    'map.search': 'Search for stands, toilets...',
    'map.categories': 'Categories',
    'map.allCategories': 'All',
    'map.noResults': 'No results found',
    'map.navigate': 'Navigate',
    'map.details': 'Details',
    'map.close': 'Close',
    
    // Categories
    'category.stand': 'Stands',
    'category.toilet': 'Toilets',
    'category.entrance': 'Entrance',
    'category.exit': 'Exit',
    'category.info': 'Information',
    'category.food': 'Food & Drinks',
    'category.elevator': 'Elevator',
    'category.stairs': 'Stairs',
    'category.first-aid': 'First Aid',
    
    // Halls
    'halls.title': 'Halls',
    'halls.select': 'Select Hall',
    
    // Admin
    'admin.title': 'Admin Panel',
    'admin.markers': 'Manage Markers',
    'admin.floorPlan': 'Floor Plan Settings',
    'admin.settings': 'App Settings',
    'admin.halls': 'Manage Halls',
    'admin.navigation': 'Navigation Nodes',
    'admin.advertisements': 'Advertisements',
    'admin.languages': 'Languages',
    
    // Markers
    'marker.add': 'Add New Marker',
    'marker.edit': 'Edit Marker',
    'marker.delete': 'Delete',
    'marker.save': 'Save',
    'marker.cancel': 'Cancel',
    'marker.name': 'Name',
    'marker.description': 'Description',
    'marker.category': 'Category',
    'marker.standNumber': 'Stand Number',
    'marker.position': 'Position',
    'marker.size': 'Size',
    'marker.image': 'Image',
    'marker.uploadImage': 'Upload Image',
    'marker.dragResize': 'Drag to move, handles to resize',
    
    // Navigation
    'nav.addNode': 'Add Navigation Node',
    'nav.connectNodes': 'Connect Nodes',
    'nav.deleteNode': 'Delete Node',
    'nav.instructions': 'Click on map to add nodes, drag to connect',
    
    // Advertisements
    'ads.add': 'Add Advertisement',
    'ads.duration': 'Duration (seconds)',
    'ads.active': 'Active',
    'ads.inactive': 'Inactive',
    'ads.inactivityTimeout': 'Inactivity Timeout (seconds)',
    
    // Messages
    'msg.saved': 'Saved successfully',
    'msg.deleted': 'Deleted successfully',
    'msg.error': 'An error occurred',
    'msg.fillRequired': 'Please fill in all required fields',
  },
  pl: {
    // Common
    'app.title': 'Nawigacja Wewnętrzna',
    'app.touchToStart': 'Dotknij, aby rozpocząć',
    'app.returnToAds': 'Powrót do wygaszacza...',
    
    // Map
    'map.search': 'Szukaj stoisk, toalet...',
    'map.categories': 'Kategorie',
    'map.allCategories': 'Wszystkie',
    'map.noResults': 'Brak wyników',
    'map.navigate': 'Nawiguj',
    'map.details': 'Szczegóły',
    'map.close': 'Zamknij',
    
    // Categories
    'category.stand': 'Stoiska',
    'category.toilet': 'Toalety',
    'category.entrance': 'Wejście',
    'category.exit': 'Wyjście',
    'category.info': 'Informacja',
    'category.food': 'Jedzenie i Napoje',
    'category.elevator': 'Winda',
    'category.stairs': 'Schody',
    'category.first-aid': 'Pierwsza Pomoc',
    
    // Halls
    'halls.title': 'Hale',
    'halls.select': 'Wybierz Halę',
    
    // Admin
    'admin.title': 'Panel Administracyjny',
    'admin.markers': 'Zarządzaj Znacznikami',
    'admin.floorPlan': 'Ustawienia Planu',
    'admin.settings': 'Ustawienia Aplikacji',
    'admin.halls': 'Zarządzaj Halami',
    'admin.navigation': 'Węzły Nawigacji',
    'admin.advertisements': 'Reklamy',
    'admin.languages': 'Języki',
    
    // Markers
    'marker.add': 'Dodaj Nowy Znacznik',
    'marker.edit': 'Edytuj Znacznik',
    'marker.delete': 'Usuń',
    'marker.save': 'Zapisz',
    'marker.cancel': 'Anuluj',
    'marker.name': 'Nazwa',
    'marker.description': 'Opis',
    'marker.category': 'Kategoria',
    'marker.standNumber': 'Numer Stoiska',
    'marker.position': 'Pozycja',
    'marker.size': 'Rozmiar',
    'marker.image': 'Zdjęcie',
    'marker.uploadImage': 'Wgraj Zdjęcie',
    'marker.dragResize': 'Przeciągnij aby przesunąć, uchwyty do zmiany rozmiaru',
    
    // Navigation
    'nav.addNode': 'Dodaj Węzeł Nawigacji',
    'nav.connectNodes': 'Połącz Węzły',
    'nav.deleteNode': 'Usuń Węzeł',
    'nav.instructions': 'Kliknij na mapie aby dodać węzły, przeciągnij aby połączyć',
    
    // Advertisements
    'ads.add': 'Dodaj Reklamę',
    'ads.duration': 'Czas trwania (sekundy)',
    'ads.active': 'Aktywna',
    'ads.inactive': 'Nieaktywna',
    'ads.inactivityTimeout': 'Czas nieaktywności (sekundy)',
    
    // Messages
    'msg.saved': 'Zapisano pomyślnie',
    'msg.deleted': 'Usunięto pomyślnie',
    'msg.error': 'Wystąpił błąd',
    'msg.fillRequired': 'Proszę wypełnić wszystkie wymagane pola',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  pl: 'Polski',
};
