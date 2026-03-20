# MediSimplify AI 🏥🤖

An Intelligent Medical Report Simplification & Health Intelligence Platform built for Hackathon excellence.

## Overview
MediSimplify AI empowers patients by transforming complex, jargon-heavy medical diagnostics reports (PDFs or images) into plain language. Utilizing the blazing speed of the **Groq API** with LLaMA 3.3 70B, it translates dense clinical findings into a color-coded, easy-to-understand dashboard. 

The application further enhances accessibility with dynamic visualizations, multi-language support, multi-report comparisons, symptom checking, and text-to-speech features.

## Tech Stack
- **Frontend / Framework:** Streamlit
- **AI / LLM Inference:** Groq API (LLaMA 3.3 70B)
- **Data Extractor:** PyPDF2 (PDF parsing), Pytesseract (OCR)
- **Image Processing:** Pillow
- **Data Visualization:** Plotly
- **PDF Generation:** ReportLab
- **Utilities:** Python-Dotenv, Pandas

## Features

1. **Intelligent File Processing**
   - Extracts text from multi-page PDFs.
   - Robust OCR for images with Pillow-based image preprocessing (grayscale, contrast boost) for low-quality scans.
   - Smart truncation to preserve the most relevant medical data within token limits.

2. **Groq AI powered simplification**
   - Evaluates lab values against age and gender reference ranges.
   - Classifies findings (Normal, Attention Required, Critical).
   - Translates medical jargon into plain English.
   - Suggests lifestyle modifications and generating questions for your next doctor's visit.
   - Calculates a custom "Health Score".

3. **Visual Health Dashboard**
   - Horizontal Bar Charts comparing values against normal bounds.
   - Gauge Charts for your overall Health Score.
   - Pie Charts reflecting the distribution of finding severities.

4. **Accessibility & Patient Experience**
   - Multilingual output (English, Hindi, Spanish).
   - "Read Report Aloud" text-to-speech integration.
   - Session-based Report History to jump between past uploads without reprocessing.
   - Multi-report capabilities for side-by-side comparison.

5. **Advanced Interactive Elements**
   - Symptom-checker contextual prompt augmentation.
   - Immediate Emergency Banner for critical lab results.
   - Downloadable formatted PDF reports for printing.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd medsimplify
   ```

2. **Create a virtual environment (Optional but Recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # on Windows: .\venv\Scripts\activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Install Tesseract-OCR (if not already installed):**
   - **Windows:** Download the installer from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) and ensure it's in your system PATH.
   - **MacOS:** `brew install tesseract`
   - **Linux/Ubuntu:** `sudo apt-get install tesseract-ocr`

5. **Set up Environment Variables:**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and add your **Groq API Key**:
     ```env
     GROQ_API_KEY=your_actual_key_here
     ```

## How to Run

Execute the Streamlit app from your terminal:
```bash
streamlit run app.py
```

The app will open automatically in your browser at `http://localhost:8501`.

## Structure
- `app.py`: Main application logic housing UI configuration, file processing, Prompting, and Dashboard rendering.
- `requirements.txt`: Python package dependencies.
- `.env.example`: Environment variables template.
- `README.md`: Project documentation.
