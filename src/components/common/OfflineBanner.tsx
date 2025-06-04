import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setIsVisible(true);
      // Hide the online notification after a delay
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setIsVisible(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const variants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
          className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium ${
            isOffline 
              ? 'bg-warning-100 text-warning-800' 
              : 'bg-success-100 text-success-800'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isOffline ? (
              <>
                <WifiOff size={18} />
                <span>{t('common.offlineMessage')}</span>
              </>
            ) : (
              <>
                <Wifi size={18} />
                <span>You're back online!</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;