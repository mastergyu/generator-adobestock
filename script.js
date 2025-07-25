// ===================================================================================
// CATATAN PENTING UNTUK DEVELOPER
// ===================================================================================
// Aplikasi ini membuat permintaan (fetch) ke API Google Gemini.
// Karena kebijakan keamanan browser (CORS), aplikasi ini TIDAK AKAN BERJALAN
// jika Anda membuka file `index.html` secara langsung di browser.
//
// --- CARA MENJALANKANNYA ---
// 1. **Menggunakan GitHub Pages (Direkomendasikan):**
//    - Upload ketiga file ini (index.html, style.css, script.js) ke repositori GitHub.
//    - Di pengaturan repositori, aktifkan GitHub Pages dari branch `main`.
//    - Buka link yang diberikan (contoh: https://username.github.io/nama-repo/).
//
// 2. **Menggunakan Server Lokal (Untuk Development):**
//    - Buka folder proyek di Visual Studio Code.
//    - Install ekstensi "Live Server".
//    - Klik tombol "Go Live" di pojok kanan bawah.
// ===================================================================================


const fetchTrendsBtn = document.getElementById('fetch-trends-btn');
const keywordsContainer = document.getElementById('keywords-container');
const fetchFutureTrendsBtn = document.getElementById('fetch-future-trends-btn');
const futureKeywordsContainer = document.getElementById('future-keywords-container');
const contentContainer = document.getElementById('content-container');
const customKeywordInput = document.getElementById('custom-keyword-input');
const analyzeCustomBtn = document.getElementById('analyze-custom-btn');

let currentKeyword = '';

window.onload = () => {
    fetchTrendsBtn.addEventListener('click', fetchTrendingKeywords);
    fetchFutureTrendsBtn.addEventListener('click', fetchFutureTrends);
    
    analyzeCustomBtn.addEventListener('click', () => {
        const keyword = customKeywordInput.value.trim();
        if (keyword) {
            analyzeKeyword(keyword);
        } else {
            displayError(contentContainer, 'Harap masukkan keyword di kotak "Analisis Keyword Anda" terlebih dahulu.');
        }
    });
};

function displayError(container, message) {
    container.innerHTML = `<div class="p-4 text-center text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800 rounded-lg">${message}</div>`;
}

function showLoading(container, message) {
    container.innerHTML = `<div class="w-full text-center p-4"><div class="loader mx-auto"></div><p class="mt-2 text-sm">${message}</p></div>`;
}

