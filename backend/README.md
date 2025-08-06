Here's a `README.md` file for your project, structured to explain its purpose, setup, usage, and technologies used.

---

### 📁 `README.md`

```markdown
# 🚀 AI Enrichment Platform (RAG-style)

This project is a backend system designed for enriching user data (like company and person information) using AI (Gemini + Langchain agents). It includes user management, company tracking, snippet generation from AI, and logging of search activities. The enriched information is stored and retrievable via REST APIs.

---

## 📦 Tech Stack

- **Node.js + Express** - Backend server
- **MongoDB + Mongoose** - Database & ODM
- **Python + Langchain + Gemini** - AI-based enrichment
- **SerpAPI** - Search results fetching
- **UUID** - For unique identifiers
- **bcrypt** - Password hashing
- **dotenv** - Env variable management
- **morgan + cors** - Logging and CORS middleware
- **Socket.IO** - Real-time progress updates for enrichment endpoint

---

## 📁 Folder Structure

```

.
├── models/             # Mongoose schemas
├── routes/             # Express routes
├── controllers/        # API logic (controller functions)
├── agents/             # Python agent script (AI enrichment)
├── utils/              # Gemini key picker
├── seed.js             # Seeder script for Campaigns, Companies & People
├── server.js           # Express app entry point
├── .env                # Environment variables
└── README.md

````

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-enrichment-platform.git
cd ai-enrichment-platform
````

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root with the following values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/your-db-name
GEMINI_API_KEY=your_gemini_api_key
SERPAPI_API_KEY=your_serpapi_key
```

### 4. Seed the database

```bash
node seed.js
```

### 5. Run the server

```bash
npm start
```

Or using `nodemon`:

```bash
npx nodemon server.js
```

---

## 🧠 Python Agent Script

The AI agent (`agents/agent.py`) enriches user data by calling Gemini & SerpAPI. It's triggered by an Express endpoint using:

```http
POST /api/enrich/:id
```

Make sure you have Python 3.9+ and the following installed:

```bash
pip install -r requirements.txt
```

Where `requirements.txt` includes:

```txt
pymongo
python-dotenv
langchain
langchain-google-genai
langchain-community
```

---

## 🛠️ API Endpoints

### 🧠 Enrichment

#### POST /api/enrich/:id

Triggers AI enrichment for a person by ID.  
Runs the Python agent and streams progress, errors, and completion via Socket.IO.

**Headers:**
- `x-socket-id`: (string) The Socket.IO client ID to receive real-time updates.

**Response:**
- `200 OK` with `{ context_snippet_id: string }` on success.
- `404 Not Found` or `500 Internal Server Error` with error message on failure.

**Example:**
```http
POST /api/enrich/abc-uuid
x-socket-id: <socket-id>
```
Response:
```json
{
  "context_snippet_id": "snippet-uuid"
}
```

### 🔐 Auth & Users

* `POST /api/people` — Create a user
* `POST /api/login` — Login a user

### 📖 Logs

* `GET /api/search-logs` — Get all search logs

---

## 👤 Seeded Data

After running `node seed.js`, you'll have:

* **Campaign**: `Alpha Outreach Campaign`
* **Company**: `Alpha Innovatex`
* **Users**:

  * `Sundhar Pichai` (admin, email: `Sundhar@gmail.com`)
  * `Elan Mosk` (agent, email: `elan@gmail.com`)
* Password for all: `securepassword123`

---

## 📸 Example JSON Output (Enrichment)

```json
{
  "status": "success",
  "person_id": "abc-uuid",
  "person_name": "Elan Mosk",
  "company_id": "xyz-uuid",
  "company_name": "Alpha Innovatex",
  "enriched_data": {
    "company_value_prop": "Innovative AI solutions for startups...",
    "product_names": "AlphaBot, InnovateX Cloud",
    "target_customer": "Small to mid-sized SaaS companies"
  },
  "context_snippet_id": "snippet-uuid"
}
```

---

## ✍️ License

MIT — free to use and modify.

```

---

Let me know if you want a `requirements.txt`, OpenAPI spec, or Postman collection too.
