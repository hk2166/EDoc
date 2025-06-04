import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Camera, 
  Mic, 
  Stethoscope, 
  History, 
  Clock, 
  AlertTriangle, 
  MapPin 
} from 'lucide-react';
import Button from '../components/common/Button';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  color: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, onClick, color }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${color} rounded-xl p-6 cursor-pointer border border-neutral-200 hover:border-primary-300 transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center mr-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-neutral-800">{title}</h3>
      </div>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Mock recent sessions for demonstration
  const recentSessions = [
    { id: '1', date: '2023-09-15', condition: 'Respiratory Infection', status: 'Resolved' },
    { id: '2', date: '2023-10-02', condition: 'Allergic Reaction', status: 'Active' },
  ];
  
  return (
    <div className="container-padding mx-auto max-w-5xl pb-12">
      {/* Hero section */}
      <section className="py-12 sm:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gradient primary-gradient">
            {t('app.name')}
          </h1>
          <p className="text-xl sm:text-2xl text-neutral-600 max-w-2xl mx-auto">
            {t('app.tagline')}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 sm:mt-12"
        >
          <Button
            variant="primary"
            size="large"
            icon={<Stethoscope size={20} />}
            onClick={() => navigate('/diagnosis')}
            className="shadow-lg hover:shadow-xl"
          >
            {t('home.startDiagnosis')}
          </Button>
        </motion.div>
      </section>
      
      {/* Main action cards */}
      <section className="mb-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Symptom Check */}
          <ActionCard
            icon={<Search size={24} className="text-primary-500" />}
            title={t('home.symptoms')}
            onClick={() => navigate('/diagnosis?type=text')}
            color="bg-gradient-to-br from-primary-50 to-neutral-50"
          />
          
          {/* Camera Diagnosis */}
          <ActionCard
            icon={<Camera size={24} className="text-secondary-500" />}
            title={t('home.camera')}
            onClick={() => navigate('/diagnosis?type=image')}
            color="bg-gradient-to-br from-secondary-50 to-neutral-50"
          />
          
          {/* Voice Recording */}
          <ActionCard
            icon={<Mic size={24} className="text-accent-500" />}
            title={t('home.voice')}
            onClick={() => navigate('/diagnosis?type=audio')}
            color="bg-gradient-to-br from-accent-50 to-neutral-50"
          />
        </motion.div>
      </section>
      
      {/* Recent sessions */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-neutral-800">{t('home.recentSessions')}</h2>
          <Button
            variant="outline"
            size="small"
            icon={<History size={14} />}
            onClick={() => navigate('/history')}
          >
            {t('home.viewHistory')}
          </Button>
        </div>
        
        {recentSessions.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {recentSessions.map(session => (
              <motion.div
                key={session.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-lg shadow-sm p-4 border border-neutral-200 cursor-pointer"
                onClick={() => navigate(`/results/${session.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-800">{session.condition}</h3>
                    <div className="flex items-center text-sm text-neutral-500">
                      <Clock size={14} className="mr-1" />
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`text-sm px-2 py-0.5 rounded-full ${
                    session.status === 'Resolved'
                      ? 'bg-success-100 text-success-700'
                      : 'bg-warning-100 text-warning-700'
                  }`}>
                    {session.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="bg-neutral-50 rounded-lg p-6 text-center border border-neutral-200"
          >
            <p className="text-neutral-600 mb-4">No diagnostic sessions yet</p>
            <Button
              variant="primary"
              onClick={() => navigate('/diagnosis')}
              icon={<Stethoscope size={16} />}
            >
              {t('home.newDiagnosis')}
            </Button>
          </motion.div>
        )}
      </section>
      
      {/* Additional resources */}
      <section>
        <h2 className="text-xl font-medium text-neutral-800 mb-4">{t('emergency.title')}</h2>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Emergency Resources */}
          <motion.div
            variants={itemVariants}
            className="bg-error-50 rounded-lg p-6 border border-error-100"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-8 h-8 text-error-500 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-error-700 text-lg mb-2">
                  {t('emergency.title')}
                </h3>
                <p className="text-error-600 mb-4">
                  {t('diagnosis.emergencyWarning')}
                </p>
                <Button
                  variant="danger"
                  onClick={() => navigate('/emergency')}
                >
                  {t('emergency.findHelp')}
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Find Clinic */}
          <motion.div
            variants={itemVariants}
            className="bg-neutral-50 rounded-lg p-6 border border-neutral-200"
          >
            <div className="flex items-start">
              <MapPin className="w-8 h-8 text-primary-500 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-neutral-800 text-lg mb-2">
                  {t('home.nearbyClinic')}
                </h3>
                <p className="text-neutral-600 mb-4">
                  Find healthcare providers in your area
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/emergency')}
                >
                  {t('emergency.findHelp')}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;