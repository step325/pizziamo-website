import { db, storage, uploadImage } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Riferimenti alle collezioni
const ingredientiCollection = collection(db, 'ingredienti');
const ingredientiSettingsRef = doc(db, 'settings', 'ingredienti');

// Funzione per caricare le impostazioni della sezione ingredienti
export async function loadIngredientiSettings() {
    try {
        const docSnap = await getDoc(ingredientiSettingsRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Dati di default
            return {
                titolo: "I Nostri Ingredienti",
                introduzione: "La qualità dei nostri ingredienti è il segreto del nostro successo. Collaboriamo con produttori locali che condividono la nostra passione per il cibo eccellente e sostenibile. Ogni ingrediente è selezionato con cura per garantire pizze dal sapore autentico e inconfondibile."
            };
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle impostazioni ingredienti:", error);
        throw error;
    }
}

// Funzione per salvare le impostazioni
export async function saveIngredientiSettings(settingsData) {
    try {
        await setDoc(ingredientiSettingsRef, settingsData);
        return settingsData;
    } catch (error) {
        console.error("Errore durante il salvataggio delle impostazioni ingredienti:", error);
        throw error;
    }
}

// Funzione per caricare tutti gli ingredienti
export async function loadIngredienti() {
    try {
        const ingredientiQuery = query(ingredientiCollection, orderBy('order'));
        const querySnapshot = await getDocs(ingredientiQuery);
        const ingredienti = [];
        
        querySnapshot.forEach((doc) => {
            ingredienti.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ingredienti;
    } catch (error) {
        console.error("Errore durante il caricamento degli ingredienti:", error);
        throw error;
    }
}

// Funzione per aggiungere un ingrediente
export async function addIngrediente(ingredienteData, imageFile) {
    try {
        // Determina l'ordine
        const ingredienti = await loadIngredienti();
        const newOrder = ingredienti.length > 0 ? Math.max(...ingredienti.map(i => i.order || 0)) + 1 : 1;
        ingredienteData.order = newOrder;
        
        // Carica l'immagine se presente
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'ingredienti');
            ingredienteData.immagine = imageUrl;
        }
        
        const docRef = await addDoc(ingredientiCollection, ingredienteData);
        return {
            id: docRef.id,
            ...ingredienteData
        };
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'ingrediente:", error);
        throw error;
    }
}

// Funzione per aggiornare un ingrediente
export async function updateIngrediente(ingredienteId, ingredienteData, imageFile) {
    try {
        const ingredienteRef = doc(db, 'ingredienti', ingredienteId);
        
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'ingredienti');
            ingredienteData.immagine = imageUrl;
        }
        
        await updateDoc(ingredienteRef, ingredienteData);
        return {
            id: ingredienteId,
            ...ingredienteData
        };
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'ingrediente:", error);
        throw error;
    }
}

// Funzione per eliminare un ingrediente
export async function deleteIngrediente(ingredienteId) {
    try {
        const ingredienteRef = doc(db, 'ingredienti', ingredienteId);
        await deleteDoc(ingredienteRef);
        return ingredienteId;
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'ingrediente:", error);
        throw error;
    }
}