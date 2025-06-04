import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Heart, Shield, HelpCircle, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container-padding mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* App Info */}
          <div>
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-primary-500" />
              <h3 className="ml-2 text-xl font-bold">{t('app.name')}</h3>
            </div>
            <p className="text-neutral-600 mb-4">
              {t('app.description')}
            </p>
            <p className="text-sm text-neutral-500">
              &copy; {currentYear} {t('app.name')}. {t('disclaimer.notMedicalAdvice')}
            </p>
          </div>
          
          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-base font-medium text-neutral-800">Resources</h4>
            <ul className="space-y-2">
              <FooterLink to="/emergency" label={t('emergency.title')} />
              <FooterLink to="/disclaimer" label={t('common.disclaimer')} />
              <FooterLink to="/settings" label={t('common.settings')} />
              <FooterLink to="/help" label={t('settings.helpSupport')} />
            </ul>
          </div>
          
          {/* Security & Privacy */}
          <div className="space-y-4">
            <h4 className="text-base font-medium text-neutral-800">{t('common.privacy')}</h4>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-neutral-600">
                  {t('disclaimer.privacyStatement')}
                </p>
              </div>
              <ul className="space-y-2 mt-4">
                <FooterLink to="/privacy" label={t('settings.privacyPolicy')} />
                <FooterLink to="/terms" label={t('settings.termsOfService')} />
                <FooterExternalLink 
                  href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public"
                  label="WHO Health Guidelines"
                />
                <FooterExternalLink 
                  href="https://www.cdc.gov/DiseasesConditions/"
                  label="CDC Disease Information"
                />
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Links */}
        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-600">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link 
              to="/about" 
              className="hover:text-primary-500 transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="hover:text-primary-500 transition-colors"
            >
              Contact
            </Link>
            <Link 
              to="/accessibility" 
              className="hover:text-primary-500 transition-colors"
            >
              Accessibility
            </Link>
            <Link 
              to="/sitemap" 
              className="hover:text-primary-500 transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, label }) => (
  <li>
    <Link 
      to={to}
      className="text-sm text-neutral-600 hover:text-primary-500 transition-colors inline-flex items-center"
    >
      {label}
    </Link>
  </li>
);

interface FooterExternalLinkProps {
  href: string;
  label: string;
}

const FooterExternalLink: React.FC<FooterExternalLinkProps> = ({ href, label }) => (
  <li>
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-neutral-600 hover:text-primary-500 transition-colors inline-flex items-center"
    >
      {label}
      <ExternalLink size={14} className="ml-1" />
    </a>
  </li>
);

export default Footer;