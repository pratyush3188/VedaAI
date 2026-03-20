# 🏥 Veda AI — Your Medical Report, Finally Understood.

> AI powered medical report simplification system that transforms complex diagnostic reports into clear, patient friendly health insights in under 2 seconds.

---

## ✨ Features
- Upload medical reports as PDF, Image or Plain Text
- AI simplification using LLaMA 3.3 70B via Groq API
- Color coded findings — Normal, Abnormal, Critical
- Health Score out of 100
- Emergency alert for Critical findings
- Multilingual output — English, Hindi, Spanish, French
- Download simplified report as PDF or Markdown
- Patient health history stored in MongoDB

---

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Uvicorn |
| AI | Groq API, LLaMA 3.3 70B |
| Document Processing | PyPDF2, Tesseract OCR, Pillow |
| Database | MongoDB |
| Deployment | Docker, Render, Vercel |

---

## 🚀 Run Locally

**Backend**
```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables
```env
GROQ_API_KEY=your_groq_api_key_here
```

---

## ⚠️ Disclaimer
Veda AI is for informational purposes only. Always consult a qualified healthcare professional for proper medical advice.

---

⭐ Built with ❤️ by JECRC University — IAESTE LC JECRC