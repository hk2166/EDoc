import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Camera, 
  Mic, 
  MessageSquare, 
  AlertTriangle,
  ChevronRight,
  Check,
  Heart
} from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SymptomInput from '../components/diagnosis/SymptomInput';
import ImageCapture from '../components/diagnosis/ImageCapture';
import AudioRecorder from '../components/diagnosis/AudioRecorder';
import TextInput from '../components/diagnosis/TextInput';
import { useDiagnostic } from '../contexts/DiagnosticContext';
import { useAppSettings } from '../contexts/AppSettingsContext';

enum DiagnosisStep {
  SELECT,
  TEXT,
  IMAGE,
  AUDIO,
  REVIEW,
  PROCESSING
}

const DiagnosisPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    createNewSession,
    currentSession, 
    addSymptom, 
    removeSymptom, 
    addDiagnosticImage, 
    addAudioRecording,
    setTextDescription,
    analyzeDiagnosticData,
    isAnalyzing,
    isStorageReady: _diagnosticStorageReady = false
  } = useDiagnostic();
  const { settings, isStorageReady: _appSettingsStorageReady = false } = useAppSettings();
  const diagnosticStorageReady = !!_diagnosticStorageReady;
  const appSettingsStorageReady = !!_appSettingsStorageReady;
  
  const [currentStep, setCurrentStep] = useState<DiagnosisStep>(DiagnosisStep.SELECT);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize session if needed
  useEffect(() => {
    if (!currentSession && diagnosticStorageReady && appSettingsStorageReady) {
      try {
        // For demo purposes, using a hard-coded user ID
        // In a real app, this would come from authentication
        createNewSession('user-123', settings.language);
      } catch (error) {
        console.error('Failed to create new session:', error);
        setError('Failed to initialize diagnostic session. Please try again.');
      }
    }
  }, [currentSession, createNewSession, settings.language, diagnosticStorageReady, appSettingsStorageReady]);
  
  // Check for type param to auto-select input method
  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      switch (type) {
        case 'text':
          setCurrentStep(DiagnosisStep.TEXT);
          break;
        case 'image':
          setCurrentStep(DiagnosisStep.IMAGE);
          break;
        case 'audio':
          setCurrentStep(DiagnosisStep.AUDIO);
          break;
        default:
          setCurrentStep(DiagnosisStep.SELECT);
          break;
      }
    }
  }, [searchParams]);
  
  // Handling text input submission
  const handleTextSubmit = (text: string) => {
    if (!currentSession) return;
    
    setTextDescription(text);
    setCurrentStep(DiagnosisStep.REVIEW);
  };
  
  // Handling image capture
  const handleImageCapture = (dataUrl: string, type: string, bodyLocation?: string) => {
    if (!currentSession) return;
    
    addDiagnosticImage(dataUrl, type, bodyLocation);
    setCurrentStep(DiagnosisStep.REVIEW);
  };
  
  // Handling audio recording
  const handleAudioRecorded = (blob: Blob, url: string, type: string, duration: number) => {
    if (!currentSession) return;
    
    addAudioRecording(blob, url, type, duration);
    setCurrentStep(DiagnosisStep.REVIEW);
  };
  
  // Process diagnostic data and navigate to results
  const handleProcessDiagnostic = async () => {
    if (!currentSession) return;
    
    try {
      setCurrentStep(DiagnosisStep.PROCESSING);
      setError(null);
      
      const result = await analyzeDiagnosticData();
      navigate(`/results/${result.sessionId}`);
      
    } catch (error) {
      console.error('Error processing diagnostic data:', error);
      setError('Failed to process your diagnostic information. Please try again.');
      setCurrentStep(DiagnosisStep.REVIEW);
    }
  };
  
  // Determine if we have enough data to proceed
  const canProceedToReview = (): boolean => {
    if (!currentSession) return false;
    
    return (
      currentSession.symptoms.length > 0 ||
      (currentSession.textDescription && currentSession.textDescription.length > 10) ||
      (currentSession.images && currentSession.images.length > 0) ||
      (currentSession.audioRecordings && currentSession.audioRecordings.length > 0)
    );
  };

  // Show loading state while storage is initializing
  if (!Boolean(diagnosticStorageReady) || !Boolean(appSettingsStorageReady)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-neutral-600">Initializing...</p>
        </div>
      </div>
    );
  }
  
  // Render current step content
  const renderStepContent = () => {
    if (!currentSession) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="medium" />
        </div>
      );
    }
    
    switch (currentStep) {
      case DiagnosisStep.SELECT:
        return (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('diagnosis.selectType')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <DiagnosisTypeCard 
                icon={<MessageSquare size={32} className="text-primary-500" />}
                title={t('diagnosis.textInput.title')}
                description="Describe your symptoms in text"
                onClick={() => setCurrentStep(DiagnosisStep.TEXT)}
                className="bg-gradient-to-br from-primary-50 to-white border-primary-200"
              />
              
              <DiagnosisTypeCard 
                icon={<Camera size={32} className="text-secondary-500" />}
                title={t('diagnosis.imageCapture.title')}
                description="Take or upload medical images"
                onClick={() => setCurrentStep(DiagnosisStep.IMAGE)}
                className="bg-gradient-to-br from-secondary-50 to-white border-secondary-200"
              />
              
              <DiagnosisTypeCard 
                icon={<Mic size={32} className="text-accent-500" />}
                title={t('diagnosis.audioCapture.title')}
                description="Record cough or breathing"
                onClick={() => setCurrentStep(DiagnosisStep.AUDIO)}
                className="bg-gradient-to-br from-accent-50 to-white border-accent-200"
              />
            </div>
            
            {/* Symptom input always available */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <h3 className="text-lg font-medium mb-4">
                {t('diagnosis.symptomsQuestion')}
              </h3>
              
              <SymptomInput
                symptoms={currentSession.symptoms}
                onAddSymptom={addSymptom}
                onRemoveSymptom={removeSymptom}
              />
              
              {currentSession.symptoms.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={() => setCurrentStep(DiagnosisStep.REVIEW)}
                    icon={<ChevronRight size={16} />}
                    iconPosition="right"
                  >
                    {t('common.continue')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
        
      case DiagnosisStep.TEXT:
        return (
          <div className="max-w-xl mx-auto">
            <TextInput
              initialValue={currentSession.textDescription}
              onSubmit={handleTextSubmit}
              onCancel={() => setCurrentStep(DiagnosisStep.SELECT)}
            />
          </div>
        );
        
      case DiagnosisStep.IMAGE:
        return (
          <div className="max-w-xl mx-auto">
            <ImageCapture
              onImageCapture={handleImageCapture}
              onCancel={() => setCurrentStep(DiagnosisStep.SELECT)}
            />
          </div>
        );
        
      case DiagnosisStep.AUDIO:
        return (
          <div className="max-w-xl mx-auto">
            <AudioRecorder
              onAudioRecorded={handleAudioRecorded}
              onCancel={() => setCurrentStep(DiagnosisStep.SELECT)}
            />
          </div>
        );
        
      case DiagnosisStep.REVIEW:
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Review Your Information
            </h2>
            
            {error && (
              <div className="mb-6 p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-center">
                <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 mb-6">
              {/* Symptoms summary */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Symptoms</h3>
                {currentSession.symptoms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentSession.symptoms.map((symptom) => (
                      <div
                        key={symptom.id}
                        className="inline-flex items-center py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm"
                      >
                        <span>{symptom.name}</span>
                        <span className="mx-1 text-neutral-400">•</span>
                        <span>{t(`diagnosis.severity.${symptom.severity}`)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500">No symptoms specified</p>
                )}
              </div>
              
              {/* Text description */}
              {currentSession.textDescription && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Description</h3>
                  <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <p className="text-neutral-700">{currentSession.textDescription}</p>
                  </div>
                </div>
              )}
              
              {/* Images */}
              {currentSession.images && currentSession.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentSession.images.map((image) => (
                      <div key={image.id} className="relative rounded-lg overflow-hidden border border-neutral-200">
                        <img 
                          src={image.dataUrl} 
                          alt="Diagnostic" 
                          className="aspect-square object-cover w-full h-full" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                          {image.type} {image.bodyLocation ? `- ${image.bodyLocation}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Audio recordings */}
              {currentSession.audioRecordings && currentSession.audioRecordings.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Audio Recordings</h3>
                  <div className="space-y-3">
                    {currentSession.audioRecordings.map((recording) => (
                      <div key={recording.id} className="p-3 rounded-lg border border-neutral-200 bg-neutral-50">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                              <Mic size={20} className="text-secondary-500" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-700">
                              {recording.type.charAt(0).toUpperCase() + recording.type.slice(1)} Recording
                            </p>
                            <p className="text-xs text-neutral-500">
                              {recording.duration} seconds
                            </p>
                          </div>
                          <audio controls className="w-32 h-8">
                            <source src={recording.url} type="audio/wav" />
                          </audio>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Disclaimer */}
            <div className="p-4 rounded-lg bg-neutral-100 border border-neutral-200 mb-6 text-sm text-neutral-600 flex items-start">
              <AlertTriangle size={18} className="text-warning-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  {t('disclaimer.title')}
                </p>
                <p>
                  {t('disclaimer.notMedicalAdvice')} {t('disclaimer.consultDoctor')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(DiagnosisStep.SELECT)}
                icon={<ChevronLeft size={16} />}
                iconPosition="left"
              >
                {t('common.back')}
              </Button>
              
              <Button
                variant="primary"
                onClick={handleProcessDiagnostic}
                icon={<Check size={16} />}
                iconPosition="right"
                disabled={!canProceedToReview() || isAnalyzing}
              >
                {t('diagnosis.viewResults')}
              </Button>
            </div>
          </div>
        );
        
      case DiagnosisStep.PROCESSING:
        return (
          <div className="max-w-xl mx-auto text-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-lg text-neutral-600">
              Analyzing your information...
            </p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {currentStep !== DiagnosisStep.SELECT && (
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(DiagnosisStep.SELECT)}
          className="mb-6"
          icon={<ChevronLeft size={16} />}
        >
          {t('common.back')}
        </Button>
      )}
      
      {renderStepContent()}
    </div>
  );
};

interface DiagnosisTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const DiagnosisTypeCard: React.FC<DiagnosisTypeCardProps> = ({ 
  icon, 
  title, 
  description,
  onClick, 
  className = '' 
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-neutral-600">{description}</p>
      </div>
    </motion.button>
  );
};

export default DiagnosisPage;