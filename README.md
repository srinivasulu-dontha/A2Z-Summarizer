# A2Z Summarizer 🚀

A full-stack, AI-powered document summarization tool built with FastAPI and a modern, glassmorphic UI. This application allows users to summarize plain text, PDFs, Word documents, and web articles using multiple extractive summarization algorithms.

## Features

- **Multi-format Support:** Summarize Text, PDF (`.pdf`), Word docs (`.docx`), and Web URLs.
- **Advanced Summarization Algorithms:** Choose between LSA, LexRank, Luhn, and TextRank.
- **Keyword Extraction:** Automatically identifies and tags the most important keywords in the document.
- **Audio Playback:** Built-in Text-to-Speech (TTS) reads the summary aloud.
- **Analytics:** Calculates the Compression Ratio and the Reading Time Saved.
- **Premium UI:** Highly responsive, dark-mode glassmorphism design with smooth animations and drag-and-drop file uploads.

## Tech Stack

- **Backend:** Python, FastAPI, Uvicorn
- **AI/NLP Libraries:** Sumy, Rake-NLTK, NLTK, Newspaper3k
- **Document Parsers:** PyPDF2, python-docx
- **Frontend:** Vanilla HTML, CSS, JavaScript (served via FastAPI StaticFiles)

## Installation & Setup

1. **Clone or Download the Repository**

2. **Create a Virtual Environment (Optional but recommended)**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download Required NLTK Data**
   Run the following Python script once to download the necessary NLP datasets:
   ```python
   python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('stopwords')"
   ```

## Running the Application

Start the FastAPI development server:
```bash
uvicorn main:app --reload
```

Then, open your web browser and navigate to:
**[http://localhost:8000](http://localhost:8000)**

## Usage

1. Select your input type from the tabs: **Text**, **Document**, or **URL**.
2. Choose your preferred **Algorithm** and **Summary Length** (number of sentences).
3. Click **Summarize Now**.
4. Once generated, you can listen to the audio, copy the summary, or download it as a text file.