async function fetchTrendingKeywords() {
    showLoading(keywordsContainer, 'Mencari tren...');
    fetchTrendsBtn.disabled = true;
    fetchTrendsBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const userPrompt = `You are an expert market analyst for Adobe Stock, focusing on the US market. Your task is to identify 15 commercially viable keywords that are trending *right now* for purchase on Adobe Stock. Think like a creative director or marketing manager looking for photos, illustrations, and videos. Focus on current US seasonal themes (summer, back-to-school, autumn prep), evergreen business concepts (e.g., 'data security', 'team collaboration'), and modern lifestyle imagery. **Crucially, you must exclude major one-off events from the past like 'Euro 2024'.** The keywords must be what US businesses are actively searching for this week. Provide the output as a valid JSON object with a key "keywords": ["keyword1", "keyword2", ...]. Keywords must be in English.`;

    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { "keywords": { type: "ARRAY", items: { type: "STRING" } } }, required: ["keywords"] }
    };
    const payload = { contents: [{ role: "user", parts: [{ text: userPrompt }] }], generationConfig };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
            displayKeywords(parsedJson.keywords, keywordsContainer);
        } else {
            if (result.candidates?.[0]?.finishReason === 'SAFETY') throw new Error("Respons diblokir karena keamanan.");
            throw new Error("Struktur respons API tidak valid.");
        }
    } catch (error) {
        console.error("Error fetching trends:", error);
        displayError(keywordsContainer, `Gagal mengambil tren: ${error.message}`);
    } finally {
        fetchTrendsBtn.disabled = false;
        fetchTrendsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

async function fetchFutureTrends() {
    showLoading(futureKeywordsContainer, 'Memprediksi tren...');
    fetchFutureTrendsBtn.disabled = true;
    fetchFutureTrendsBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const userPrompt = `As a predictive market analyst for Adobe Stock (US Market), forecast 10 commercially viable keywords expected to trend next week. Focus on demand for photos, illustrations, and videos. Base your prediction on upcoming US holidays, seasonal changes, anticipated cultural or business events. Provide the output as a valid JSON object with a single key "predicted_keywords" which is an array of 10 strings in English.`;

    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: { type: "OBJECT", properties: { "predicted_keywords": { type: "ARRAY", items: { "type": "STRING" } } }, required: ["predicted_keywords"] }
    };
    const payload = { contents: [{ role: "user", parts: [{ text: userPrompt }] }], generationConfig };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
            displayKeywords(parsedJson.predicted_keywords, futureKeywordsContainer, 'purple');
        } else {
             if (result.candidates?.[0]?.finishReason === 'SAFETY') throw new Error("Respons diblokir karena keamanan.");
            throw new Error("Struktur respons API tidak valid.");
        }
    } catch (error) {
        console.error("Error fetching future trends:", error);
        displayError(futureKeywordsContainer, `Gagal memprediksi tren: ${error.message}`);
    } finally {
        fetchFutureTrendsBtn.disabled = false;
        fetchFutureTrendsBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function displayKeywords(keywordsArray, container, color = 'blue') {
    container.innerHTML = '';
    keywordsArray.forEach(keyword => {
        const button = document.createElement('button');
        button.textContent = keyword;
        button.className = `keyword-btn px-3 py-2 bg-${color}-500 text-white rounded-lg hover:bg-${color}-600 dark:bg-${color}-600 dark:hover:bg-${color}-700 font-medium text-sm`;
        button.onclick = () => analyzeKeyword(keyword);
        container.appendChild(button);
    });
}

async function analyzeKeyword(keyword) {
    currentKeyword = keyword; 
    showLoading(contentContainer, `Menganalisis keyword "${keyword}"...`);

    const userPrompt = `As an expert Adobe Stock market analyst, provide a detailed commercial analysis for the keyword "${keyword}" specifically for the US market. Think like an Art Director buying assets for a campaign.
    Give me:
    1. "analysis": A short paragraph in INDONESIAN explaining the commercial reason this keyword is trending on Adobe Stock.
    2. "opportunity_score": An integer from 1 to 10.
    3. "target_audience": A short string in INDONESIAN listing specific commercial buyers.
    4. "photo_trend": A short string in INDONESIAN describing the most in-demand trend for **Photos** related to this keyword.
    5. "illustration_trend": A short string in INDONESIAN describing the most in-demand trend for **Illustrations** related to this keyword.
    6. "video_trend": A short string in INDONESIAN describing the most in-demand trend for **Videos** related to this keyword.
    7. "related_keywords": An array of 8 to 10 highly relevant keywords in ENGLISH.
    8. "visual_style_suggestion": A short string in INDONESIAN suggesting 2-3 suitable commercial visual styles.
    9. "background_suggestion": A short, specific suggestion for the background, focusing on commercial usability.

    Provide the output as a single, valid JSON object with these exact keys.`;

    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: { 
            type: "OBJECT", 
            properties: { 
                "analysis": { "type": "STRING" }, "opportunity_score": { "type": "NUMBER" }, "target_audience": { "type": "STRING" },
                "photo_trend": { "type": "STRING" }, "illustration_trend": { "type": "STRING" }, "video_trend": { "type": "STRING" },
                "related_keywords": { "type": "ARRAY", "items": { "type": "STRING" } },
                "visual_style_suggestion": { "type": "STRING" }, "background_suggestion": { "type": "STRING" }
            }, 
            required: ["analysis", "opportunity_score", "target_audience", "photo_trend", "illustration_trend", "video_trend", "related_keywords", "visual_style_suggestion", "background_suggestion"] 
        }
    };
    
    const payload = { contents: [{ role: "user", parts: [{ text: userPrompt }] }], generationConfig };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: { message: "Gagal mem-parsing respons error." } }));
            throw new Error(errorData.error.message || `API request failed: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const jsonText = result.candidates[0].content.parts[0].text;
            const analysisData = JSON.parse(jsonText);
            displayAnalysis(analysisData);
        } else {
             if (result.candidates?.[0]?.finishReason === 'SAFETY') throw new Error("Respons diblokir karena keamanan.");
            throw new Error("Struktur respons API tidak valid.");
        }
    } catch (error) {
         console.error("Error analyzing keyword:", error);
        displayError(contentContainer, `Gagal menganalisis keyword: ${error.message}`);
    }
}

function displayAnalysis(data) {
    contentContainer.innerHTML = ''; 
    const googleTrendsUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(currentKeyword)}&geo=US&gprop=images&date=today%201-m`;

    const card = document.createElement('div');
    card.className = 'analysis-card bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700';
    
    card.innerHTML = `
        <h3 class="text-2xl font-bold text-blue-600 dark:text-blue-400">${currentKeyword}</h3>
        
        <div class="mt-4">
            <h4 class="font-semibold text-lg">Analisis Komersial (Simulasi AI)</h4>
            <p class="mt-1 text-gray-700 dark:text-gray-300">${data.analysis}</p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-6 border-t pt-6 border-gray-200 dark:border-gray-600">
            <div>
                <h4 class="font-semibold text-lg">Skor Peluang</h4>
                <p class="text-3xl font-bold text-green-500">${data.opportunity_score}/10</p>
            </div>
             <div>
                <h4 class="font-semibold text-lg">Target Pembeli Komersial</h4>
                <p class="mt-1 text-gray-700 dark:text-gray-300">${data.target_audience}</p>
            </div>
        </div>
        
        <div class="mt-6 border-t pt-6 border-gray-200 dark:border-gray-600">
            <h4 class="font-semibold text-lg">Fokus Tren Aset Spesifik</h4>
            <div class="mt-2 grid grid-cols-1 gap-4">
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p class="font-semibold text-gray-800 dark:text-gray-200">📷 Tren untuk Foto:</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${data.photo_trend}</p>
                </div>
                <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p class="font-semibold text-gray-800 dark:text-gray-200">🎨 Tren untuk Ilustrasi:</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${data.illustration_trend}</p>
                </div>
                 <div class="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p class="font-semibold text-gray-800 dark:text-gray-200">🎬 Tren untuk Video:</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${data.video_trend}</p>
                </div>
            </div>
        </div>

        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6 border-gray-200 dark:border-gray-600">
             <div>
                <h4 class="font-semibold text-lg">Gaya Visual yang Laku</h4>
                <p class="mt-1 text-gray-700 dark:text-gray-300">${data.visual_style_suggestion}</p>
            </div>
            <div>
                <h4 class="font-semibold text-lg">Saran Latar Belakang</h4>
                <p class="mt-1 text-gray-700 dark:text-gray-300">${data.background_suggestion}</p>
            </div>
        </div>
        
        <div class="mt-6 border-t pt-6 border-gray-200 dark:border-gray-600">
            <h4 class="font-semibold text-lg">Keyword Terkait (English)</h4>
            <div class="flex flex-wrap gap-2 mt-2">
               ${data.related_keywords.map(kw => `<span class="related-kw bg-gray-200 dark:bg-gray-600 text-sm px-2 py-1 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500" onclick="analyzeKeyword('${kw}')">${kw}</span>`).join('')}
            </div>
        </div>

        <button id="generate-prompts-btn" class="w-full mt-8 px-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-300">Buatkan Prompt dari Keyword Ini</button>
    `;
    
    contentContainer.appendChild(card);
    document.getElementById('generate-prompts-btn').onclick = () => generatePrompts(currentKeyword);
}

