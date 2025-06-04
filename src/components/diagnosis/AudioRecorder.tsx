import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Play, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../common/Button';

interface AudioRecorderProps {
  onAudioRecorded: (blob: Blob, url: string, type: string, duration: number) => void;
  onCancel: () => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onAudioRecorded, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingType, setRecordingType] = useState<string>('cough');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Function to start audio recording
  const startRecording = async () => {
    try {
      // Reset state
      audioChunksRef.current = [];
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop microphone stream
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert(t('diagnosis.audioFailed'));
    }
  };
  
  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Function to reset recording
  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };
  
  // Function to handle submission
  const handleSubmit = () => {
    if (audioBlob && audioUrl) {
      onAudioRecorded(audioBlob, audioUrl, recordingType, recordingTime);
    }
  };
  
  // Clear intervals when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  
  // Format recording time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">{t('diagnosis.audioCapture.title')}</h3>
        <p className="text-neutral-600">{t('diagnosis.audioCapture.instruction')}</p>
      </div>
      
      {/* Recording type selection */}
      <div className="mb-6">
        <label className="label mb-2">Recording type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['cough', 'breathing', 'voice', 'other'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setRecordingType(type)}
              className={`py-2 px-3 rounded-lg border ${
                recordingType === type
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-neutral-50 rounded-lg p-8 text-center mb-6">
        {!audioBlob ? (
          <>
            <motion.div
              animate={isRecording ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isRecording 
                  ? 'bg-error-100' 
                  : 'bg-primary-100'
              }`}
            >
              {isRecording ? (
                <Square size={32} className="text-error-500" />
              ) : (
                <Mic size={32} className="text-primary-500" />
              )}
            </motion.div>
            
            {isRecording ? (
              <div className="text-xl font-mono mb-6">
                {formatTime(recordingTime)}
              </div>
            ) : (
              <p className="mb-6 text-neutral-600">
                {t('diagnosis.recordingInstructions')}
              </p>
            )}
            
            <Button
              variant={isRecording ? "danger" : "primary"}
              size="large"
              onClick={isRecording ? stopRecording : startRecording}
              icon={isRecording ? <Square size={16} /> : <Play size={16} />}
            >
              {isRecording ? 
                t('diagnosis.audioCapture.stop') : 
                t('diagnosis.audioCapture.start')
              }
            </Button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic size={32} className="text-success-500" />
            </div>
            
            <p className="text-lg font-medium mb-2">Recording complete</p>
            <p className="text-neutral-500 mb-4">
              {formatTime(recordingTime)} - {recordingType}
            </p>
            
            {audioUrl && (
              <audio controls className="w-full mb-4">
                <source src={audioUrl} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            )}
            
            <Button
              variant="outline"
              onClick={resetRecording}
              icon={<RefreshCw size={16} />}
              className="mr-2"
            >
              {t('diagnosis.imageCapture.retake')}
            </Button>
          </>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          variant="primary"
          disabled={!audioBlob}
          onClick={handleSubmit}
          icon={<Check size={16} />}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default AudioRecorder;