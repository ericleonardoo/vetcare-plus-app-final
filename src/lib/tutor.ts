import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Importe sua instância do db

interface ProfileData {
  name: string;
  phone: string;
}

export const updateUserProfileOnClient = async (userId: string, data: ProfileData) => {
  // Esta função agora roda no navegador e usa o SDK do cliente.
  // O 'auth' do usuário já está embutido no 'db' que importamos.

  const userDocRef = doc(db, "tutors", userId);

  // Usamos setDoc com merge: true para criar ou atualizar o documento.
  await setDoc(userDocRef, {
    name: data.name,
    phone: data.phone,
    profileCompleted: true
  }, { merge: true });
};
