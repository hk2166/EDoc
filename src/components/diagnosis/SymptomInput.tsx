import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Search } from 'lucide-react';
import { Symptom, SymptomSeverity } from '../../types';
import Button from '../common/Button';

// Common symptoms list for autocomplete
const COMMON_SYMPTOMS = [
  'Cough', 'Fever', 'Headache', 'Sore Throat', 'Fatigue',
  'Shortness of Breath', 'Chest Pain', 'Nausea', 'Vomiting',
  'Diarrhea', 'Abdominal Pain', 'Back Pain', 'Joint Pain',
  'Muscle Aches', 'Rash', 'Dizziness', 'Blurred Vision',
  'Ear Pain', 'Runny Nose', 'Congestion', 'Loss of Appetite',
  'Weight Loss', 'Sweating', 'Chills'
];

interface SymptomInputProps {
  onAddSymptom: (symptom: Omit<Symptom, 'id'>) => void;
  onRemoveSymptom: (symptomId: string) => void;
  symptoms: Symptom[];
}

const SymptomInput: React.FC<SymptomInputProps> = ({
  onAddSymptom,
  onRemoveSymptom,
  symptoms
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<SymptomSeverity>('moderate');
  const [duration, setDuration] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filter symptoms based on search term
  const filteredSymptoms = useMemo(() => {
    if (!searchTerm) return [];
    
    return COMMON_SYMPTOMS.filter(symptom => 
      symptom.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !symptoms.some(s => s.name.toLowerCase() === symptom.toLowerCase())
    ).slice(0, 5); // Limit to 5 results
  }, [searchTerm, symptoms]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedName(value);
    setShowAutocomplete(value.length > 0);
  };
  
  // Handle symptom selection from autocomplete
  const handleSelectSymptom = (symptom: string) => {
    setSelectedName(symptom);
    setSearchTerm('');
    setShowAutocomplete(false);
    setShowAddForm(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedName.trim()) return;
    
    onAddSymptom({
      name: selectedName.trim(),
      severity: selectedSeverity,
      duration: duration || 'Not specified'
    });
    
    // Reset form
    setSearchTerm('');
    setSelectedName('');
    setSelectedSeverity('moderate');
    setDuration('');
    setShowAddForm(false);
  };
  
  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAutocomplete(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={t('home.searchSymptoms')}
            className="input pl-10"
            onFocus={() => searchTerm && setShowAutocomplete(true)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
        </div>
        
        {/* Autocomplete dropdown */}
        {showAutocomplete && filteredSymptoms.length > 0 && (
          <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg border border-neutral-200 max-h-60 overflow-y-auto">
            {filteredSymptoms.map((symptom) => (
              <button
                key={symptom}
                className="w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors"
                onClick={() => handleSelectSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showAutocomplete && searchTerm && filteredSymptoms.length === 0 && (
          <div className="absolute z-10 w-full bg-white rounded-lg shadow-lg border border-neutral-200 p-4 text-center">
            <p className="text-neutral-600">{t('diagnosis.addSymptom')}</p>
            <Button
              variant="primary"
              size="small"
              className="mt-2"
              onClick={() => {
                setSelectedName(searchTerm);
                setShowAutocomplete(false);
                setShowAddForm(true);
              }}
            >
              {t('diagnosis.addSymptom')}: {searchTerm}
            </Button>
          </div>
        )}
      </div>
      
      {/* Add symptom form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50 animate-fade-in">
          <h4 className="font-medium mb-3">{t('diagnosis.addSymptom')}: {selectedName}</h4>
          
          <form onSubmit={handleSubmit}>
            {/* Severity */}
            <div className="mb-4">
              <label className="label">{t('diagnosis.severityQuestion')}</label>
              <div className="flex space-x-2">
                {(['mild', 'moderate', 'severe'] as SymptomSeverity[]).map((severity) => (
                  <button
                    key={severity}
                    type="button"
                    onClick={() => setSelectedSeverity(severity)}
                    className={`flex-1 py-2 px-3 rounded-lg border ${
                      selectedSeverity === severity
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {t(`diagnosis.severity.${severity}`)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Duration */}
            <div className="mb-4">
              <label htmlFor="duration" className="label">{t('diagnosis.durationQuestion')}</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="input"
              >
                <option value="">{t('common.select')}</option>
                <option value="today">{t('diagnosis.duration.today')}</option>
                <option value="1-2 days">1-2 {t('diagnosis.duration.days')}</option>
                <option value="3-7 days">3-7 {t('diagnosis.duration.days')}</option>
                <option value="1-2 weeks">1-2 {t('diagnosis.duration.weeks')}</option>
                <option value="2+ weeks">2+ {t('diagnosis.duration.weeks')}</option>
                <option value="1+ months">1+ {t('diagnosis.duration.months')}</option>
                <option value="chronic">{t('diagnosis.duration.chronic')}</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setSearchTerm('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={<Plus size={16} />}
              >
                {t('diagnosis.addSymptom')}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Current symptoms list */}
      {symptoms.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            {t('diagnosis.symptomsQuestion')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <div 
                key={symptom.id}
                className="inline-flex items-center py-1 px-2 rounded-lg bg-primary-50 text-primary-700 text-sm"
              >
                <span>{symptom.name}</span>
                <span className="mx-1 text-neutral-400">•</span>
                <span>{t(`diagnosis.severity.${symptom.severity}`)}</span>
                <button
                  onClick={() => onRemoveSymptom(symptom.id)}
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-100"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomInput;