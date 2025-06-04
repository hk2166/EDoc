import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Info } from 'lucide-react';
import Button from '../common/Button';

interface TextInputProps {
  initialValue?: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

const TextInput: React.FC<TextInputProps> = ({ 
  initialValue = '',
  onSubmit, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState(initialValue);
  
  // Check text length and complexity
  const isValidDescription = useCallback(() => {
    // Minimum 10 characters
    return text.trim().length >= 10;
  }, [text]);
  
  // Calculate input quality for feedback
  const getInputQuality = useCallback(() => {
    const length = text.trim().length;
    
    if (length === 0) return 'empty';
    if (length < 10) return 'tooShort';
    if (length < 30) return 'minimal';
    if (length < 100) return 'good';
    return 'excellent';
  }, [text]);
  
  // Generate feedback message based on input quality
  const getFeedbackMessage = useCallback(() => {
    const quality = getInputQuality();
    
    switch (quality) {
      case 'empty':
        return '';
      case 'tooShort':
        return 'Please provide more details about your symptoms.';
      case 'minimal':
        return 'Basic description. Adding more details will improve analysis.';
      case 'good':
        return 'Good description. Include duration and severity if possible.';
      case 'excellent':
        return 'Excellent description! This will help provide a more accurate analysis.';
      default:
        return '';
    }
  }, [getInputQuality]);
  
  // Get quality indicator color
  const getQualityColor = useCallback(() => {
    const quality = getInputQuality();
    
    switch (quality) {
      case 'empty':
      case 'tooShort':
        return 'text-error-500';
      case 'minimal':
        return 'text-warning-500';
      case 'good':
        return 'text-success-400';
      case 'excellent':
        return 'text-success-500';
      default:
        return '';
    }
  }, [getInputQuality]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isValidDescription()) {
      onSubmit(text);
    }
  };
  
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-xl font-medium mb-2">{t('diagnosis.textInput.title')}</h3>
        <p className="text-neutral-600">{t('diagnosis.textInput.instruction')}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="symptomText" className="label">
            {t('diagnosis.textInputLabel')}
          </label>
          
          <textarea
            id="symptomText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('diagnosis.textInput.placeholder')}
            className="input min-h-40 resize-y"
            rows={6}
          />
          
          {/* Feedback on input quality */}
          <div className="mt-2 flex items-start">
            <Info size={16} className={`mr-2 mt-0.5 ${getQualityColor()}`} />
            <p className={`text-sm ${getQualityColor()}`}>
              {getFeedbackMessage()}
            </p>
          </div>
          
          <div className="mt-2 text-right text-sm text-neutral-500">
            {text.length} characters
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-neutral-500 mb-6">
          <Info size={16} />
          <span>{t('disclaimer.notMedicalAdvice')}</span>
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!isValidDescription()}
            icon={<Check size={16} />}
          >
            {t('common.submit')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TextInput;