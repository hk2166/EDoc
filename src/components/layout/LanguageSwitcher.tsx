import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useAppSettings } from '../../contexts/AppSettingsContext';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'full';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'minimal' 
}) => {
  const { i18n } = useTranslation();
  const { updateSettings } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];
  
  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    updateSettings({ language: langCode });
    setIsOpen(false);
  };
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="flex items-center justify-center p-2 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Change language"
        >
          <Globe className="w-5 h-5 text-neutral-600" />
        </button>
        
        <LanguageDropdown
          isOpen={isOpen}
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  }
  
  return (
    <div className="relative w-full">
      <button
        onClick={toggleMenu}
        className="flex items-center justify-between w-full p-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
        aria-label="Change language"
      >
        <div className="flex items-center">
          <span className="mr-2">{currentLanguage.flag}</span>
          <span>{currentLanguage.name}</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-neutral-600 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </button>
      
      <LanguageDropdown
        isOpen={isOpen}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        onClose={() => setIsOpen(false)}
        fullWidth
      />
    </div>
  );
};

interface LanguageDropdownProps {
  isOpen: boolean;
  currentLanguage: { code: string; name: string; flag: string };
  onLanguageChange: (code: string) => void;
  onClose: () => void;
  fullWidth?: boolean;
}

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  isOpen,
  currentLanguage,
  onLanguageChange,
  onClose,
  fullWidth
}) => {
  // Close when clicking outside
  React.useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (!(e.target as Element).closest('.language-dropdown')) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -5, 
      scale: 0.95,
      transition: { duration: 0.1 } 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 } 
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      scale: 0.95,
      transition: { duration: 0.1 } 
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          className={`language-dropdown absolute z-50 mt-2 bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200 ${
            fullWidth ? 'w-full' : 'min-w-[180px] right-0'
          }`}
        >
          <div className="py-1">
            {LANGUAGES.map(language => (
              <button
                key={language.code}
                onClick={() => onLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-neutral-50 ${
                  language.code === currentLanguage.code ? 'bg-primary-50' : ''
                }`}
              >
                <span>{language.flag}</span>
                <span className="flex-grow">{language.name}</span>
                {language.code === currentLanguage.code && (
                  <Check className="w-4 h-4 text-primary-500" />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageSwitcher;