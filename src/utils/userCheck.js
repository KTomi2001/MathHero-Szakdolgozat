import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; 

export const checkUsernameExists = async (username) => {
  try {
    const usernameDoc = await getDoc(doc(db, "usernames", username));
    return usernameDoc.exists();
  } catch (error) {
    console.error("Hiba történt a felhasználónév ellenőrzése során:", error);
    return false; 
  }
};