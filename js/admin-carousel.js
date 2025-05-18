import { db, storage, uploadImage } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Riferimento alla collezione carosello
const carouselCollection = collection(db, 'carousel');

// Funzione per caricare tutte le slide dal database
export async function loadCarouselSlides() {
    try {
        const slidesQuery = query(carouselCollection, orderBy('order'));
        const querySnapshot = await getDocs(slidesQuery);
        const slides = [];
        
        querySnapshot.forEach((doc) => {
            slides.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return slides;
    } catch (error) {
        console.error("Errore durante il caricamento delle slide:", error);
        throw error;
    }
}

// Funzione per aggiungere una nuova slide
export async function addCarouselSlide(slideData, imageFile) {
    try {
        // Determina l'ordine della nuova slide
        const slides = await loadCarouselSlides();
        const newOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) + 1 : 1;
        slideData.order = newOrder;
        
        // Carica l'immagine
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'carousel');
            slideData.image = imageUrl;
        }
        
        const docRef = await addDoc(carouselCollection, slideData);
        return {
            id: docRef.id,
            ...slideData
        };
    } catch (error) {
        console.error("Errore durante l'aggiunta della slide:", error);
        throw error;
    }
}

// Funzione per aggiornare una slide esistente
export async function updateCarouselSlide(slideId, slideData, imageFile) {
    try {
        const slideRef = doc(db, 'carousel', slideId);
        
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'carousel');
            slideData.image = imageUrl;
        }
        
        await updateDoc(slideRef, slideData);
        return {
            id: slideId,
            ...slideData
        };
    } catch (error) {
        console.error("Errore durante l'aggiornamento della slide:", error);
        throw error;
    }
}

// Funzione per eliminare una slide
export async function deleteCarouselSlide(slideId) {
    try {
        const slideRef = doc(db, 'carousel', slideId);
        await deleteDoc(slideRef);
        return slideId;
    } catch (error) {
        console.error("Errore durante l'eliminazione della slide:", error);
        throw error;
    }
}

// Funzione per aggiornare l'ordine delle slide
export async function updateCarouselOrder(slidesOrder) {
    try {
        const batch = writeBatch(db);
        
        slidesOrder.forEach((item, index) => {
            const slideRef = doc(db, 'carousel', item.id);
            batch.update(slideRef, { order: index + 1 });
        });
        
        await batch.commit();
        return true;
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'ordine:", error);
        throw error;
    }
}