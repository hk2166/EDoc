export type UserInfo = {
  id?: string;
  name?: string;
  age?: number;
  gender?: string;
  weight?: number; // kg
  height?: number; // cm
  medicalHistory?: string[];
  allergies?: string[];
  medications?: Medication[];
};

export type Medication = {
  name: string;
  dosage?: string;
  frequency?: string;
  purpose?: string;
};

export type SymptomSeverity = "mild" | "moderate" | "severe";

export type Symptom = {
  id: string;
  name: string;
  severity: SymptomSeverity;
  duration: string; // e.g., "2 days", "1 week"
  description?: string;
};

export type DiagnosticImage = {
  id: string;
  dataUrl: string; // base64 data URL
  type: "skin" | "eye" | "wound" | "other";
  bodyLocation?: string;
  timestamp: string;
};

export type AudioRecording = {
  id: string;
  blob: Blob;
  url: string; // URL.createObjectURL result
  type: "cough" | "breathing" | "voice" | "other";
  duration: number; // seconds
  timestamp: string;
};

export type SensorData = {
  type: "heartRate" | "temperature" | "bloodPressure" | "oxygenSaturation";
  value: number;
  unit: string;
  timestamp: string;
};

export type DiagnosticSession = {
  id: string;
  userId: string;
  symptoms: Symptom[];
  images?: DiagnosticImage[];
  audioRecordings?: AudioRecording[];
  sensorData?: SensorData[];
  textDescription?: string;
  timestamp: string;
  language: string;
};

export type DiagnosticResult = {
  sessionId: string;
  conditions: Condition[];
  recommendedActions: RecommendedAction[];
  severity: "low" | "medium" | "high" | "emergency";
  confidence: number; // 0-1
  timestamp: string;
  disclaimer: string;
};

export type Condition = {
  name: string;
  icdCode?: string; // ICD-11 code
  probability: number; // 0-1
  description: string;
  commonSymptoms: string[];
  references?: Reference[];
};

export type RecommendedAction = {
  type: "medication" | "specialist" | "test" | "lifestyle" | "emergency";
  description: string;
  urgency: "routine" | "soon" | "urgent" | "immediate";
  cost?: number; // Estimated cost
  effectiveness?: number; // 0-1
  nearbyOptions?: NearbyHealthcareOption[];
};

export type Reference = {
  source: string; // e.g., "WHO", "CDC", "Mayo Clinic"
  url?: string;
  title: string;
  date?: string; // Publication date
};

export type NearbyHealthcareOption = {
  name: string;
  type: "hospital" | "clinic" | "pharmacy" | "specialist";
  address: string;
  distance?: number; // km or miles
  contactInfo?: string;
  availability?: string;
  cost?: string; // e.g., "$$$", "Low cost"
};

export type LLMProvider = "openai" | "google" | "azure" | "anthropic" | "custom";

export type AppSettings = {
  language: string;
  theme: "light" | "dark" | "system";
  privacyMode: boolean;
  notificationsEnabled: boolean;
  llmProvider: LLMProvider;
  dataRetentionDays: number;
  analyticsOptIn: boolean;
};