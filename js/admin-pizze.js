import { db, storage } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

// Riferimento alla collezione pizze
const pizzeCollection = collection(db, 'pizze');

// Funzione helper per caricare immagini
async function uploadImage(file, path) {
    if (!file) return null;
    
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Errore durante il caricamento dell'immagine:", error);
        throw error;
    }
}

// Funzione per caricare tutte le pizze dal database
export async function loadPizzas() {
    try {
        const pizzaQuery = query(pizzeCollection, orderBy('name'));
        const querySnapshot = await getDocs(pizzaQuery);
        const pizzas = [];
        
        querySnapshot.forEach((doc) => {
            pizzas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return pizzas;
    } catch (error) {
        console.error("Errore durante il caricamento delle pizze:", error);
        throw error;
    }
}

// Funzione per aggiungere una nuova pizza
export async function addPizza(pizzaData, imageFile) {
    try {
        let imageUrl = null;
        
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'pizze');
            pizzaData.image = imageUrl;
        }
        
        const docRef = await addDoc(pizzeCollection, pizzaData);
        return {
            id: docRef.id,
            ...pizzaData
        };
    } catch (error) {
        console.error("Errore durante l'aggiunta della pizza:", error);
        throw error;
    }
}

// Funzione per aggiornare una pizza esistente
export async function updatePizza(pizzaId, pizzaData, imageFile) {
    try {
        const pizzaRef = doc(db, 'pizze', pizzaId);
        
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'pizze');
            pizzaData.image = imageUrl;
        }
        
        await updateDoc(pizzaRef, pizzaData);
        return {
            id: pizzaId,
            ...pizzaData
        };
    } catch (error) {
        console.error("Errore durante l'aggiornamento della pizza:", error);
        throw error;
    }
}

// Funzione per eliminare una pizza
export async function deletePizza(pizzaId) {
    try {
        const pizzaRef = doc(db, 'pizze', pizzaId);
        await deleteDoc(pizzaRef);
        return pizzaId;
    } catch (error) {
        console.error("Errore durante l'eliminazione della pizza:", error);
        throw error;
    }
}

// Funzione per ottenere una singola pizza
export async function getPizza(pizzaId) {
    try {
        const pizzaRef = doc(db, 'pizze', pizzaId);
        const pizzaSnap = await getDoc(pizzaRef);
        
        if (pizzaSnap.exists()) {
            return {
                id: pizzaSnap.id,
                ...pizzaSnap.data()
            };
        } else {
            throw new Error("Pizza non trovata");
        }
    } catch (error) {
        console.error("Errore durante il recupero della pizza:", error);
        throw error;
    }
}

// Mappa delle categorie per la visualizzazione
export const categoryMap = {
    'classiche': 'Classiche',
    'speciali': 'Specialità',
    'limited': 'Limited Edition',
    'vegane': 'Vegane',
    'senza-glutine': 'Senza Glutine'
};