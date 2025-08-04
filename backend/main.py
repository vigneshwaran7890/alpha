# main.py

import os
import uuid
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain.agents import Tool, initialize_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools import DuckDuckGoSearchRun


# Load .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print("Gemini Key:", GEMINI_API_KEY)

app = FastAPI()

# Simulate DB Tables
context_snippets = []
search_logs = []

# Required fields to extract
REQUIRED_FIELDS = ["company_value_prop", "product_names", "pricing_model", "key_competitors", "company_domain"]

# Mock Database for People
PEOPLE_DB = {
    "1": {"id": "1", "full_name": "Alice Johnson", "email": "alice@openai.com", "company_id": "c1"},
}

class Person(BaseModel):
    id: str
    full_name: str
    email: str
    company_id: str

class EnrichmentRequest(BaseModel):
    person_id: str

def run_deep_search(person: Person) -> Dict:
    """Run the deep search agent using LangChain + Gemini."""
    search_tool = DuckDuckGoSearchRun()

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_API_KEY, temperature=0.5)

    tools = [Tool(name="duckduckgo_search", func=search_tool.run, description="Useful for web search")]

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent="zero-shot-react-description",
        verbose=True,
    )

    payload = {}
    source_urls = []
    iteration = 0

    while iteration < 3 and len(payload) < len(REQUIRED_FIELDS):
        missing_fields = [field for field in REQUIRED_FIELDS if field not in payload]
        query = f"Research on {person.full_name} ({person.email}) to find {', '.join(missing_fields)}"

        print(f"[Iteration {iteration+1}] Query: {query}")
        response = agent.run(query)

        # Simulate extraction
        for field in missing_fields:
            if field in response.lower():
                payload[field] = f"Mocked value for {field}"

        # Log iteration
        search_log = {
            "id": str(uuid.uuid4()),
            "context_snippet_id": None,  # will link later
            "iteration": iteration + 1,
            "query": query,
            "top_results": [f"https://search.com/{person.company_id}/result-{iteration+1}"],
        }
        search_logs.append(search_log)
        source_urls.extend(search_log["top_results"])
        iteration += 1

    # Save context snippet
    snippet_id = str(uuid.uuid4())
    context_snippet = {
        "id": snippet_id,
        "entity_type": "company",
        "entity_id": person.company_id,
        "snippet_type": "research",
        "payload": payload,
        "source_urls": source_urls,
    }
    context_snippets.append(context_snippet)

    # Link logs to snippet
    for log in search_logs[-iteration:]:
        log["context_snippet_id"] = snippet_id

    return context_snippet

@app.post("/enrich/{person_id}")
def enrich_person(person_id: str):
    if person_id not in PEOPLE_DB:
        raise HTTPException(status_code=404, detail="Person not found")
    person = Person(**PEOPLE_DB[person_id])
    result = run_deep_search(person)
    return {"status": "completed", "result": result}

@app.get("/snippets/{company_id}")
def get_snippets(company_id: str):
    return [s for s in context_snippets if s["entity_id"] == company_id]

@app.get("/logs")
def get_all_logs():
    return search_logs

