import os
import sys
import glob
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from mangum import Mangum
from dotenv import load_dotenv

# Load env
load_dotenv()

# Setup App (minimal for Vercel function)
app = FastAPI()

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

@app.post("/")
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
    return handler(event, context)