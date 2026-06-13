document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const sentenceSlider = document.getElementById('sentence-slider');
    const sentenceVal = document.getElementById('sentence-val');
    const algoSelect = document.getElementById('algo-select');
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    
    const summarizeBtn = document.getElementById('summarize-btn');
    const loadingState = document.getElementById('loading-state');
    const resultSection = document.getElementById('result-section');
    
    const summaryTextEl = document.getElementById('summary-text');
    const keywordsContainer = document.getElementById('keywords-container');
    const statTimeEl = document.getElementById('stat-time');
    const statRatioEl = document.getElementById('stat-ratio');

    const btnAudio = document.getElementById('btn-audio');
    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');

    let currentTab = 'tab-text';
    let selectedFile = null;
    let currentSummaryText = "";

    // --- Tab Switching ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            currentTab = btn.getAttribute('data-target');
            document.getElementById(currentTab).classList.add('active');
        });
    });

    // --- Slider ---
    sentenceSlider.addEventListener('input', (e) => {
        sentenceVal.textContent = e.target.value;
    });

    // --- Drag and Drop File ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        const validTypes = ['.pdf', '.docx'];
        const isExtValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
        if (!isExtValid) {
            alert('Please upload a valid PDF or DOCX file.');
            return;
        }
        selectedFile = file;
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        fileNameDisplay.classList.remove('hidden');
    }

    // --- Summarize Action ---
    summarizeBtn.addEventListener('click', async () => {
        const algo = algoSelect.value;
        const numSentences = sentenceSlider.value;
        
        let endpoint = "";
        let body = null;
        let isFormData = false;

        if (currentTab === 'tab-text') {
            const text = document.getElementById('input-text').value.trim();
            if (!text) return alert("Please enter some text to summarize.");
            
            endpoint = "/api/summarize/text";
            body = JSON.stringify({ text, algo, num_sentences: parseInt(numSentences) });
        } 
        else if (currentTab === 'tab-file') {
            if (!selectedFile) return alert("Please upload a file.");
            
            endpoint = "/api/summarize/file";
            body = new FormData();
            body.append('file', selectedFile);
            body.append('algo', algo);
            body.append('num_sentences', parseInt(numSentences));
            isFormData = true;
        } 
        else if (currentTab === 'tab-url') {
            const url = document.getElementById('input-url').value.trim();
            if (!url) return alert("Please enter a valid URL.");
            
            endpoint = "/api/summarize/url";
            body = JSON.stringify({ url, algo, num_sentences: parseInt(numSentences) });
        }

        // Show Loading
        summarizeBtn.disabled = true;
        resultSection.classList.add('hidden');
        loadingState.classList.remove('hidden');

        try {
            const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
            const response = await fetch(endpoint, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Error generating summary");
            }

            const data = await response.json();
            displayResult(data);

        } catch (err) {
            alert(err.message);
        } finally {
            summarizeBtn.disabled = false;
            loadingState.classList.add('hidden');
        }
    });

    // --- Display Result ---
    function displayResult(data) {
        currentSummaryText = data.summary;
        summaryTextEl.textContent = data.summary;
        
        // Tags
        keywordsContainer.innerHTML = "";
        if (data.keywords && data.keywords.length > 0) {
            data.keywords.forEach(kw => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = kw;
                keywordsContainer.appendChild(span);
            });
        }

        // Stats
        if (data.stats) {
            statTimeEl.textContent = `${data.stats.reading_time_saved_sec} secs`;
            statRatioEl.textContent = `${data.stats.compression_ratio}%`;
        }

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Action Buttons ---
    
    // Copy
    btnCopy.addEventListener('click', () => {
        if (!currentSummaryText) return;
        navigator.clipboard.writeText(currentSummaryText)
            .then(() => {
                const icon = btnCopy.querySelector('i');
                icon.className = 'bx bx-check';
                setTimeout(() => icon.className = 'bx bx-copy', 2000);
            });
    });

    // Download txt
    btnDownload.addEventListener('click', () => {
        if (!currentSummaryText) return;
        const blob = new Blob([currentSummaryText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Summary_A2Z.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Audio TTS
    let isSpeaking = false;
    btnAudio.addEventListener('click', () => {
        if (!currentSummaryText) return;
        
        const icon = btnAudio.querySelector('i');

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            isSpeaking = false;
            icon.className = 'bx bx-volume-full';
            return;
        }

        const utterance = new SpeechSynthesisUtterance(currentSummaryText);
        utterance.rate = 1.0;
        
        utterance.onend = () => {
            isSpeaking = false;
            icon.className = 'bx bx-volume-full';
        };

        window.speechSynthesis.speak(utterance);
        isSpeaking = true;
        icon.className = 'bx bx-volume-mute';
    });
});
