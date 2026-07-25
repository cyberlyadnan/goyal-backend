import { firebaseConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';

/**
 * Firebase Admin / FCM bootstrap placeholder.
 * Wire `firebase-admin` credentials when notification delivery is implemented.
 */
export const initFirebase = (): void => {
  if (!firebaseConfig.projectId) {
    logger.warn('Firebase credentials missing — FCM notifications will be unavailable');
    return;
  }

  logger.info('Firebase config detected (admin SDK init deferred to feature work)');
};
