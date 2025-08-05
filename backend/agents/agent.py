import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
import json
from datetime import datetime
from pymongo import MongoClient
from uuid import uuid4
from dotenv import load_dotenv
from langchain_core.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.utilities import SerpAPIWrapper
from utils.gemini_key_picker import get_random_gemini_key

import re

# Load .env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = get_random_gemini_key()
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
print("GEMINI_API_KEY:", GEMINI_API_KEY)
# Setup DB
client = MongoClient(MONGO_URI)
db = client["test"]  # Ensure using correct DB
t_users = db["users"]
t_companies = db["companies"]
t_snippets = db["contextsnippets"]
t_logs = db["searchlogs"]

# Setup Gemini & Tools
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.7
)
search_tool = SerpAPIWrapper(serpapi_api_key=SERPAPI_API_KEY)

tools = [
    Tool(
        name="search",
        func=search_tool.run,
        description="Useful for answering search queries about companies, people, or products."
    )
]

agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

FIELDS_TO_EXTRACT = {
    "company_value_prop": "What is the company’s value proposition?",
    "product_names": "What products or services does the company offer?",
    "target_customer": "Who is the company’s target customer?",
}

def extract_urls(results):
    urls = []
    url_pattern = re.compile(r'https?://[^\s\'",]+')
    if isinstance(results, list):
        for item in results:
            # If item is a dict and has 'link' or 'url'
            if isinstance(item, dict):
                for k in ['link', 'url']:
                    if k in item and isinstance(item[k], str):
                        urls.append(item[k])
                # Also check all string values for URLs
                for v in item.values():
                    if isinstance(v, str):
                        urls.extend(url_pattern.findall(v))
            elif isinstance(item, str):
                urls.extend(url_pattern.findall(item))
    elif isinstance(results, str):
        urls.extend(url_pattern.findall(results))
    return list(set(urls))

def run_agent(person_id):
    print(f"[INFO] Running agent for person ID: {person_id}")

    person = t_users.find_one({"_id": person_id})
    if not person:
        print(json.dumps({"status": "error", "message": f"Person with ID {person_id} not found."}))
        return

    company = t_companies.find_one({"_id": person["company_id"]})
    if not company:
        print(json.dumps({"status": "error", "message": f"Company not found for person {person['name']}"}))
        return

    found_fields = {}
    context_id = str(uuid4())
    iteration = 1
    source_urls = []

    for key, question in FIELDS_TO_EXTRACT.items():
        query = f"{company['name']} {person['name']} {person['title']} {key.replace('_', ' ')}"
        print(f"[INFO] Iteration {iteration} - Query: {query}")

        try:
            raw_results = search_tool.run(query)
            result = agent.run(query)
        except Exception as e:
            print(f"[ERROR] Agent execution failed: {e}")
            result = None
            raw_results = []

        if result:
            found_fields[key] = result

        # Collect source URLs robustly from both raw_results and result
        source_urls.extend(extract_urls(raw_results))
        source_urls.extend(extract_urls(result))

        # Save search log
        t_logs.insert_one({
            "_id": str(uuid4()),
            "context_snippet_id": context_id,
            "iteration": iteration,
            "query": query,
            "top_results": raw_results if isinstance(raw_results, list) else [raw_results],
            "created_at": datetime.utcnow()
        })

        iteration += 1

    # Save enriched context snippet
    try:
        insert_result = t_snippets.insert_one({
            "_id": context_id,
            "entity_type": "person",
            "entity_id": person_id,
            "snippet_type": "research",
            "payload": found_fields,
            "source_urls": source_urls,
            "created_at": datetime.utcnow()
        })
        print("[DB] Snippet inserted with ID:", insert_result.inserted_id)
    except Exception as db_error:
        print("[DB ERROR] Failed to insert snippet:", str(db_error))

    print("[SUCCESS] Agent completed for", person["name"])
    return {
        "status": "success",
        "person_id": person_id,
        "person_name": person["name"],
        "company_id": company["_id"],
        "company_name": company["name"],
        "enriched_data": found_fields,
        "context_snippet_id": context_id
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({
            "status": "error",
            "message": "❗ Usage: python agent.py <person_id>"
        }))
        sys.exit(1)

    result = run_agent(sys.argv[1])
    print(json.dumps(result, indent=2))
