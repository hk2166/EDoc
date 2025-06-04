import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, Upload, Check, X } from 'lucide-react';
import Button from '../common/Button';
import { useDropzone } from 'react-dropzone';

interface ImageCaptureProps {
  onImageCapture: (dataUrl: string, type: string, bodyLocation?: string) => void;
  onCancel: () => void;
}

const ImageCapture: React.FC<ImageCaptureProps> = ({ onImageCapture, onCancel }) => {
  const { t } = useTranslation();
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [bodyLocation, setBodyLocation] = useState('');
  const [imageType, setImageType] = useState<string>('skin');
  const [useCameraMode, setUseCameraMode] = useState(true);

  // Set up webcam constraints
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'environment' // Use back camera on mobile devices
  };
  
  // Handle camera start
  const startCamera = useCallback(() => {
    setIsCameraActive(true);
    setCameraError(false);
  }, []);
  
  // Handle camera errors
  const handleCameraError = useCallback(() => {
    setCameraError(true);
    setIsCameraActive(false);
  }, []);

  // Capture image from webcam
  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsCameraActive(false);
    }
  }, [webcamRef]);

  // Reset to retake image
  const resetImage = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Handle file drop/upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/heic': []
    },
    maxFiles: 1
  });

  // Submit captured image
  const handleSubmit = useCallback(() => {
    if (capturedImage) {
      onImageCapture(capturedImage, imageType, bodyLocation || undefined);
    }
  }, [capturedImage, imageType, bodyLocation, onImageCapture]);

  // Initialize camera on component mount if using camera mode
  useEffect(() => {
    if (useCameraMode) {
      startCamera();
    }
  }, [useCameraMode, startCamera]);

  const dropzoneClasses = `
    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
    ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
  `;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">{t('diagnosis.imageCapture.title')}</h3>
        <p className="text-neutral-600">{t('diagnosis.scanInstructions')}</p>
      </div>
      
      {/* Toggle between camera and upload */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex p-1 bg-neutral-100 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              useCameraMode 
                ? 'bg-white shadow text-primary-600' 
                : 'text-neutral-600 hover:bg-neutral-200'
            }`}
            onClick={() => setUseCameraMode(true)}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            {t('diagnosis.takePicture')}
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !useCameraMode 
                ? 'bg-white shadow text-primary-600' 
                : 'text-neutral-600 hover:bg-neutral-200'
            }`}
            onClick={() => setUseCameraMode(false)}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            {t('diagnosis.uploadImage')}
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        {/* Camera View */}
        {useCameraMode && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            {isCameraActive ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleCameraError}
                  className="w-full h-full object-cover"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={captureImage}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
                >
                  <Camera className="w-6 h-6 text-primary-500" />
                </motion.button>
              </>
            ) : capturedImage ? (
              <>
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover" 
                />
                <button
                  onClick={resetImage}
                  className="absolute bottom-4 left-4 bg-white rounded-full p-2 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 text-primary-500" />
                </button>
              </>
            ) : cameraError ? (
              <div className="flex items-center justify-center h-full bg-neutral-100 p-4">
                <div className="text-center">
                  <p className="text-error-500 mb-2">{t('diagnosis.imageFailed')}</p>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => setUseCameraMode(false)}
                  >
                    {t('diagnosis.uploadImage')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-neutral-100">
                <Button
                  variant="primary"
                  onClick={startCamera}
                  icon={<Camera size={16} />}
                >
                  {t('diagnosis.takePicture')}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Upload Option */}
        {!useCameraMode && !capturedImage && (
          <div {...getRootProps()} className={dropzoneClasses}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-neutral-400 mb-2" />
              {isDragActive ? (
                <p className="text-primary-500">Drop the image here...</p>
              ) : (
                <>
                  <p className="text-neutral-700 font-medium">Drag & drop an image here</p>
                  <p className="text-neutral-500 text-sm mt-1">or click to select a file</p>
                  <p className="text-neutral-400 text-xs mt-4">
                    Supported formats: JPG, PNG, HEIC
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Uploaded Image Preview */}
        {!useCameraMode && capturedImage && (
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Uploaded" 
              className="w-full object-contain max-h-80" 
            />
            <button
              onClick={() => setCapturedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
            >
              <X className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
        )}
      </div>
      
      {capturedImage && (
        <>
          {/* Body location selection */}
          <div className="mb-6">
            <label className="label">{t('diagnosis.bodyLocationPrompt')}</label>
            <select
              value={bodyLocation}
              onChange={(e) => setBodyLocation(e.target.value)}
              className="input"
            >
              <option value="">{t('diagnosis.selectBodyPart')}</option>
              <option value="head">{t('diagnosis.bodyParts.head')}</option>
              <option value="chest">{t('diagnosis.bodyParts.chest')}</option>
              <option value="abdomen">{t('diagnosis.bodyParts.abdomen')}</option>
              <option value="back">{t('diagnosis.bodyParts.back')}</option>
              <option value="arms">{t('diagnosis.bodyParts.arms')}</option>
              <option value="legs">{t('diagnosis.bodyParts.legs')}</option>
              <option value="skin">{t('diagnosis.bodyParts.skin')}</option>
              <option value="other">{t('diagnosis.bodyParts.other')}</option>
            </select>
          </div>
          
          {/* Image type selection */}
          <div className="mb-6">
            <label className="label">Image type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['skin', 'wound', 'eye', 'other'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setImageType(type)}
                  className={`py-2 px-3 rounded-lg border ${
                    imageType === type
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          variant="primary"
          disabled={!capturedImage}
          onClick={handleSubmit}
          icon={<Check size={16} />}
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default ImageCapture;