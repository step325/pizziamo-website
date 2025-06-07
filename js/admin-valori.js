import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Riferimento alla collezione valori
const valoriCollection = collection(db, 'valori');

// Funzione per caricare tutti i valori dal database
export async function loadValori() {
    try {
        const valoriQuery = query(valoriCollection, orderBy('order'));
        const querySnapshot = await getDocs(valoriQuery);
        const valori = [];
        
        querySnapshot.forEach((doc) => {
            valori.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return valori;
    } catch (error) {
        console.error("Errore durante il caricamento dei valori:", error);
        throw error;
    }
}

// Funzione per aggiungere un nuovo valore
export async function addValore(valoreData) {
    try {
        // Determina l'ordine del nuovo valore
        const valori = await loadValori();
        const newOrder = valori.length > 0 ? Math.max(...valori.map(v => v.order || 0)) + 1 : 1;
        valoreData.order = newOrder;
        
        const docRef = await addDoc(valoriCollection, valoreData);
        return {
            id: docRef.id,
            ...valoreData
        };
    } catch (error) {
        console.error("Errore durante l'aggiunta del valore:", error);
        throw error;
    }
}

// Funzione per aggiornare un valore esistente
export async function updateValore(valoreId, valoreData) {
    try {
        const valoreRef = doc(db, 'valori', valoreId);
        await updateDoc(valoreRef, valoreData);
        return {
            id: valoreId,
            ...valoreData
        };
    } catch (error) {
        console.error("Errore durante l'aggiornamento del valore:", error);
        throw error;
    }
}

// Funzione per eliminare un valore
export async function deleteValore(valoreId) {
    try {
        const valoreRef = doc(db, 'valori', valoreId);
        await deleteDoc(valoreRef);
        return valoreId;
    } catch (error) {
        console.error("Errore durante l'eliminazione del valore:", error);
        throw error;
    }
}

// Funzione per ottenere un singolo valore
export async function getValore(valoreId) {
    try {
        const valoreRef = doc(db, 'valori', valoreId);
        const valoreSnap = await getDoc(valoreRef);
        
        if (valoreSnap.exists()) {
            return {
                id: valoreSnap.id,
                ...valoreSnap.data()
            };
        } else {
            throw new Error("Valore non trovato");
        }
    } catch (error) {
        console.error("Errore durante il recupero del valore:", error);
        throw error;
    }
}

// Funzione per aggiornare l'ordine dei valori
export async function updateValoriOrder(valoriOrder) {
    try {
        const batch = writeBatch(db);
        
        valoriOrder.forEach((item, index) => {
            const valoreRef = doc(db, 'valori', item.id);
            batch.update(valoreRef, { order: index + 1 });
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'ordine:", error);
        throw error;
    }
}