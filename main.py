import os
import io
import json
import re
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import PyPDF2
import pytesseract
from PIL import Image, ImageOps, ImageEnhance
from dotenv import load_dotenv
from groq import Groq



if os.name == 'nt':  # Windows local
    pytesseract.pytesseract.tesseract_cmd = r'C:\Users\psvt2\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
else:  # Linux Render Docker
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

# Load environment variables
load_dotenv(override=True)

app = FastAPI(title="MediSimplify AI API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# FILE PROCESSING MODULE
# ==========================================
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            new_text = page.extract_text()
            if new_text:
                text += new_text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def extract_text_from_image(file_bytes: bytes) -> str:
    try:
        img = Image.open(io.BytesIO(file_bytes))
        
        # Optimization: Resize large images to dramatically speed up Tesseract OCR
        max_dim = 1600
        if img.width > max_dim or img.height > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            
        img = ImageOps.grayscale(img)
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(2.0)
        
        text = pytesseract.image_to_string(img)
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading Image: {str(e)}")

def clean_and_truncate_text(text: str, max_chars: int = 15000) -> str:
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > max_chars:
        text = text[:max_chars] + "\n...[TRUNCATED TO PRESERVE TOKEN LIMITS]..."
    return text

# ==========================================
# GROQ AI INTEGRATION MODULE
# ==========================================
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API Key not found in environment.")
    return Groq(api_key=api_key)

def build_system_prompt(patient_name: str, age: int, gender: str, language: str, symptoms: str = ""):
    context = ""
    if symptoms:
        context = f"\nThe patient is currently experiencing the following symptoms: {symptoms}. Please link any relevant findings to these symptoms."

    system_prompt = f"""You are a Senior Healthcare AI Assistant. 
Your goal is to interpret medical diagnostic reports for a patient named {patient_name} (Age: {age}, Gender: {gender}).
Translate all medical jargon into plain language.

Instructions:
1. Extract all lab values and compare them against standard reference ranges for a {age}-year-old {gender}.
2. Classify every finding as exactly one of: "Normal", "Attention Required", or "Critical".
3. Provide an organ-system wise breakdown (e.g., Cardiovascular, Renal, Hepatic).
4. Calculate a 'Health Score' out of 100 based on the proportion and severity of abnormal findings. 100 is perfectly healthy.
5. Create 5 specific, intelligent questions for the patient to ask their doctor.
6. Suggest lifestyle recommendations (diet, exercise).
7. Assign a Confidence level (High/Medium/Low) for each finding based on data clarity.
{context}

Output Language: MUST BE ENTIRELY IN {language.upper()} (Except for technical JSON keys).

OUTPUT FORMAT REQUIRED:
You must return your output in TWO parts.
First, a clean, markdown-formatted Patient Summary structured strictly with brackets and headers (NO generic "Section 1" keywords). Format it like so:

## [Patient Profile]
* **Name**: {patient_name}
* **Age/Gender**: {age} / {gender}
* **Primary Language**: {language}

## [Clinical Overview]
Provide a plain-language summary of the perceived disease, condition, and any symptoms explicitly stated or found.

## [Medical Oversight]
Identify the doctor, hospital, and outline the recommended next steps.

Second, exactly one JSON block formatted exactly like this enclosed in ```json and ``` at the very end of your response:
```json
{{
  "health_score": 85,
  "critical_alert": false,
  "disease_prediction": "Extracted presumed disease or condition",
  "doctor_name": "Extracted Doctor Name (or 'Unspecified')",
  "hospital_name": "Extracted Hospital Name (or 'Unspecified')",
  "symptoms_found": "Extracted Symptoms",
  "lab_values": [
    {{"name": "Total Cholesterol", "value": 240, "unit": "mg/dL", "range": "<200", "severity": "Attention Required", "confidence": "High"}}
  ],
  "class_distribution": {{"Normal": 10, "Attention Required": 2, "Critical": 0}}
}}
```
Make sure the JSON block is perfectly formatted.
"""
    return system_prompt

def parse_ai_response(full_response: str):
    try:
        json_pattern = re.search(r'```json\n(.*?)\n```', full_response, re.DOTALL)
        if json_pattern:
            data = json.loads(json_pattern.group(1))
            markdown_part = full_response.replace(json_pattern.group(0), "").strip()
            return markdown_part, data
    except Exception as e:
        pass
    return full_response, None

# ==========================================
# ENDPOINTS
# ==========================================
class AnalyzeTextRequest(BaseModel):
    text: str
    patient_name: str = "John Doe"
    age: int = 30
    gender: str = "Male"
    language: str = "English"
    symptoms: str = ""

@app.post("/api/analyze-text")
async def analyze_text(req: AnalyzeTextRequest):
    raw_text = clean_and_truncate_text(req.text)
    
    client = get_groq_client()
    sys_prompt = build_system_prompt(req.patient_name, req.age, req.gender, req.language, req.symptoms)
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": f"Here is the medical report text:\n{raw_text}"}
            ],
            temperature=0.2
        )
        
        full_response = completion.choices[0].message.content
        markdown_part, data = parse_ai_response(full_response)
        
        return {
            "raw_text": raw_text,
            "markdown": markdown_part,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    patient_name: str = Form("John Doe"),
    age: int = Form(30),
    gender: str = Form("Male"),
    language: str = Form("English"),
    symptoms: str = Form("")
):
    # Read file bytes
    file_bytes = await file.read()
    
    # Check size (10MB limit)
    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10MB limit.")
        
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        raw_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(('.png', '.jpg', '.jpeg')):
        raw_text = extract_text_from_image(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format.")
        
    raw_text = clean_and_truncate_text(raw_text)
    
    # Call Groq
    client = get_groq_client()
    sys_prompt = build_system_prompt(patient_name, age, gender, language, symptoms)
    
    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": f"Here is the medical report text:\n{raw_text}"}
            ],
            temperature=0.2
        )
        
        full_response = completion.choices[0].message.content
        markdown_part, data = parse_ai_response(full_response)
        
        return {
            "filename": file.filename,
            "raw_text": raw_text,
            "markdown": markdown_part,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
