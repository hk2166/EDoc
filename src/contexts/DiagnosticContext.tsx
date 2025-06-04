import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DiagnosticSession, 
  DiagnosticResult, 
  Symptom,
  DiagnosticImage,
  AudioRecording
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { saveDiagnosticSession, getDiagnosticSession, saveDiagnosticResult, getDiagnosticResult } from '../services/storage';
import { useMockLLMService } from '../services/api';
import localforage from 'localforage';
import { Heart } from 'lucide-react';
import { useAppSettings } from './AppSettingsContext';

interface DiagnosticContextType {
  currentSession: DiagnosticSession | null;
  currentResult: DiagnosticResult | null;
  isAnalyzing: boolean;
  error: string | null;
  isStorageReady: boolean;
  createNewSession: (userId: string, language: string) => DiagnosticSession;
  addSymptom: (symptom: Omit<Symptom, 'id'>) => void;
  removeSymptom: (symptomId: string) => void;
  addDiagnosticImage: (dataUrl: string, type: string, bodyLocation?: string) => void;
  removeDiagnosticImage: (imageId: string) => void;
  addAudioRecording: (blob: Blob, url: string, type: string, duration: number) => void;
  removeAudioRecording: (recordingId: string) => void;
  setTextDescription: (description: string) => void;
  analyzeDiagnosticData: () => Promise<DiagnosticResult>;
  loadSession: (sessionId: string) => Promise<void>;
  loadResult: (sessionId: string) => Promise<void>;
  resetSession: () => void;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export const useDiagnostic = (): DiagnosticContextType => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
};

