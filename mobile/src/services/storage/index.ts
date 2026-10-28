import { EncryptedLocalStorageService } from './localStorageService';
import { ILocalStorageAdapter } from './storageInterface';

export * from './types';
export * from './storageInterface';
export * from './cryptoVault';
export * from './localStorageService';
export * from './patientRepository';
export * from './caseRepository';

/**
 * Singleton instance của Local Storage Service
 */
export const localStorageService: ILocalStorageAdapter = new EncryptedLocalStorageService();
