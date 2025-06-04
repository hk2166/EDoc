import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

// A simple encryption service that uses the Web Crypto API
// Note: For a real medical app, you'd want a more robust solution with proper key management
export class EncryptionService {
  private encryptionKey: CryptoKey | null = null;
  private keyId: string | null = null;
  private isInitialized: boolean = false;
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Wait for localforage to be ready
      await localforage.ready();
      
      // Try to load existing key from secure storage
      const storedKeyData = await localforage.getItem('encryptionKeyData');
      
      if (storedKeyData) {
        const { keyId, key } = storedKeyData as { keyId: string; key: number[] };
        const keyBuffer = Uint8Array.from(key);
        
        this.encryptionKey = await window.crypto.subtle.importKey(
          'raw',
          keyBuffer,
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
        this.keyId = keyId;
      } else {
        // Generate a new encryption key
        await this.generateNewKey();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      throw new Error('Failed to initialize encryption system');
    }
  }
  
  private async generateNewKey(): Promise<void> {
    try {
      // Generate a new AES-GCM key
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );
      
      // Export the key to save it securely
      const keyBuffer = await window.crypto.subtle.exportKey('raw', this.encryptionKey);
      this.keyId = uuidv4();
      
      // Store the key data
      // In a real app, you'd want to use a more secure storage mechanism
      await localforage.setItem('encryptionKeyData', {
        keyId: this.keyId,
        key: Array.from(new Uint8Array(keyBuffer)),
      });
    } catch (error) {
      console.error('Key generation failed:', error);
      throw new Error('Failed to generate encryption key');
    }
  }
  
  async encryptData(data: string): Promise<{ encryptedData: string; iv: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
    
    // Generate a random IV for each encryption
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    
    try {
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        this.encryptionKey,
        encoder.encode(data)
      );
      
      // Convert to base64 strings for storage
      const encryptedData = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
      const ivString = btoa(String.fromCharCode(...iv));
      
      return { encryptedData, iv: ivString };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  async decryptData(encryptedData: string, iv: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!this.encryptionKey) {
      throw new Error('Encryption key not available');
    }
    
    try {
      // Convert from base64 back to ArrayBuffer
      const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
        },
        this.encryptionKey,
        encryptedBytes
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  getKeyId(): string | null {
    return this.keyId;
  }
  
  // For debugging purposes only - in a real app, you would never export the key
  async getEncryptionTest(): Promise<{ success: boolean, testData: string }> {
    const testData = "This is a test of the encryption system";
    try {
      const { encryptedData, iv } = await this.encryptData(testData);
      const decryptedData = await this.decryptData(encryptedData, iv);
      
      return {
        success: decryptedData === testData,
        testData: `Original: ${testData}\nEncrypted: ${encryptedData.substring(0, 20)}...\nDecrypted: ${decryptedData}`,
      };
    } catch (error) {
      console.error('Encryption test failed:', error);
      return {
        success: false,
        testData: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// Create a singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;