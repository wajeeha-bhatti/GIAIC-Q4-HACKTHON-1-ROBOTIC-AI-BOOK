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
   - The `requirements.txt` file includes all necessary dependencies including `mangum` for Vercel compatibility

2. **Required Environment Variables for Vercel Backend:**
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `ENVIRONMENT` - Set to `production` for production deployments (default: development mode allows all origins)
   - These can be set in the Vercel dashboard under Settings > Environment Variables

3. **CORS Configuration:**
   - The backend is configured to accept requests from your Vercel frontend URL
   - Update `https://your-vercel-project.vercel.app` in `backend/main.py` with your actual Vercel URL

### Frontend (Docusaurus) on Vercel

The Docusaurus frontend will be deployed separately to Vercel:
1. Connect your GitHub repository to Vercel
2. Set the build command to `npm run build`
3. The output directory will be `build/`
4. Add environment variables for frontend: `REACT_APP_API_URL` pointing to your backend deployment

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

## Vercel Environment Variables

### Backend Environment Variables:
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `ENVIRONMENT`: Set to `production` to enable production CORS settings

### Frontend Environment Variables:
- `REACT_APP_API_URL`: The URL of your deployed FastAPI backend (e.g., `https://your-backend.vercel.app`)

## Notes for Vercel Deployment

1. **Backend Deployment:**
   - The `mangum` adapter is used to make FastAPI compatible with Vercel's serverless functions
   - Update CORS origins in `backend/main.py` with your actual Vercel deployment URL before deploying
   - The `GEMINI_API_KEY` must be set in Vercel's backend environment variables

2. **Frontend Deployment:**
   - The API URL is now configurable via the `REACT_APP_API_URL` environment variable
   - This allows the frontend to connect to the deployed backend instead of localhost
   - No case-sensitivity issues with file imports

3. **API Routes:**
   - API endpoints are available at `/api/rag_query` and `/rag_query`
   - The modern Vercel configuration uses rewrites and functions instead of the deprecated builds/routes
   - Using default @vercel/python runtime for compatibility

4. **Separate Deployments:**
   - Backend and frontend should be deployed as separate Vercel projects
   - Backend will have a URL like `https://your-backend.vercel.app`
   - Frontend will have a URL like `https://your-frontend.vercel.app`
   - Set the frontend's `REACT_APP_API_URL` to point to the backend URL