export const DiagnosticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<DiagnosticSession | null>(null);
  const [currentResult, setCurrentResult] = useState<DiagnosticResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const { isStorageReady: appSettingsStorageReady } = useAppSettings();

  // Use the mock service for now
  const mockLLMService = useMockLLMService();

  // Initialize storage
  useEffect(() => {
    const initStorage = async () => {
      try {
        await localforage.ready();
        console.log('DiagnosticContext: LocalForage initialized successfully');
        setIsStorageReady(true);
      } catch (error) {
        console.error('DiagnosticContext: Failed to initialize LocalForage:', error);
        setError('Failed to initialize storage. Some features may not work properly.');
        setIsStorageReady(false);
      }
    };

    initStorage();
  }, []);

  const createNewSession = (userId: string, language: string): DiagnosticSession => {
    if (!isStorageReady) {
      console.warn('Storage not ready, session creation skipped');
      throw new Error('Storage not ready');
    }

    try {
      const newSession: DiagnosticSession = {
        id: uuidv4(),
        userId,
        symptoms: [],
        timestamp: new Date().toISOString(),
        language
      };
      
      setCurrentSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Failed to create new session:', error);
      setError('Failed to create new diagnostic session');
      throw error;
    }
  };

  const addSymptom = (symptom: Omit<Symptom, 'id'>) => {
    if (!currentSession || !isStorageReady) return;
    
    try {
      const newSymptom: Symptom = {
        ...symptom,
        id: uuidv4()
      };
      
      const updatedSession = {
        ...currentSession,
        symptoms: [...currentSession.symptoms, newSymptom]
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to save symptom. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to add symptom:', error);
      setError('Failed to add symptom');
    }
  };

  const removeSymptom = (symptomId: string) => {
    if (!currentSession || !isStorageReady) return;
    
    try {
      const updatedSession = {
        ...currentSession,
        symptoms: currentSession.symptoms.filter(symptom => symptom.id !== symptomId)
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to remove symptom. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to remove symptom:', error);
      setError('Failed to remove symptom');
    }
  };

  const addDiagnosticImage = (dataUrl: string, type: string, bodyLocation?: string) => {
    if (!currentSession || !isStorageReady) return;
    
    try {
      const newImage: DiagnosticImage = {
        id: uuidv4(),
        dataUrl,
        type: type as "skin" | "eye" | "wound" | "other",
        bodyLocation,
        timestamp: new Date().toISOString()
      };
      
      const images = currentSession.images || [];
      
      const updatedSession = {
        ...currentSession,
        images: [...images, newImage]
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to save image. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to add image:', error);
      setError('Failed to add image');
    }
  };

  const removeDiagnosticImage = (imageId: string) => {
    if (!currentSession || !currentSession.images || !isStorageReady) return;
    
    try {
      const updatedSession = {
        ...currentSession,
        images: currentSession.images.filter(image => image.id !== imageId)
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to remove image. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to remove image:', error);
      setError('Failed to remove image');
    }
  };

  const addAudioRecording = (blob: Blob, url: string, type: string, duration: number) => {
    if (!currentSession || !isStorageReady) return;
    
    try {
      const newRecording: AudioRecording = {
        id: uuidv4(),
        blob,
        url,
        type: type as "cough" | "breathing" | "voice" | "other",
        duration,
        timestamp: new Date().toISOString()
      };
      
      const recordings = currentSession.audioRecordings || [];
      
      const updatedSession = {
        ...currentSession,
        audioRecordings: [...recordings, newRecording]
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to save audio recording. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to add audio recording:', error);
      setError('Failed to add audio recording');
    }
  };

  const removeAudioRecording = (recordingId: string) => {
    if (!currentSession || !currentSession.audioRecordings || !isStorageReady) return;
    
    try {
      const updatedSession = {
        ...currentSession,
        audioRecordings: currentSession.audioRecordings.filter(
          recording => recording.id !== recordingId
        )
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to remove audio recording. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to remove audio recording:', error);
      setError('Failed to remove audio recording');
    }
  };

  const setTextDescription = (description: string) => {
    if (!currentSession || !isStorageReady) return;
    
    try {
      const updatedSession = {
        ...currentSession,
        textDescription: description
      };
      
      setCurrentSession(updatedSession);
      saveDiagnosticSession(updatedSession).catch(error => {
        console.error('Failed to save session:', error);
        setError('Failed to save text description. Changes may not persist.');
      });
    } catch (error) {
      console.error('Failed to set text description:', error);
      setError('Failed to set text description');
    }
  };

  const analyzeDiagnosticData = async (): Promise<DiagnosticResult> => {
    if (!currentSession || !isStorageReady) {
      throw new Error('No active session or storage not ready');
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      const result = await mockLLMService.analyzeDiagnosticData(currentSession);
      setCurrentResult(result);
      
      await saveDiagnosticResult(result);
      return result;
    } catch (error) {
      console.error('Failed to analyze diagnostic data:', error);
      setError('Failed to analyze diagnostic data');
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!isStorageReady) {
      throw new Error('Storage not ready');
    }

    try {
      const session = await getDiagnosticSession(sessionId);
      if (session) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setError('Failed to load session');
      throw error;
    }
  };

  const loadResult = async (sessionId: string) => {
    if (!isStorageReady) {
      throw new Error('Storage not ready');
    }

    try {
      const result = await getDiagnosticResult(sessionId);
      if (result) {
        setCurrentResult(result);
      }
    } catch (error) {
      console.error('Failed to load result:', error);
      setError('Failed to load result');
      throw error;
    }
  };

  const resetSession = () => {
    setCurrentSession(null);
    setCurrentResult(null);
    setError(null);
  };

  // Show loading state while storage is initializing
  if (!isStorageReady || !appSettingsStorageReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg text-neutral-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <DiagnosticContext.Provider
      value={{
        currentSession,
        currentResult,
        isAnalyzing,
        error,
        isStorageReady,
        createNewSession,
        addSymptom,
        removeSymptom,
        addDiagnosticImage,
        removeDiagnosticImage,
        addAudioRecording,
        removeAudioRecording,
        setTextDescription,
        analyzeDiagnosticData,
        loadSession,
        loadResult,
        resetSession
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};