async function generatePrompts(keyword) {
    currentKeyword = keyword; 
    showLoading(contentContainer, `Membuat prompt untuk "${keyword}"...`);
    
    const userPrompt = `As a world-class prompt engineer for AI image generators, create a set of prompts for the keyword "${keyword}". 
    **Instructions:**
    1.  The output must be a valid JSON object.
    2.  The JSON object should contain three keys: "photo_prompts", "illustration_prompts", and "video_prompts".
    3.  Each key must contain an array of exactly 2 detailed, creative, and distinct prompts in ENGLISH.
    4.  **Photo prompts** should be suitable for a high-end camera.
    5.  **Illustration prompts** should describe a vector or digital painting style.
    6.  **Video prompts** should describe a short, cinematic video clip.`;
    
    const generationConfig = {
        responseMimeType: "application/json",
        responseSchema: { 
            type: "OBJECT", 
            properties: { 
                "photo_prompts": { "type": "ARRAY", "items": { "type": "STRING" } },
                "illustration_prompts": { "type": "ARRAY", "items": { "type": "STRING" } },
                "video_prompts": { "type": "ARRAY", "items": { "type": "STRING" } }
            },
            required: ["photo_prompts", "illustration_prompts", "video_prompts"]
        }
    };

    const payload = { contents: [{ role: "user", parts: [{ text: userPrompt }] }], generationConfig };
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
         const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: { message: "Gagal mem-parsing respons error." } }));
            throw new Error(errorData.error.message || `API request failed: ${response.status}`);
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
             const jsonText = result.candidates[0].content.parts[0].text;
            const parsedJson = JSON.parse(jsonText);
            displayPrompts(parsedJson);
        } else {
             if (result.candidates?.[0]?.finishReason === 'SAFETY') throw new Error("Respons diblokir karena keamanan.");
            throw new Error("Struktur respons API tidak valid.");
        }
    } catch (error) {
        console.error("Error generating prompts:", error);
        displayError(contentContainer, `Gagal membuat prompt: ${error.message}`);
    }
}

