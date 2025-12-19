# AI Book Project

This project combines a FastAPI backend with a Docusaurus frontend to create an AI-powered documentation assistant.

## Project Structure

- `backend/` - FastAPI backend that handles RAG queries
- `src/` - Docusaurus frontend source files
- `docs/` - Documentation files for Docusaurus

## Deployment

### Backend (FastAPI) on Vercel

1. The backend is configured to deploy on Vercel with the following configuration:
   - `vercel.json` is already configured for Python deployment
   - The `requirements.txt` file includes all necessary dependencies

2. **Important Environment Variables for Vercel:**
   - Set `GEMINI_API_KEY` in your Vercel project environment variables
   - Set `ENVIRONMENT` to `production` for production deployments
   - These can be set in the Vercel dashboard under Settings > Environment Variables

3. **CORS Configuration:**
   - The backend is configured to accept requests from your Vercel frontend URL
   - Update `https://your-vercel-project.vercel.app` in `backend/main.py` with your actual Vercel URL

### Frontend (Docusaurus) on Vercel

The Docusaurus frontend will be deployed separately to Vercel:
1. Connect your GitHub repository to Vercel
2. Set the build command to `npm run build`
3. The output directory will be `build/`

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
npm install
npm start
```

## Notes for Vercel Deployment

1. Make sure to update the CORS origins in `backend/main.py` with your actual Vercel deployment URL before deploying
2. The `GEMINI_API_KEY` must be set in Vercel's environment variables
3. The `ENVIRONMENT` variable should be set to `production` for your production deployment