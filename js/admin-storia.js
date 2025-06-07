import { db, storage, uploadImage } from './firebase-config.js';
import { collection, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Riferimento al documento storia (useremo un singolo documento)
const storiaDocRef = doc(db, 'settings', 'storia');

// Funzione per caricare i dati della storia
export async function loadStoria() {
    try {
        const docSnap = await getDoc(storiaDocRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Dati di default se non esistono
            return {
                titolo: "La Nostra Storia",
                sottotitolo: "Come è iniziato tutto",
                contenuto: `<p>La storia di PIZZIAMO?! inizia nel 2010, quando il nostro fondatore Marco, dopo anni di esperienza nelle migliori pizzerie italiane, decide di aprire la sua attività a Ferrara con una missione chiara: offrire pizze di altissima qualità con ingredienti freschi e a km zero.</p>
                <p>Quello che è iniziato come un piccolo locale con pochi tavoli è diventato negli anni un punto di riferimento per gli amanti della pizza in città, grazie alla costante ricerca della perfezione e all'amore per la tradizione culinaria italiana.</p>
                <p>Nel corso degli anni abbiamo ampliato il locale, migliorato continuamente le nostre ricette e creato un team di professionisti appassionati che condividono la nostra filosofia: la pizza non è solo cibo, è un'esperienza.</p>`,
                anno: "2010",
                immagine: "img/pizza1.jpg"
            };
        }
    } catch (error) {
        console.error("Errore durante il caricamento della storia:", error);
        throw error;
    }
}

// Funzione per salvare i dati della storia
export async function saveStoria(storiaData, imageFile) {
    try {
        // Se c'è una nuova immagine, caricala
        if (imageFile) {
            const imageUrl = await uploadImage(imageFile, 'storia');
            storiaData.immagine = imageUrl;
        }
        
        // Salva i dati nel database
        await setDoc(storiaDocRef, storiaData);
        
        return storiaData;
    } catch (error) {
        console.error("Errore durante il salvataggio della storia:", error);
        throw error;
    }
}