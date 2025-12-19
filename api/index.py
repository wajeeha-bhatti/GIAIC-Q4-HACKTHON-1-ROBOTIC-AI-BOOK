# Import necessary modules for Vercel API function
import os
import sys
import glob
from urllib.parse import urlparse

# Add backend directory to path to import functions
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

# Load env
load_dotenv()

# CORS configuration based on environment
if os.getenv("ENVIRONMENT") == "production":
    # Production: Allow Vercel deployment URL and localhost for development
    origins = [
        "https://your-vercel-project.vercel.app",  # Replace with your actual Vercel URL
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:8080",
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Create React App default
        "https://*.vercel.app",  # Wildcard for Vercel previews
    ]
else:
    # Development: Allow all origins
    origins = ["*"]

# Setup App
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is required")
client = genai.Client(api_key=api_key)

class QueryRequest(BaseModel):
    query: str

def get_project_context(user_query):
    """Files read karne ka simple tareeka"""
    context = "Project Files Context:\n"
    # Sirf important files read karein
    included = ["*.md", "*.py", "*.tsx", "*.js"]
    found_files = []
    for ext in included:
        found_files.extend(glob.glob(os.path.join("..", "**", ext), recursive=True))

    # Sirf pehli 3 files ka data uthayein context ke liye (Memory bachane ke liye)
    count = 0
    for file_path in found_files:
        if "node_modules" in file_path or "backend" in file_path or "api" in file_path:
            continue
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if user_query.lower() in content.lower():
                    context += "\n--- " + file_path + " ---\n" + content[:500] + "\n"
                    count += 1
        except:
            continue
        if count > 3: break
    return context

@app.get("/")
def home():
    return {"status": "Online", "msg": "Robotics Book AI is ready"}

@app.post("/rag_query")
async def ask_gemini(request: QueryRequest):
    try:
        context = get_project_context(request.query)
        full_prompt = context + "\n\nUser Question: " + request.query

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=full_prompt
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create Mangum handler for Vercel compatibility
handler = Mangum(app)

# Vercel API function handler
def main(event, context):
    # This makes the FastAPI app work with Vercel's serverless functions
    return handler(event, context)

# For Vercel's new functions API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))