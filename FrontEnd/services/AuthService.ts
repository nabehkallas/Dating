import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User // Import the User type for the return value
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';


export const registerUser = async (email: string, password: string, name: string,gender: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name || "New User",
      email: user.email,
      gender: gender,
      avatar: "https://via.placeholder.com/150",
      age: 18,
      bio: "I am new here!",
      isPrivate: false,
      createdAt: serverTimestamp()
    });

    return user;
  } catch (error) {
    throw error;
  }
};


export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};


export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error(error);
  }
};