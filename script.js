import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    deleteDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyC-aXJvlnautMqIi-_4TuqaWnkpUN1hoz0",
  authDomain: "family-vocab-app.firebaseapp.com",
  projectId: "family-vocab-app",
  storageBucket: "family-vocab-app.firebasestorage.app",
  messagingSenderId: "787018356976",
  appId: "1:787018356976:web:7e137e24e0c1cc4d4b8a35",
  measurementId: "G-Y62QB9HCHV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const vocabCol = collection(db, "vocabulary");

// Listen for data
onSnapshot(query(vocabCol, orderBy("timestamp", "desc")), (snapshot) => {
    const words = [];
    snapshot.forEach(docSnap => {
        // We MUST capture the docSnap.id here to delete it later
        words.push({ id: docSnap.id, ...docSnap.data() });
    });
    renderList(words);
    updateWordOfTheDay(words);
});

function renderList(words) {
    const wordList = document.getElementById('wordList');
    if (words.length === 0) {
        wordList.innerHTML = `<p class="text-center text-slate-400 mt-10">No words yet. Click + to add one!</p>`;
        return;
    }

    wordList.innerHTML = words.map(w => `
        <div class="word-card bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-bold text-indigo-900">${w.word}</h3>
                <button onclick="confirmDelete('${w.id}', '${w.word.replace(/'/g, "\\'")}')" 
                        class="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete word">
                    🗑️
                </button>
            </div>
            <p class="text-slate-600 text-sm mb-3">${w.meaning}</p>
            <div class="p-3 bg-indigo-50 rounded-xl border-l-4 border-indigo-400">
                <p class="text-xs text-indigo-800 italic">"${w.example}"</p>
            </div>
        </div>
    `).join('');
}

// Global Delete Function
window.confirmDelete = async (id, wordName) => {
    // 1. Ask for confirmation
    const check = confirm(`Are you sure you want to delete "${wordName}"?`);
    
    if (check) {
        try {
            // 2. Reference the specific document by its ID
            const docRef = doc(db, "vocabulary", id);
            
            // 3. Attempt to delete
            await deleteDoc(docRef);
            
            console.log("Document successfully deleted!");
        } catch (error) {
            console.error("Error removing document: ", error);
            alert("Delete failed. Check your Firebase Rules! Error: " + error.message);
        }
    }
};

// Save Function
window.saveWord = async () => {
    const word = document.getElementById('newWord').value.trim();
    const meaning = document.getElementById('newMeaning').value.trim();
    const example = document.getElementById('newExample').value.trim();

    if (word && meaning) {
        await addDoc(vocabCol, {
            word, meaning, example,
            timestamp: serverTimestamp()
        });
        window.closeModal();
        document.getElementById('newWord').value = '';
        document.getElementById('newMeaning').value = '';
        document.getElementById('newExample').value = '';
    }
};

// Word of the Day logic
function updateWordOfTheDay(words) {
    if (words.length === 0) return;
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const dailyWord = words[dayOfYear % words.length];
    document.getElementById('wotd-title').innerText = dailyWord.word;
    document.getElementById('wotd-meaning').innerText = dailyWord.meaning;
}

// Modal Helpers
window.openModal = () => document.getElementById('modal').classList.remove('hidden');
window.closeModal = () => document.getElementById('modal').classList.add('hidden');