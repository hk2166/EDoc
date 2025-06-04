import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, DollarSign, Pill, Check, HelpCircle } from 'lucide-react';
import { RecommendedAction } from '../../types';

interface TreatmentOptionsProps {
  actions: RecommendedAction[];
}

const TreatmentOptions: React.FC<TreatmentOptionsProps> = ({ actions }) => {
  const { t } = useTranslation();
  
  // Only medication and lifestyle actions
  const treatmentActions = actions.filter(
    action => action.type === 'medication' || action.type === 'lifestyle'
  );
  
  if (treatmentActions.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200 p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-medium text-neutral-800 mb-4">
        {t('results.treatmentOptions')}
      </h3>
      
      <div className="space-y-4">
        {treatmentActions.map((action, index) => (
          <TreatmentCard key={index} action={action} />
        ))}
      </div>
    </div>
  );
};

interface TreatmentCardProps {
  action: RecommendedAction;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({ action }) => {
  // Determine color based on type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-5 h-5 text-secondary-500" />;
      case 'lifestyle':
        return <Heart className="w-5 h-5 text-accent-500" />;
      default:
        return <HelpCircle className="w-5 h-5 text-neutral-500" />;
    }
  };
  
  // Effectiveness indicator
  const getEffectivenessIndicator = (effectiveness?: number) => {
    if (!effectiveness) return null;
    
    const percentage = Math.round(effectiveness * 100);
    let color = 'bg-neutral-300';
    
    if (percentage >= 80) color = 'bg-success-500';
    else if (percentage >= 60) color = 'bg-success-400';
    else if (percentage >= 40) color = 'bg-warning-400';
    else color = 'bg-error-400';
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span>Effectiveness</span>
          <span className="font-medium">{percentage}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-1.5">
          <div 
            className={`${color} h-1.5 rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Cost indicator
  const getCostIndicator = (cost?: number) => {
    if (cost === undefined) return null;
    
    let costLevel;
    let costText;
    
    if (cost === 0) {
      costLevel = 'Free';
      costText = 'No cost';
    } else if (cost < 25) {
      costLevel = 'Low';
      costText = '$ (Under $25)';
    } else if (cost < 75) {
      costLevel = 'Medium';
      costText = '$$ ($25-$75)';
    } else {
      costLevel = 'High';
      costText = '$$$ (Over $75)';
    }
    
    return (
      <div className="flex items-center mt-2 text-xs text-neutral-600">
        <DollarSign className="w-4 h-4 mr-1" />
        <span>Estimated cost: {costText}</span>
      </div>
    );
  };
  
  return (
    <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
      <div className="flex items-start">
        <div className="mt-0.5 mr-3 flex-shrink-0">
          {getTypeIcon(action.type)}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-neutral-800 mb-1">
            {action.description}
          </h4>
          
          <div className="flex items-center text-xs text-neutral-600 space-x-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full ${
              action.urgency === 'immediate' || action.urgency === 'urgent' 
                ? 'bg-error-100 text-error-700' 
                : action.urgency === 'soon'
                  ? 'bg-warning-100 text-warning-700'
                  : 'bg-neutral-100'
            }`}>
              {action.urgency.charAt(0).toUpperCase() + action.urgency.slice(1)}
            </span>
            
            {action.type === 'lifestyle' && (
              <span className="inline-flex items-center bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full">
                <Check size={10} className="mr-1" /> Recommended
              </span>
            )}
          </div>
          
          {getEffectivenessIndicator(action.effectiveness)}
          {getCostIndicator(action.cost)}
        </div>
      </div>
    </div>
  );
};

export default TreatmentOptions;