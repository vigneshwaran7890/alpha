# backend/utils/gemini_key_picker.py

import os
import random
from dotenv import load_dotenv

load_dotenv()

def get_random_gemini_key():
    keys = [
        os.getenv("GEMINI_API_KEY_1"),
        os.getenv("GEMINI_API_KEY_2"),
        os.getenv("GEMINI_API_KEY_3"),
        os.getenv("GEMINI_API_KEY_4"),
    ]

    # Filter out any keys that are None
    keys = [key for key in keys if key]

    if not keys:
        raise ValueError("No Gemini API keys are configured in environment.")

    return random.choice(keys)
