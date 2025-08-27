# BOCAI - 中国银行江西省分行大语言模型

This project is a conversational AI system for Bank of China Jiangxi Branch, featuring the BOCAI large language model with a Python backend and a React frontend, containerized with Docker.

## Project Structure

```
chat-mvp/
├── backend/
│   ├── app.py
│   ├── llm_client.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ChatBox.jsx
│   │   │   └── InputBar.jsx
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Docker
- Docker Compose

### API Key Configuration

This application uses the Qwen API from Alibaba Cloud DashScope. You need to obtain an API key from [DashScope](https://dashscope.aliyuncs.com/) and configure it properly.

**Important:** The default API key in the `.env` file is just a placeholder. You must replace it with your own API key from DashScope.

#### For Local Development

1. Create a `.env` file in the `backend` directory with your API key:
   ```
   API_KEY=your_actual_api_key_here
   ```

#### For Docker Deployment

1. Set the API_KEY environment variable in your shell before running docker-compose:
   ```bash
   export API_KEY=your_actual_api_key_here
   ```
   
   On Windows:
   ```cmd
   set API_KEY=your_actual_api_key_here
   ```

### Running the Application with Docker

1. Clone the repository.
2. Navigate to the project directory.
3. Set your API key as an environment variable.
4. Run `docker-compose up --build`.
5. Access the application at `http://localhost:3000`.

### Running the Application Locally

#### Start the Backend:
1. **Activate the conda environment**: `conda activate bank-rag-mvp`
2. **Navigate to the backend directory**: `cd backend`
3. **Install dependencies** (if not already installed): `pip install -r requirements.txt`
4. **Configure API key**: Create a `.env` file with your API key (replace the placeholder):
   ```
   API_KEY=your_actual_dashscope_api_key_here
   ```
5. **Start the backend server**: `uvicorn app:app --host 0.0.0.0 --port 8000`

#### Start the Frontend:
1. **Open a new terminal window**
2. **Navigate to the frontend directory**: `cd frontend`
3. **Install dependencies** (if not already installed): `npm install`
4. **Start the frontend server**: `npm run dev`

#### Test the Connection:
1. Open your browser and go to `http://localhost:3000`
2. Open browser developer tools (F12) and go to Console
3. Test WebSocket connection with this code:
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/chat');
   ws.onopen = () => { console.log('✅ Connected'); ws.send('hello world'); };
   ws.onmessage = (e) => console.log('📨 Received:', e.data);
   ws.onerror = (e) => console.error('❌ Error:', e);
   ```

4. **Access the application** at `http://localhost:3000`.

## Backend

The backend is a Python FastAPI application that serves as a WebSocket server for the frontend. It uses an LLM client to generate responses.

## Frontend

The frontend is a React application that provides a simple chat interface. It communicates with the backend WebSocket server to send and receive messages.

## Nginx

Nginx is used as a reverse proxy to serve the frontend and proxy WebSocket connections to the backend.

## Docker

The application is containerized using Docker. The `docker-compose.yml` file defines the services for the backend, frontend, and nginx.