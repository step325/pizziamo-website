// admin-team.js - Gestione Team nel pannello admin
import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    getDoc,
    setDoc,
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { uploadImage } from './firebase-config.js';

// Carica team da Firebase
export async function loadTeam() {
    try {
        const teamCollection = collection(db, 'team');
        const teamQuery = query(teamCollection, orderBy('order'));
        const querySnapshot = await getDocs(teamQuery);
        
        const team = [];
        querySnapshot.forEach((doc) => {
            team.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return team;
    } catch (error) {
        console.error("Errore durante il caricamento del team:", error);
        throw error;
    }
}

// Carica impostazioni team
export async function loadTeamSettings() {
    try {
        const settingsDoc = doc(db, 'settings', 'team');
        const docSnap = await getDoc(settingsDoc);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return {
                titolo: 'Il Nostro Team',
                introduzione: 'Dietro ogni pizza perfetta c\'è una squadra appassionata e dedicata. Conosciamo le persone che ogni giorno lavorano con passione per offrirti l\'esperienza PIZZIAMO?!'
            };
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle impostazioni team:", error);
        return {
            titolo: 'Il Nostro Team',
            introduzione: 'Dietro ogni pizza perfetta c\'è una squadra appassionata e dedicata. Conosciamo le persone che ogni giorno lavorano con passione per offrirti l\'esperienza PIZZIAMO?!'
        };
    }
}

// Salva impostazioni team
export async function saveTeamSettings(titolo, introduzione) {
    try {
        const settingsDoc = doc(db, 'settings', 'team');
        await setDoc(settingsDoc, {
            titolo: titolo,
            introduzione: introduzione
        });
        console.log("Impostazioni team salvate con successo");
    } catch (error) {
        console.error("Errore durante il salvataggio delle impostazioni team:", error);
        throw error;
    }
}

// Aggiungi membro del team
export async function addTeamMember(memberData, imageFile) {
    try {
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'team');
            memberData.immagine = imageUrl;
        }
        
        const teamCollection = collection(db, 'team');
        const docRef = await addDoc(teamCollection, memberData);
        console.log("Membro del team aggiunto con ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Errore durante l'aggiunta del membro del team:", error);
        throw error;
    }
}

// Aggiorna membro del team
export async function updateTeamMember(memberId, memberData, imageFile) {
    try {
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'team');
            memberData.immagine = imageUrl;
        }
        
        const memberDoc = doc(db, 'team', memberId);
        await updateDoc(memberDoc, memberData);
        console.log("Membro del team aggiornato con successo");
    } catch (error) {
        console.error("Errore durante l'aggiornamento del membro del team:", error);
        throw error;
    }
}

// Elimina membro del team
export async function deleteTeamMember(memberId) {
    try {
        const memberDoc = doc(db, 'team', memberId);
        await deleteDoc(memberDoc);
        console.log("Membro del team eliminato con successo");
    } catch (error) {
        console.error("Errore durante l'eliminazione del membro del team:", error);
        throw error;
    }
}
