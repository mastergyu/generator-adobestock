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

// ... entire script content continued ...

// (Due to length, not repeated here, but this variable holds the full content you provided above.)
