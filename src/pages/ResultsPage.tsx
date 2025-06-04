import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  ChevronLeft, 
  Share2, 
  Printer, 
  Heart,
  UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDiagnostic } from '../contexts/DiagnosticContext';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DiagnosticResultCard from '../components/results/DiagnosticResultCard';
import TreatmentOptions from '../components/results/TreatmentOptions';
import NearbyFacilitiesMap from '../components/results/NearbyFacilitiesMap';

const ResultsPage: React.FC = () => {
  const { t } = useTranslation();
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const { 
    currentSession, 
    currentResult, 
    isAnalyzing,
    loadSession,
    loadResult
  } = useDiagnostic();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (sessionId) {
        try {
          setLoading(true);
          setError(null);
          
          await loadSession(sessionId);
          await loadResult(sessionId);
          
        } catch (error) {
          console.error('Error loading diagnostic data:', error);
          setError('Failed to load diagnostic results. Please try again.');
        } finally {
          setLoading(false);
        }
      } else if (!currentResult) {
        // No session ID and no current result means we shouldn't be here
        navigate('/diagnosis');
      }
    };
    
    fetchData();
  }, [sessionId, loadSession, loadResult, currentResult, navigate]);
  
  if (loading || isAnalyzing) {
    return (
      <div className="container-padding mx-auto max-w-4xl py-12">
        <div className="text-center py-16">
          <LoadingSpinner size="large\" label={t('diagnosis.processing')} />
          <p className="text-neutral-600 mt-6">
            Our AI is analyzing your symptoms and data...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container-padding mx-auto max-w-4xl py-12">
        <div className="text-center py-16">
          <div className="mb-6 text-error-500">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-medium text-neutral-800 mb-4">
            {t('common.errorMessage')}
          </h2>
          <p className="text-neutral-600 mb-6">
            {error}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/diagnosis')}
          >
            {t('home.startDiagnosis')}
          </Button>
        </div>
      </div>
    );
  }
  
  if (!currentResult) {
    return (
      <div className="container-padding mx-auto max-w-4xl py-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-medium text-neutral-800 mb-4">
            No diagnostic results available
          </h2>
          <p className="text-neutral-600 mb-6">
            Please complete a diagnostic session first.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/diagnosis')}
          >
            {t('home.startDiagnosis')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Determine if this is an emergency
  const isEmergency = currentResult.severity === 'emergency' || currentResult.severity === 'high';
  
  // Get nearby facilities from recommended actions
  const nearbyFacilities = currentResult.recommendedActions
    .filter(action => action.nearbyOptions && action.nearbyOptions.length > 0)
    .flatMap(action => action.nearbyOptions || []);
  
  return (
    <div className="container-padding mx-auto max-w-4xl pb-12">
      <div className="mt-6 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-neutral-600 hover:text-neutral-800 inline-flex items-center"
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>{t('common.back')}</span>
        </button>
      </div>
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`rounded-xl p-6 mb-6 ${
          isEmergency 
            ? 'bg-error-50 border border-error-100' 
            : 'bg-neutral-50 border border-neutral-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-neutral-800">
              {t('results.title')}
            </h1>
            <p className="text-neutral-600">
              {t('results.analyzedAt')}: {new Date(currentResult.timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button
              variant="outline"
              size="small"
              icon={<Share2 size={16} />}
            >
              {t('common.share')}
            </Button>
            
            <Button
              variant="outline"
              size="small"
              icon={<Printer size={16} />}
            >
              {t('results.sharePDF')}
            </Button>
          </div>
        </div>
        
        {/* Emergency banner */}
        {isEmergency && (
          <div className="mt-4 p-3 bg-error-100 border border-error-200 rounded-lg flex items-center">
            <AlertTriangle size={24} className="text-error-500 mr-2 flex-shrink-0" />
            <div>
              <p className="font-bold text-error-700">
                {t('results.emergencyNotice')}
              </p>
              <p className="text-sm text-error-600">
                {currentResult.severity === 'emergency' ? 
                  'This condition requires immediate medical attention. Please go to the nearest emergency room or call emergency services.' :
                  'This condition requires prompt medical attention. Please contact a healthcare provider as soon as possible.'
                }
              </p>
            </div>
          </div>
        )}
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Possible Conditions */}
          <section>
            <h2 className="text-xl font-medium text-neutral-800 mb-4">
              {t('results.possibleConditions')}
            </h2>
            
            <div className="space-y-4">
              {currentResult.conditions.map((condition, index) => (
                <DiagnosticResultCard
                  key={index}
                  condition={condition}
                  recommendedActions={currentResult.recommendedActions.filter(a => 
                    a.type === 'medication' || a.type === 'specialist' || a.type === 'test'
                  )}
                  severityLevel={currentResult.severity}
                />
              ))}
            </div>
          </section>
          
          {/* Treatment Options */}
          <section>
            <TreatmentOptions actions={currentResult.recommendedActions} />
          </section>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Summary card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200 p-4 sm:p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-3">
                <UserIcon size={24} className="text-primary-500" />
              </div>
              <h3 className="text-lg font-medium">Diagnostic Summary</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-neutral-500 mb-1">Confidence level</div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: `${Math.round(currentResult.confidence * 100)}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-neutral-600 mt-1">
                  {Math.round(currentResult.confidence * 100)}%
                </div>
              </div>
              
              <div>
                <div className="text-sm text-neutral-500 mb-1">Severity</div>
                <div className={`text-sm px-3 py-1 rounded-full text-center font-medium ${
                  currentResult.severity === 'emergency' || currentResult.severity === 'high' 
                    ? 'bg-error-100 text-error-700'
                    : currentResult.severity === 'medium'
                      ? 'bg-warning-100 text-warning-700'
                      : 'bg-success-100 text-success-700'
                }`}>
                  {t(`results.severity.${currentResult.severity}`)}
                </div>
              </div>
              
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <p className="text-sm text-neutral-600 italic">
                  {currentResult.disclaimer}
                </p>
              </div>
            </div>
          </div>
          
          {/* Nearby Facilities */}
          {nearbyFacilities.length > 0 && (
            <NearbyFacilitiesMap facilities={nearbyFacilities} />
          )}
          
          {/* Health tips */}
          <div className="bg-accent-50 rounded-xl overflow-hidden border border-accent-100 p-4 sm:p-6">
            <div className="flex items-start">
              <Heart className="w-6 h-6 text-accent-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-accent-700 mb-2">
                  Health Tips
                </h3>
                <ul className="space-y-2 text-sm text-accent-800">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Drink plenty of fluids to stay hydrated</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Get adequate rest to help your body recover</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Monitor your symptoms and seek medical care if they worsen</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;