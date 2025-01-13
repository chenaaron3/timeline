from dotenv import load_dotenv
from openai import OpenAI
from constants import ROOT_PATH
import os

# Load variables from .env file
load_dotenv(
    dotenv_path=os.path.join(ROOT_PATH, ".env")
)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

