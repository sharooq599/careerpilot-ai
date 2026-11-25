
import os
from pathlib import Path
from dotenv import load_dotenv
from openrouter import OpenRouter

# Load environment variables
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(ENV_PATH, override=True)

API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

if not API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found in .env")


def test_openrouter():
    print("Connecting to OpenRouter...")

    with OpenRouter(api_key=API_KEY) as client:

        response = client.chat.send(
            model=MODEL,
            stream=False,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI Career Assistant."
                },
                {
                    "role": "user",
                    "content": "Introduce yourself in two sentences."
                }
            ]
        )

        print("\nModel:", MODEL)
        print("\nAI Response:")
        print(response.choices[0].message.content)

    print("\nOpenRouter connection successful!")


if __name__ == "__main__":
    test_openrouter()
