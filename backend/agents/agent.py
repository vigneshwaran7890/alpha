import uuid
import os
import sys
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load .env
load_dotenv()

# MongoDB connection string from .env
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("[ERROR] MONGO_URI not found in .env file")
    sys.exit(1)

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["test"]  # Replace with your actual DB name if different

# Fields agent must extract
REQUIRED_FIELDS = [
    "company_value_prop",
    "product_names",
    "pricing_model",
    "key_competitors",
    "company_domain"
]

# Simulated search results
def mock_search(query):
    return [
        {
            "url": f"https://example.com/{uuid.uuid4()}",
            "snippet": f"Info about {query} from source A."
        },
        {
            "url": f"https://example.org/{uuid.uuid4()}",
            "snippet": f"Details on {query} from source B."
        },
        {
            "url": f"https://sample.net/{uuid.uuid4()}",
            "snippet": f"Additional context on {query} from source C."
        }
    ]

# Extract simulated data from results
def extract_fields(snippets, current_fields):
    if "company_value_prop" not in current_fields:
        current_fields["company_value_prop"] = "We empower businesses with AI-powered automation."

    if "product_names" not in current_fields:
        current_fields["product_names"] = ["AutoFlow", "InsightX"]

    if "pricing_model" not in current_fields:
        current_fields["pricing_model"] = "Subscription-based with tiered plans"

    if "key_competitors" not in current_fields:
        current_fields["key_competitors"] = ["CompeteX", "SmartAI"]

    if "company_domain" not in current_fields:
        current_fields["company_domain"] = "example.com"

    return current_fields

# Main agent logic
def run_agent(person_id):
    print(f"[INFO] Running agent for person ID: {person_id}")

    # Fetch user
    person = db.users.find_one({ "_id": person_id })

    if not person:
        print(f"[ERROR] Person with ID {person_id} not found.")
        print("[DEBUG] Listing all users in 'users' collection:")
        found = False
        for user in db.users.find({}, {"_id": 1, "name": 1}):
            print("-", user["_id"], "|", user.get("name"))
            found = True
        if not found:
            print("[DEBUG] No users found.")
        return

    # Fetch company
    company = db.companies.find_one({ "_id": person["company_id"] })
    if not company:
        print(f"[ERROR] Company with ID {person['company_id']} not found.")
        return

    context_id = str(uuid.uuid4())
    found_fields = {}
    all_urls = []

    for iteration in range(1, 4):  # Up to 3 search passes
        missing = [field for field in REQUIRED_FIELDS if field not in found_fields]
        if not missing:
            break

        query = f"{person['name']} {person['email']} {missing[0]}"
        print(f"[INFO] Iteration {iteration} - Query: {query}")
        results = mock_search(query)
        snippets = [r["snippet"] for r in results]
        urls = [r["url"] for r in results]
        all_urls.extend(urls)

        # Log search iteration
        db.search_logs.insert_one({
            "_id": str(uuid.uuid4()),
            "context_snippet_id": context_id,
            "iteration": iteration,
            "query": query,
            "top_results": results,
            "created_at": datetime.utcnow()
        })

        # Extract fields
        found_fields = extract_fields(snippets, found_fields)

    # Save final research result
    db.context_snippets.insert_one({
        "_id": context_id,
        "entity_type": "company",
        "entity_id": person["company_id"],
        "snippet_type": "research",
        "payload": found_fields,
        "source_urls": list(set(all_urls)),
        "created_at": datetime.utcnow()
    })

    print(f"[SUCCESS] Agent completed for {person['name']}")

# CLI entry point
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python agent.py <person_id>")
        sys.exit(1)

    run_agent(sys.argv[1])
