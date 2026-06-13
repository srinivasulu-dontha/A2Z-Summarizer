import nltk
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
import PyPDF2
import docx
from newspaper import Article, ArticleException
from rake_nltk import Rake

def read_pdf(file_bytes):
    from io import BytesIO
    pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

def read_docx(file_bytes):
    from io import BytesIO
    doc = docx.Document(BytesIO(file_bytes))
    return " ".join([para.text for para in doc.paragraphs])

def read_url(url):
    try:
        article = Article(url)
        article.download()
        article.parse()
        text = article.text
        if not text.strip():
            raise Exception("No text could be extracted from this URL.")
        return text
    except Exception as e:
        raise Exception(f"Unable to read URL: {str(e)}")

def extract_keywords(text, num_keywords=5):
    try:
        r = Rake()
        r.extract_keywords_from_text(text)
        # return the top `num_keywords` keywords
        return r.get_ranked_phrases()[:num_keywords]
    except Exception:
        return []

def summarize_extractive(text, algo="LSA", num_sentences=3):
    parser = PlaintextParser.from_string(text, Tokenizer("english"))

    if algo == "LSA":
        summarizer = LsaSummarizer()
    elif algo == "LexRank":
        summarizer = LexRankSummarizer()
    elif algo == "Luhn":
        summarizer = LuhnSummarizer()
    elif algo == "TextRank":
        summarizer = TextRankSummarizer()
    else:
        summarizer = LsaSummarizer()

    summary = summarizer(parser.document, num_sentences)
    return " ".join([str(sentence) for sentence in summary])

def process_text(text, algo="LSA", num_sentences=3):
    if not text.strip():
        raise ValueError("Empty text provided")
    
    summary = summarize_extractive(text, algo, num_sentences)
    keywords = extract_keywords(text)
    
    # Calculate stats
    original_words = len(text.split())
    summary_words = len(summary.split())
    compression_ratio = round((summary_words / original_words) * 100, 1) if original_words > 0 else 0
    reading_time_saved_sec = round(max(0, (original_words - summary_words) / 3.0)) # average 3 words per second (180 WPM)
    
    return {
        "summary": summary,
        "keywords": keywords,
        "stats": {
            "original_words": original_words,
            "summary_words": summary_words,
            "compression_ratio": compression_ratio,
            "reading_time_saved_sec": reading_time_saved_sec
        }
    }
