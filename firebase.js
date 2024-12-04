import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: 'AIzaSyD7EVMMfiD5JBIrr31n35hzRXrzi9awfJA',
  authDomain: 'live-e5194.firebaseapp.com',
  databaseURL: 'https://live-e5194-default-rtdb.firebaseio.com',
  projectId: 'live-e5194',
  storageBucket: 'live-e5194.appspot.com',
  messagingSenderId: '245892822393',
  appId: '1:245892822393:web:acea4214a7539079126ba8',
  measurementId: 'G-MJ2J1H13XM',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export const auth = getAuth(app);
export const firestore = db;
export const storageService = storage;

