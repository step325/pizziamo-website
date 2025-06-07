import { db, storage, uploadImage } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Riferimenti
const galleryCollection = collection(db, 'gallery');
const localeSettingsRef = doc(db, 'settings', 'locale');

// Funzione per caricare le impostazioni del locale
export async function loadLocaleSettings() {
    try {
        const docSnap = await getDoc(localeSettingsRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return {
                titolo: "Il Nostro Locale",
                introduzione: "Il nostro locale è stato progettato per offrirti un ambiente accogliente dove gustare le nostre specialità. Un mix di design moderno e atmosfera familiare che ti farà sentire subito a tuo agio."
            };
        }
    } catch (error) {
        console.error("Errore durante il caricamento delle impostazioni locale:", error);
        throw error;
    }
}

// Funzione per salvare le impostazioni
export async function saveLocaleSettings(settingsData) {
    try {
        await setDoc(localeSettingsRef, settingsData);
        return settingsData;
    } catch (error) {
        console.error("Errore durante il salvataggio delle impostazioni locale:", error);
        throw error;
    }
}

// Funzione per caricare la galleria
export async function loadGallery() {
    try {
        const galleryQuery = query(galleryCollection, orderBy('order'));
        const querySnapshot = await getDocs(galleryQuery);
        const images = [];
        
        querySnapshot.forEach((doc) => {
            images.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return images;
    } catch (error) {
        console.error("Errore durante il caricamento della galleria:", error);
        throw error;
    }
}

// Funzione per aggiungere un'immagine alla galleria
export async function addGalleryImage(imageData, imageFile) {
    try {
        // Determina l'ordine
        const images = await loadGallery();
        const newOrder = images.length > 0 ? Math.max(...images.map(i => i.order || 0)) + 1 : 1;
        imageData.order = newOrder;
        
        // Carica l'immagine
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'gallery');
            imageData.url = imageUrl;
        }
        
        const docRef = await addDoc(galleryCollection, imageData);
        return {
            id: docRef.id,
            ...imageData
        };
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'immagine:", error);
        throw error;
    }
}

// Funzione per aggiornare un'immagine
export async function updateGalleryImage(imageId, imageData, imageFile) {
    try {
        const imageRef = doc(db, 'gallery', imageId);
        
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'gallery');
            imageData.url = imageUrl;
        }
        
        await updateDoc(imageRef, imageData);
        return {
            id: imageId,
            ...imageData
        };
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'immagine:", error);
        throw error;
    }
}

// Funzione per eliminare un'immagine
export async function deleteGalleryImage(imageId) {
    try {
        const imageRef = doc(db, 'gallery', imageId);
        await deleteDoc(imageRef);
        return imageId;
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'immagine:", error);
        throw error;
    }
}

// Funzione per aggiornare l'ordine delle immagini
export async function updateGalleryOrder(imagesOrder) {
    try {
        const batch = writeBatch(db);
        
        imagesOrder.forEach((item, index) => {
            const imageRef = doc(db, 'gallery', item.id);
            batch.update(imageRef, { order: index + 1 });
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'ordine:", error);
        throw error;
    }
}