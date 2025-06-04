import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { Condition, RecommendedAction } from '../../types';

interface DiagnosticResultCardProps {
  condition: Condition;
  recommendedActions: RecommendedAction[];
  severityLevel: string;
}

const DiagnosticResultCard: React.FC<DiagnosticResultCardProps> = ({
  condition,
  recommendedActions,
  severityLevel
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  
  // Determine severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency':
        return 'bg-error-100 text-error-700 border-error-200';
      case 'high':
        return 'bg-error-50 text-error-700 border-error-100';
      case 'medium':
        return 'bg-warning-50 text-warning-700 border-warning-100';
      case 'low':
      default:
        return 'bg-success-50 text-success-700 border-success-100';
    }
  };
  
  // Format probability as percentage
  const formatProbability = (prob: number): string => {
    return `${Math.round(prob * 100)}%`;
  };

  // Filter actions relevant to this condition
  const relevantActions = recommendedActions.slice(0, 3);
  
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200 transition-all duration-300"
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg sm:text-xl font-medium text-neutral-800">
                {condition.name}
              </h3>
              {condition.icdCode && (
                <span className="ml-2 text-sm text-neutral-500">
                  ({condition.icdCode})
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                {t('results.probability')}: {formatProbability(condition.probability)}
              </span>
              
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getSeverityColor(severityLevel)}`}>
                {t(`results.severity.${severityLevel}`)}
              </span>
            </div>
            
            <p className="text-neutral-600 line-clamp-2">{condition.description}</p>
          </div>
          
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2 flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </motion.div>
        </div>
      </div>
      
      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-neutral-200 overflow-hidden"
          >
            <div className="p-4 sm:p-6">
              {/* Common symptoms */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">
                  {t('results.commonSymptoms')}
                </h4>
                <ul className="text-neutral-600 pl-5 list-disc space-y-1">
                  {condition.commonSymptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              {/* Recommended actions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-neutral-700 mb-2">
                  {t('results.recommendedActions')}
                </h4>
                <div className="space-y-3">
                  {relevantActions.map((action, index) => (
                    <div 
                      key={index}
                      className={`rounded-lg p-3 text-sm ${
                        action.urgency === 'immediate' || action.urgency === 'urgent'
                          ? 'bg-error-50 text-error-700'
                          : action.urgency === 'soon'
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <div className="flex items-start">
                        {action.urgency === 'immediate' || action.urgency === 'urgent' ? (
                          <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 mr-2 flex-shrink-0" />
                        )}
                        <div>
                          <p>{action.description}</p>
                          {action.nearbyOptions && action.nearbyOptions.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center text-xs font-medium mb-1">
                                <MapPin size={12} className="mr-1" />
                                <span>{t('results.nearbyFacilities')}</span>
                              </div>
                              <div className="pl-3 space-y-1">
                                {action.nearbyOptions.slice(0, 2).map((option, idx) => (
                                  <p key={idx} className="text-xs">
                                    {option.name} ({option.distance && t('results.distanceAway', { distance: option.distance })})
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* References if available */}
              {condition.references && condition.references.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">
                    {t('results.references')}
                  </h4>
                  <ul className="text-sm space-y-2">
                    {condition.references.map((ref, index) => (
                      <li key={index} className="text-primary-600 hover:underline">
                        {ref.url ? (
                          <a href={ref.url} target="_blank" rel="noopener noreferrer">
                            {ref.title} - {ref.source} {ref.date && `(${ref.date})`}
                          </a>
                        ) : (
                          <span className="text-neutral-600">
                            {ref.title} - {ref.source} {ref.date && `(${ref.date})`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Learn more button */}
              <div className="mt-4 flex justify-end">
                <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                  {t('results.learnMore')}
                  <ChevronDown className="w-4 h-4 ml-1 transform rotate-270" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DiagnosticResultCard;