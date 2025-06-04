import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, FileText, ExternalLink } from 'lucide-react';
import Button from '../components/common/Button';

const DisclaimerPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container-padding mx-auto max-w-3xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-4">
            {t('disclaimer.title')}
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Please read this important information about the use of our medical diagnostic application
          </p>
        </div>
        
        {/* Main disclaimer */}
        <div className="bg-warning-50 rounded-xl p-6 border border-warning-200">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-warning-500 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-medium text-warning-800 mb-2">
                Not a Substitute for Professional Medical Care
              </h2>
              <p className="text-warning-700">
                {t('disclaimer.notMedicalAdvice')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Key points */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">
              Important Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Medical Emergency
                  </h3>
                  <p className="text-neutral-600">
                    {t('disclaimer.emergencyWarning')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Information Only
                  </h3>
                  <p className="text-neutral-600">
                    {t('disclaimer.informationOnly')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-primary-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">
                    Privacy & Security
                  </h3>
                  <p className="text-neutral-600">
                    {t('disclaimer.privacyStatement')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional information */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">
              Additional Resources
            </h2>
            
            <div className="space-y-3">
              <a 
                href="https://www.who.int" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <ExternalLink className="w-5 h-5 text-neutral-500 mr-3" />
                  <span>World Health Organization</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </a>
              
              <a 
                href="https://www.cdc.gov" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center">
                  <ExternalLink className="w-5 h-5 text-neutral-500 mr-3" />
                  <span>Centers for Disease Control and Prevention</span>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Agreement section */}
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 text-center">
          <p className="text-neutral-600 mb-4">
            By using this application, you acknowledge that you have read, understood, and agree to these terms and disclaimers.
          </p>
          
          <Button
            variant="primary"
            onClick={() => window.history.back()}
          >
            I Understand
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DisclaimerPage;