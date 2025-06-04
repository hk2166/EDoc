import axios from 'axios';
import { DiagnosticSession, DiagnosticResult } from '../types';
import { useAppSettings } from '../contexts/AppSettingsContext';
import localforage from 'localforage';

// Create an axios instance for API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com', // Replace with actual API endpoint
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(async (config) => {
  try {
    // Get auth token from localforage if available
    const token = await localforage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.warn('Failed to get auth token:', error);
    // Continue without auth token if there's an error
    return config;
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        // Clear invalid auth token
        try {
          await localforage.removeItem('authToken');
        } catch (e) {
          console.warn('Failed to clear auth token:', e);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Service for interacting with LLM APIs
export const llmService = {
  async analyzeDiagnosticData(
    session: DiagnosticSession, 
    provider?: string
  ): Promise<DiagnosticResult> {
    try {
      // Prepare request data
      const requestData = {
        sessionData: session,
        provider: provider || 'openai', // Default to OpenAI if not specified
      };
      
      // Make API call to process diagnostic data
      const response = await api.post('/api/analyze', requestData);
      
      return response.data as DiagnosticResult;
    } catch (error) {
      console.error('LLM analysis failed:', error);
      throw new Error('Failed to analyze diagnostic data');
    }
  },
  
  // Function to analyze just text for quick symptom checking
  async analyzeSymptomText(
    text: string,
    language: string,
    provider?: string
  ): Promise<Partial<DiagnosticResult>> {
    try {
      const requestData = {
        text,
        language,
        provider: provider || 'openai',
      };
      
      const response = await api.post('/api/analyze/text', requestData);
      return response.data;
    } catch (error) {
      console.error('Symptom text analysis failed:', error);
      throw new Error('Failed to analyze symptoms');
    }
  },
  
  // Function to analyze medical image
  async analyzeImage(
    imageDataUrl: string,
    bodyLocation: string,
    additionalContext?: string,
    provider?: string
  ): Promise<Partial<DiagnosticResult>> {
    try {
      const requestData = {
        image: imageDataUrl,
        bodyLocation,
        additionalContext,
        provider: provider || 'openai',
      };
      
      const response = await api.post('/api/analyze/image', requestData);
      return response.data;
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw new Error('Failed to analyze medical image');
    }
  },
};

// Mock implementation for local development
export const useMockLLMService = () => {
  const { settings } = useAppSettings();
  
  const mockAnalyzeDiagnosticData = async (
    session: DiagnosticSession
  ): Promise<DiagnosticResult> => {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock diagnostic result based on the input
    const hasRespiratorySymptoms = session.symptoms.some(
      s => ['cough', 'shortness of breath', 'difficulty breathing'].includes(s.name.toLowerCase())
    );
    
    const hasSkinIssues = session.images?.some(
      img => img.type === 'skin' || img.type === 'wound'
    );
    
    // Create mock result with realistic data
    return {
      sessionId: session.id,
      conditions: [
        // Add some conditions based on symptoms
        hasRespiratorySymptoms ? {
          name: 'Upper Respiratory Infection',
          icdCode: 'CA02',
          probability: 0.78,
          description: 'A viral infection affecting the upper respiratory tract including the nose, throat, and airways.',
          commonSymptoms: ['Cough', 'Sore throat', 'Nasal congestion', 'Mild fever']
        } : {
          name: 'Seasonal Allergies',
          icdCode: '4A84',
          probability: 0.65,
          description: 'An allergic response to environmental factors like pollen or dust.',
          commonSymptoms: ['Sneezing', 'Itchy eyes', 'Runny nose', 'Congestion']
        },
        
        // Add skin condition if relevant
        ...(hasSkinIssues ? [{
          name: 'Contact Dermatitis',
          icdCode: 'EA80',
          probability: 0.72,
          description: 'Skin inflammation caused by contact with an irritant or allergen.',
          commonSymptoms: ['Redness', 'Itching', 'Skin rash', 'Dry skin']
        }] : []),
        
        // Always add a second possibility with lower probability
        {
          name: hasRespiratorySymptoms ? 'Bronchitis' : 'Gastroenteritis',
          icdCode: hasRespiratorySymptoms ? 'CA07' : 'DA90',
          probability: 0.35,
          description: hasRespiratorySymptoms 
            ? 'Inflammation of the bronchial tubes that carry air to the lungs.'
            : 'Inflammation of the stomach and intestines, typically resulting from a viral or bacterial infection.',
          commonSymptoms: hasRespiratorySymptoms 
            ? ['Persistent cough', 'Mucus production', 'Fatigue', 'Chest discomfort']
            : ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal cramps']
        }
      ],
      recommendedActions: [
        {
          type: 'lifestyle',
          description: 'Rest and ensure adequate hydration',
          urgency: 'routine',
          effectiveness: 0.8
        },
        {
          type: hasRespiratorySymptoms ? 'medication' : 'lifestyle',
          description: hasRespiratorySymptoms 
            ? 'Over-the-counter cough suppressant or expectorant'
            : 'Follow BRAT diet (Bananas, Rice, Applesauce, Toast)',
          urgency: 'routine',
          cost: hasRespiratorySymptoms ? 15 : 0,
          effectiveness: 0.65
        },
        {
          type: 'specialist',
          description: `Consult a ${hasRespiratorySymptoms ? 'respiratory specialist' : 'primary care physician'} if symptoms persist beyond 7 days`,
          urgency: 'soon',
          nearbyOptions: [
            {
              name: 'Community Health Center',
              type: 'clinic',
              address: '123 Main Street, Anytown',
              distance: 2.4,
              contactInfo: '555-123-4567',
              cost: 'Low cost'
            }
          ]
        }
      ],
      severity: hasRespiratorySymptoms ? 'medium' : 'low',
      confidence: 0.82,
      timestamp: new Date().toISOString(),
      disclaimer: "This is an AI-generated preliminary assessment and not a medical diagnosis. Always consult with a healthcare professional for proper medical advice and treatment."
    };
  };
  
  return {
    analyzeDiagnosticData: mockAnalyzeDiagnosticData,
    // Add other mock implementations as needed
  };
};

// Healthcare Resources API
export const healthcareResourcesApi = {
  async findNearbyFacilities(
    lat: number,
    lng: number,
    radius: number = 10,
    types: string[] = ['hospital', 'clinic', 'pharmacy']
  ) {
    try {
      const response = await api.get('/api/resources/nearby', {
        params: { lat, lng, radius, types: types.join(',') }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to find nearby healthcare facilities:', error);
      throw new Error('Failed to find nearby healthcare facilities');
    }
  },
  
  async getResourceDetails(resourceId: string) {
    try {
      const response = await api.get(`/api/resources/${resourceId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get resource details:', error);
      throw new Error('Failed to get resource details');
    }
  }
};

// Medical database API
export const medicalDatabaseApi = {
  async getMedications(query: string) {
    try {
      const response = await api.get('/api/medications', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get medications:', error);
      throw new Error('Failed to get medications data');
    }
  },
  
  async getConditionInfo(conditionName: string) {
    try {
      const response = await api.get('/api/conditions', {
        params: { name: conditionName }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get condition information:', error);
      throw new Error('Failed to get condition information');
    }
  },
  
  async checkDrugInteractions(medications: string[]) {
    try {
      const response = await api.post('/api/medications/interactions', {
        medications
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check drug interactions:', error);
      throw new Error('Failed to check drug interactions');
    }
  }
};

export default api;