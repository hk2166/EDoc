import localforage from 'localforage';
import { 
  DiagnosticSession, 
  DiagnosticResult, 
  UserInfo,
  DiagnosticImage,
  AudioRecording
} from '../types';
import { v4 as uuidv4 } from 'uuid';

// Configure localForage
localforage.config({
  name: 'health-edge-diagnostics',
  version: 1.0,
  storeName: 'health_data',
  description: 'Local storage for Health Edge Diagnostics app'
});

// User Profile
export async function saveUserInfo(userInfo: UserInfo): Promise<UserInfo> {
  const updatedInfo = { ...userInfo };
  
  if (!updatedInfo.id) {
    updatedInfo.id = uuidv4();
  }
  
  await localforage.setItem(`user_${updatedInfo.id}`, updatedInfo);
  return updatedInfo;
}

export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  return localforage.getItem<UserInfo>(`user_${userId}`);
}

export async function getCurrentUser(): Promise<UserInfo | null> {
  const currentUserId = await localforage.getItem<string>('currentUserId');
  if (!currentUserId) return null;
  return getUserInfo(currentUserId);
}

export async function setCurrentUser(userId: string): Promise<void> {
  await localforage.setItem('currentUserId', userId);
}

// Diagnostic Sessions
export async function saveDiagnosticSession(session: DiagnosticSession): Promise<DiagnosticSession> {
  const updatedSession = { ...session };
  
  if (!updatedSession.id) {
    updatedSession.id = uuidv4();
  }
  
  // Store session metadata
  await localforage.setItem(`session_${updatedSession.id}`, updatedSession);
  
  // Store large binary data separately for better performance
  if (updatedSession.images?.length) {
    for (const image of updatedSession.images) {
      await saveImage(image, updatedSession.id);
    }
  }
  
  if (updatedSession.audioRecordings?.length) {
    for (const recording of updatedSession.audioRecordings) {
      await saveAudioRecording(recording, updatedSession.id);
    }
  }
  
  return updatedSession;
}

export async function getDiagnosticSession(sessionId: string): Promise<DiagnosticSession | null> {
  return localforage.getItem<DiagnosticSession>(`session_${sessionId}`);
}

export async function getUserSessions(userId: string): Promise<DiagnosticSession[]> {
  const sessions: DiagnosticSession[] = [];
  
  // Get all keys
  const keys = await localforage.keys();
  
  // Filter for session keys
  const sessionKeys = keys.filter(key => key.startsWith('session_'));
  
  // Load each session and filter by userId
  for (const key of sessionKeys) {
    const session = await localforage.getItem<DiagnosticSession>(key);
    if (session && session.userId === userId) {
      // Load associated images and audio
      if (session.images) {
        for (let i = 0; i < session.images.length; i++) {
          session.images[i] = await getImage(session.images[i].id, session.id);
        }
      }
      
      if (session.audioRecordings) {
        for (let i = 0; i < session.audioRecordings.length; i++) {
          session.audioRecordings[i] = await getAudioRecording(session.audioRecordings[i].id, session.id);
        }
      }
      
      sessions.push(session);
    }
  }
  
  return sessions;
}

// Diagnostic Results
export async function saveDiagnosticResult(result: DiagnosticResult): Promise<DiagnosticResult> {
  await localforage.setItem(`result_${result.sessionId}`, result);
  return result;
}

export async function getDiagnosticResult(sessionId: string): Promise<DiagnosticResult | null> {
  return localforage.getItem<DiagnosticResult>(`result_${sessionId}`);
}

// Helper functions for large binary data
async function saveImage(image: DiagnosticImage, sessionId: string): Promise<void> {
  await localforage.setItem(`image_${sessionId}_${image.id}`, image);
}

async function getImage(imageId: string, sessionId: string): Promise<DiagnosticImage> {
  const image = await localforage.getItem<DiagnosticImage>(`image_${sessionId}_${imageId}`);
  if (!image) {
    throw new Error(`Image not found: ${imageId}`);
  }
  return image;
}

async function saveAudioRecording(recording: AudioRecording, sessionId: string): Promise<void> {
  await localforage.setItem(`audio_${sessionId}_${recording.id}`, recording);
}

async function getAudioRecording(recordingId: string, sessionId: string): Promise<AudioRecording> {
  const recording = await localforage.getItem<AudioRecording>(`audio_${sessionId}_${recordingId}`);
  if (!recording) {
    throw new Error(`Audio recording not found: ${recordingId}`);
  }
  return recording;
}

// Data export and cleanup
export async function exportUserData(userId: string): Promise<string> {
  const userData = await getUserInfo(userId);
  const sessions = await getUserSessions(userId);
  
  const results = await Promise.all(
    sessions.map(async session => getDiagnosticResult(session.id))
  );
  
  const exportData = {
    userData,
    sessions,
    results: results.filter(Boolean), // Filter out null results
  };
  
  return JSON.stringify(exportData, null, 2);
}

export async function deleteUserData(userId: string): Promise<void> {
  const sessions = await getUserSessions(userId);
  
  // Delete all session data, images, audio, and results
  for (const session of sessions) {
    // Delete images
    if (session.images?.length) {
      for (const image of session.images) {
        await localforage.removeItem(`image_${session.id}_${image.id}`);
      }
    }
    
    // Delete audio recordings
    if (session.audioRecordings?.length) {
      for (const recording of session.audioRecordings) {
        await localforage.removeItem(`audio_${session.id}_${recording.id}`);
      }
    }
    
    // Delete result and session
    await localforage.removeItem(`result_${session.id}`);
    await localforage.removeItem(`session_${session.id}`);
  }
  
  // Delete user info
  await localforage.removeItem(`user_${userId}`);
  
  // If this was the current user, clear that too
  const currentUserId = await localforage.getItem<string>('currentUserId');
  if (currentUserId === userId) {
    await localforage.removeItem('currentUserId');
  }
}

export async function cleanupExpiredData(retentionDays: number): Promise<void> {
  const now = new Date();
  const cutoff = new Date(now.setDate(now.getDate() - retentionDays));
  
  // Get all sessions
  const keys = await localforage.keys();
  const sessionKeys = keys.filter(key => key.startsWith('session_'));
  
  for (const key of sessionKeys) {
    const session = await localforage.getItem<DiagnosticSession>(key);
    if (session && new Date(session.timestamp) < cutoff) {
      // This session is older than the retention period, delete it
      // Delete associated data first
      if (session.images?.length) {
        for (const image of session.images) {
          await localforage.removeItem(`image_${session.id}_${image.id}`);
        }
      }
      
      if (session.audioRecordings?.length) {
        for (const recording of session.audioRecordings) {
          await localforage.removeItem(`audio_${session.id}_${recording.id}`);
        }
      }
      
      // Delete result
      await localforage.removeItem(`result_${session.id}`);
      
      // Delete session itself
      await localforage.removeItem(key);
    }
  }
}