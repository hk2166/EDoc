import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Phone, 
  AlertTriangle, 
  Heart,
  Brain,
  Pill
} from 'lucide-react';
import Button from '../components/common/Button';
import HospitalFinder from '../components/emergency/HospitalFinder';

const EmergencyPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Mock emergency numbers (in a real app, these would come from an API based on location)
  const emergencyNumbers = {
    emergency: '911',
    poison: '1-800-222-1222',
    mentalHealth: '988',
  };
  
  // Emergency warning signs
  const emergencySigns = [
    {
      icon: Heart,
      title: 'Chest Pain',
      description: 'Sudden chest pain or pressure, especially with shortness of breath'
    },
    {
      icon: Brain,
      title: 'Stroke Symptoms',
      description: 'Sudden numbness, confusion, difficulty speaking or walking'
    },
    {
      icon: Pill,
      title: 'Severe Allergic Reaction',
      description: 'Difficulty breathing, swelling, hives'
    }
  ];
  
  return (
    <div className="container-padding mx-auto max-w-4xl py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Emergency Banner */}
        <div className="bg-error-50 border border-error-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-error-500 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-error-700 mb-2">
                {t('emergency.title')}
              </h1>
              <p className="text-error-600 mb-4">
                If you are experiencing a medical emergency, immediately call your local emergency services or go to the nearest emergency room.
              </p>
              <Button
                variant="danger"
                size="large"
                icon={<Phone size={20} />}
                as="a"
                href={`tel:${emergencyNumbers.emergency}`}
              >
                {t('emergency.callEmergency')} ({emergencyNumbers.emergency})
              </Button>
            </div>
          </div>
        </div>
        
        {/* Emergency Warning Signs */}
        <section>
          <h2 className="text-xl font-medium text-neutral-800 mb-4">
            {t('emergency.emergencySigns')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencySigns.map((sign, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-neutral-200"
              >
                <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mb-4">
                  <sign.icon className="w-6 h-6 text-error-500" />
                </div>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {sign.title}
                </h3>
                <p className="text-neutral-600">
                  {sign.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Hospital Finder */}
        <section>
          <h2 className="text-xl font-medium text-neutral-800 mb-4">
            {t('emergency.nearestHospital')}
          </h2>
          <HospitalFinder />
        </section>
        
        {/* Additional Resources */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Poison Control */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-warning-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {t('emergency.poisonControl')}
                </h3>
                <p className="text-neutral-600 mb-3">
                  24/7 expert help for poisoning emergencies
                </p>
                <Button
                  variant="outline"
                  size="small"
                  as="a"
                  href={`tel:${emergencyNumbers.poison}`}
                  icon={<Phone size={14} />}
                >
                  {emergencyNumbers.poison}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Mental Health Crisis */}
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center mr-4">
                <Brain className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-800 mb-2">
                  {t('emergency.mentalHealthCrisis')}
                </h3>
                <p className="text-neutral-600 mb-3">
                  24/7 confidential support for mental health crises
                </p>
                <Button
                  variant="outline"
                  size="small"
                  as="a"
                  href={`tel:${emergencyNumbers.mentalHealth}`}
                  icon={<Phone size={14} />}
                >
                  {emergencyNumbers.mentalHealth}
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Disclaimer */}
        <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-warning-500 mr-3 flex-shrink-0 mt-1" />
            <p className="text-sm text-neutral-600">
              This information is for guidance only. If you are experiencing a medical emergency, immediately call your local emergency services or go to the nearest emergency room.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyPage;