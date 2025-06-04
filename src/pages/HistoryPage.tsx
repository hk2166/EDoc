import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ChevronRight, 
  Calendar, 
  Search, 
  Trash2, 
  Filter 
} from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DiagnosticSession, DiagnosticResult } from '../types';
import { getUserSessions, getDiagnosticResult } from '../services/storage';

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<Array<DiagnosticSession & { result?: DiagnosticResult }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // For demo purposes, using a hard-coded user ID
        // In a real app, this would come from authentication
        const userSessions = await getUserSessions('user-123');
        
        // Load results for each session
        const sessionsWithResults = await Promise.all(
          userSessions.map(async (session) => {
            try {
              const result = await getDiagnosticResult(session.id);
              return { ...session, result };
            } catch (error) {
              return session;
            }
          })
        );
        
        // Sort by date, newest first
        const sortedSessions = sessionsWithResults.sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        setSessions(sortedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  // Filter and search sessions
  const filteredSessions = sessions.filter(session => {
    // Apply search term
    const searchMatch = searchTerm === '' || 
      (session.textDescription && session.textDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      session.symptoms.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (session.result?.conditions.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Apply filter
    let filterMatch = filter === 'all';
    
    if (filter === 'high') {
      filterMatch = session.result?.severity === 'high' || session.result?.severity === 'emergency';
    } else if (filter === 'medium') {
      filterMatch = session.result?.severity === 'medium';
    } else if (filter === 'low') {
      filterMatch = session.result?.severity === 'low';
    }
    
    return searchMatch && filterMatch;
  });
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  if (loading) {
    return (
      <div className="container-padding mx-auto py-12 flex justify-center">
        <LoadingSpinner size="large\" label={t('common.loading')} />
      </div>
    );
  }
  
  return (
    <div className="container-padding mx-auto max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-neutral-800">
          {t('home.viewHistory')}
        </h1>
        <p className="text-neutral-600 max-w-2xl">
          View and manage your previous diagnostic sessions
        </p>
      </div>
      
      {/* Search and filter bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            className="input pl-10"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input pl-9 pr-8 appearance-none cursor-pointer"
            >
              <option value="all">All Severity</option>
              <option value="high">High Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="low">Low Severity</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          </div>
          
          <Button
            variant="primary"
            onClick={() => navigate('/diagnosis')}
          >
            {t('home.newDiagnosis')}
          </Button>
        </div>
      </div>
      
      {/* Sessions list */}
      {filteredSessions.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-neutral-200 cursor-pointer"
              onClick={() => navigate(`/results/${session.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-3 sm:mb-0">
                  {/* Date and time */}
                  <div className="flex items-center text-sm text-neutral-500 mb-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(session.timestamp)}</span>
                    <span className="mx-2">•</span>
                    <Clock size={14} className="mr-1" />
                    <span>{formatTime(session.timestamp)}</span>
                  </div>
                  
                  {/* Diagnosis summary */}
                  <h3 className="font-medium text-neutral-800 text-lg">
                    {session.result?.conditions[0]?.name || 'Symptoms Assessment'}
                  </h3>
                  
                  {/* Symptom tags */}
                  {session.symptoms.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {session.symptoms.slice(0, 3).map(symptom => (
                        <span 
                          key={symptom.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                        >
                          {symptom.name}
                        </span>
                      ))}
                      {session.symptoms.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                          +{session.symptoms.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  {/* Severity indicator */}
                  {session.result && (
                    <div className={`mr-4 px-3 py-1 rounded-full text-sm font-medium ${
                      session.result.severity === 'emergency' || session.result.severity === 'high'
                        ? 'bg-error-100 text-error-700'
                        : session.result.severity === 'medium'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-success-100 text-success-700'
                    }`}>
                      {t(`results.severity.${session.result.severity}`)}
                    </div>
                  )}
                  
                  <ChevronRight size={20} className="text-neutral-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-neutral-50 rounded-lg p-8 text-center border border-neutral-200">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">No diagnostic history</h3>
          <p className="text-neutral-600 mb-6">
            You haven't completed any diagnostic sessions yet.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/diagnosis')}
          >
            {t('home.startDiagnosis')}
          </Button>
        </div>
      )}
      
      {/* Clear history button (only shown if sessions exist) */}
      {sessions.length > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="small"
            icon={<Trash2 size={16} />}
            className="text-error-600 hover:text-error-700 hover:border-error-300"
          >
            Clear History
          </Button>
          <p className="mt-2 text-xs text-neutral-500">
            This will permanently delete all your diagnostic sessions and results.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;