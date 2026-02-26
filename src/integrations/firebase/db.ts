import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './client';

// Helper to convert Firestore timestamp to ISO string
export const toISODate = (timestamp: Timestamp | null | undefined): string | null => {
  if (!timestamp) return null;
  return timestamp.toDate().toISOString();
};

// Helper to convert ISO string to Firestore timestamp
export const toTimestamp = (date: string | null | undefined): Timestamp | null => {
  if (!date) return null;
  return Timestamp.fromDate(new Date(date));
};

// Helper to convert Firestore document to plain object
export const docToData = <T = DocumentData>(docSnap: QueryDocumentSnapshot): T => {
  const data = docSnap.data();
  const id = docSnap.id;
  
  // Convert all Timestamps to ISO strings
  const converted: any = { id, ...data };
  Object.keys(converted).forEach(key => {
    if (converted[key] && typeof converted[key] === 'object') {
      if (converted[key].toDate && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate().toISOString();
      } else if (converted[key].seconds !== undefined) {
        converted[key] = new Date(converted[key].seconds * 1000).toISOString();
      }
    }
  });
  
  return converted as T;
};

// Profiles collection
export const profilesCollection = collection(db, 'profiles');

export const getProfile = async (profileId: string) => {
  try {
    const docRef = doc(db, 'profiles', profileId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docToData(docSnap);
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
};

export const getProfileByUserId = async (userId: string) => {
  try {
    const q = query(profilesCollection, where('user_id', '==', userId), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return docToData(querySnapshot.docs[0]);
  } catch (error) {
    console.error('Error getting profile by user ID:', error);
    return null;
  }
};

export const getProfileByHandle = async (handle: string) => {
  try {
    const q = query(profilesCollection, where('handle', '==', handle), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return docToData(querySnapshot.docs[0]);
  } catch (error) {
    console.error('Error getting profile by handle:', error);
    // Return null on error instead of throwing
    return null;
  }
};

export const createProfile = async (profileId: string, data: any) => {
  const docRef = doc(db, 'profiles', profileId);
  const profileData = {
    ...data,
    id: profileId,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
  await setDoc(docRef, profileData);
  return docToData(await getDoc(docRef));
};

export const updateProfile = async (profileId: string, data: any) => {
  const docRef = doc(db, 'profiles', profileId);
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  await updateDoc(docRef, updateData);
  return docToData(await getDoc(docRef));
};

// Subscriptions subcollection
export const getSubscriptions = async (profileId: string) => {
  const subscriptionsRef = collection(db, 'profiles', profileId, 'subscriptions');
  const querySnapshot = await getDocs(subscriptionsRef);
  return querySnapshot.docs.map(docToData);
};

export const getActiveSubscription = async (profileId: string) => {
  const subscriptionsRef = collection(db, 'profiles', profileId, 'subscriptions');
  const q = query(subscriptionsRef, where('status', '==', 'active'), limit(1));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  return docToData(querySnapshot.docs[0]);
};

// Real-time listeners
export const watchProfile = (profileId: string, callback: (data: any) => void) => {
  const docRef = doc(db, 'profiles', profileId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docToData(docSnap));
    } else {
      callback(null);
    }
  });
};

export const watchProfileByUserId = (userId: string, callback: (data: any) => void) => {
  const q = query(profilesCollection, where('user_id', '==', userId), limit(1));
  return onSnapshot(q, (querySnapshot) => {
    if (!querySnapshot.empty) {
      callback(docToData(querySnapshot.docs[0]));
    } else {
      callback(null);
    }
  });
};