function displayPrompts(promptsData) {
    contentContainer.innerHTML = ''; 
    
    const keywordTitle = document.createElement('h3');
    keywordTitle.textContent = currentKeyword;
    keywordTitle.className = "text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4";
    contentContainer.appendChild(keywordTitle);

    const createPromptSection = (title, promptsArray) => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-6';

        const sectionTitle = document.createElement('h4');
        sectionTitle.className = 'text-xl font-semibold mb-3 pb-2 border-b border-gray-300 dark:border-gray-600';
        sectionTitle.textContent = title;
        sectionDiv.appendChild(sectionTitle);

        promptsArray.forEach(promptText => {
            const card = document.createElement('div');
            card.className = 'prompt-card bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3';
            
            const promptContent = document.createElement('p');
            promptContent.textContent = promptText;
            promptContent.className = 'text-gray-700 dark:text-gray-300';
            
            const copyButton = document.createElement('button');
            copyButton.textContent = 'Salin Prompt';
            copyButton.className = 'mt-3 px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-md hover:bg-green-600';
            copyButton.onclick = () => copyToClipboard(promptText, copyButton);

            card.appendChild(promptContent);
            card.appendChild(copyButton);
            sectionDiv.appendChild(card);
        });
        return sectionDiv;
    }
    
    contentContainer.appendChild(createPromptSection('📷 Prompts untuk Foto', promptsData.photo_prompts));
    contentContainer.appendChild(createPromptSection('🎨 Prompts untuk Ilustrasi', promptsData.illustration_prompts));
    contentContainer.appendChild(createPromptSection('🎬 Prompts untuk Video', promptsData.video_prompts));
    
    const generateAgainBtn = document.createElement('button');
    generateAgainBtn.textContent = 'Hasilkan Varian Lain';
    generateAgainBtn.className = 'w-full mt-4 px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-300';
    generateAgainBtn.onclick = () => generatePrompts(currentKeyword); 
    contentContainer.appendChild(generateAgainBtn);
}

function copyToClipboard(text, buttonElement) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        buttonElement.textContent = 'Tersalin!';
        buttonElement.classList.replace('bg-green-500', 'bg-gray-500');
        
        setTimeout(() => {
            buttonElement.textContent = 'Salin Prompt';
            buttonElement.classList.replace('bg-gray-500', 'bg-green-500');
        }, 2000);
    } catch (err) {
        console.error('Gagal menyalin teks: ', err);
        buttonElement.textContent = 'Gagal!';
    }
    document.body.removeChild(textarea);
}
    </script>
</body>
</html>
