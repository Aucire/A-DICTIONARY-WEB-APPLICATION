const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const resultEl = document.getElementById('result');

async function fetchWord(word) {
    if (!word) return;
    resultEl.innerHTML = `<div class="text-slate-400">Loading “${word}”…</div>`;
    try {
        const res = await fetch(API_BASE + encodeURIComponent(word));
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        renderData(data[0]);
    } catch (err) {
        resultEl.innerHTML = `<div class="text-rose-400">No results for “${word}”. Try another word.</div>`;
        console.error(err);
    }
}

function renderData(data) {
    const phonetic = data.phonetic || (data.phonetics && data.phonetics.find(p => p.text)?.text) || '';
    const audioUrl = (data.phonetics && data.phonetics.find(p => p.audio)?.audio) || '';

    const meaningsHtml = data.meanings.map(meaning => {
        const defs = meaning.definitions.map(d => {
            const synonyms = (d.synonyms && d.synonyms.length) ?
                `<div class="mt-2 flex flex-wrap gap-2">${d.synonyms.map(s => `<span class="chip">${s}</span>`).join('')}</div>` : '';
            const example = d.example ? `<div class="text-slate-300 mt-1 italic">“${d.example}”</div>` : '';
            return `<div class="mb-3"><div class="font-medium">• ${d.definition}</div>${example}${synonyms}</div>`;
        }).join('');
        return `<div class="mb-4"><div class="text-sm text-slate-300 mb-1">${meaning.partOfSpeech}</div>${defs}</div>`;
    }).join('');

    resultEl.innerHTML = `
        <div class="flex items-start justify-between">
            <div>
                <div class="text-3xl font-bold">${data.word}</div>
                <div class="text-slate-300 text-xl mt-2">${phonetic}</div>
                <div class="text-sm text-slate-400 mt-1">${data.origin ? data.origin : ''}</div>
            </div>
            <div class="flex items-center gap-3">
                ${audioUrl ? `<button id="play-audio" class="px-2 py-1 bg-accent text-red-600 rounded-xl font-semibold border border-1">Play Audio</button>` : ''}
            </div>
        </div>
        <div class="mt-4">${meaningsHtml}</div>
    `;

    if (audioUrl) {
        const btn = document.getElementById('play-audio');
        btn.addEventListener('click', () => {
            const audio = new Audio(audioUrl);
            audio.play().catch(e => console.error('Playback failed', e));
        })
    }
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const word = input.value.trim();
    if (word) fetchWord(word);
});

// example quick buttons
document.querySelectorAll('.example').forEach(btn => {
    btn.addEventListener('click', e => {
        const w = e.target.textContent.trim();
        input.value = w; fetchWord(w);
    })
});

// Load a friendly default
fetchWord('play');
