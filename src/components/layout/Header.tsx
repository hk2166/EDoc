import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Menu, X, Settings, User, Heart } from 'lucide-react';
import Button from '../common/Button';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location]);
  
  const isHomePage = location.pathname === '/';
  
  const headerClass = `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    isScrolled || !isHomePage
      ? 'bg-white shadow-md py-2' 
      : 'bg-transparent py-4'
  }`;
  
  return (
    <header className={headerClass}>
      <div className="container-padding mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Heart className="w-8 h-8 text-primary-500" />
            <span className={`ml-2 text-xl font-display font-bold ${isScrolled || !isHomePage ? 'text-primary-700' : 'text-primary-600'}`}>
              {t('app.name')}
            </span>
          </motion.div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <NavLink to="/dashboard" label={t('home.startDiagnosis')} />
            <NavLink to="/history" label={t('home.viewHistory')} />
            <NavLink to="/emergency" label={t('emergency.title')} />
          </nav>
          
          <div className="flex items-center space-x-2">
            <LanguageSwitcher variant="minimal" />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSettings}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              aria-label={t('common.settings')}
            >
              <Settings className="w-5 h-5 text-neutral-600" />
            </motion.button>
            
            <Button 
              variant="primary" 
              size="small" 
              as={Link}
              to="/profile"
              icon={<User size={16} />}
            >
              {t('profile.title')}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-neutral-700" />
          ) : (
            <Menu className="w-6 h-6 text-neutral-700" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0,
          height: mobileMenuOpen ? 'auto' : 0
        }}
        className="md:hidden overflow-hidden bg-white"
      >
        <nav className="container-padding py-4 flex flex-col space-y-4">
          <MobileNavLink to="/dashboard" label={t('home.startDiagnosis')} />
          <MobileNavLink to="/history" label={t('home.viewHistory')} />
          <MobileNavLink to="/emergency" label={t('emergency.title')} />
          <MobileNavLink to="/profile" label={t('profile.title')} />
          
          <div className="pt-4 border-t border-neutral-200">
            <LanguageSwitcher variant="full" />
          </div>
          
          <Button
            variant="outline"
            onClick={onOpenSettings}
            icon={<Settings size={16} />}
            className="mt-2"
            fullWidth
          >
            {t('common.settings')}
          </Button>
        </nav>
      </motion.div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors relative ${
        isActive 
          ? 'text-primary-600' 
          : 'text-neutral-600 hover:text-neutral-900'
      }`}
    >
      {label}
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink: React.FC<NavLinkProps> = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`py-2 px-3 text-base font-medium rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary-50 text-primary-600' 
          : 'text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {label}
    </Link>
  );
};

export default Header;