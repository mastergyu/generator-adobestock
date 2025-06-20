document.addEventListener("DOMContentLoaded", () => {
  const contentContainer = document.getElementById("content-container");

  const showLoading = (message) => {
    contentContainer.innerHTML = \`<div class="text-center py-16">
      <div class="loader mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-300">\${message}</p>
    </div>\`;
  };

  const updateResults = (data, label) => {
    contentContainer.innerHTML = \`<div>
      <h3 class="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">\${label}</h3>
      <ul class="list-disc pl-5 space-y-2">\${data.map(item => `<li>\${item}</li>`).join('')}</ul>
    </div>\`;
  };

  const fetchTrends = () => {
    showLoading("Mengambil tren komersial terkini...");
    setTimeout(() => {
      updateResults(["flat design", "isometric office", "3d avatar business", "futuristic workspace"], "Tren Komersial Minggu Ini");
    }, 1000);
  };

  const fetchFutureTrends = () => {
    showLoading("Memprediksi tren viral minggu depan...");
    setTimeout(() => {
      updateResults(["ai technology", "eco lifestyle", "minimalist fashion", "space tourism"], "Prediksi Tren Masa Depan");
    }, 1000);
  };

  const analyzeCustomKeyword = () => {
    const input = document.getElementById("custom-keyword-input").value.trim();
    if (!input) return alert("Masukkan keyword terlebih dahulu.");
    showLoading("Menganalisis keyword: " + input);
    setTimeout(() => {
      updateResults([input + " illustration", input + " concept", input + " flat design", input + " commercial trend"], "Analisis: " + input);
    }, 1000);
  };

  document.getElementById("fetch-trends-btn").addEventListener("click", fetchTrends);
  document.getElementById("fetch-future-trends-btn").addEventListener("click", fetchFutureTrends);
  document.getElementById("analyze-custom-btn").addEventListener("click", analyzeCustomKeyword);
});
