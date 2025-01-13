import os

DECK_NAME = "reddit_communities"

# Root Directory Paths
ROOT_PATH = os.path.abspath(os.path.join(__file__, "..", ".."))
PUBLIC_DIRECTORY_PATH = os.path.join(ROOT_PATH, "public")
SRC_DIRECTORY_PATH = os.path.join(ROOT_PATH, "src")
SCRIPTS_DIRECTORY_PATH = os.path.join(ROOT_PATH, "scripts")

# Derived directory paths
DATA_DIRECTORY_PATH = os.path.join(SRC_DIRECTORY_PATH, "data") # json data, source of truth for cards
GENERATED_DIRECTORY_PATH = os.path.join(SRC_DIRECTORY_PATH, "generated") # generated code for images
LISTS_DIRECTORY_PATH = os.path.join(SCRIPTS_DIRECTORY_PATH, "lists") # list of input events

# File Paths
LIST_PATH = os.path.join(LISTS_DIRECTORY_PATH, f"{DECK_NAME}.json") # list of input events
JSON_PATH = os.path.join(DATA_DIRECTORY_PATH, f"{DECK_NAME}.json") # json data to output AI generated cards

# Deck Constants
START_YEAR = 0
END_YEAR = 2024
TOTAL_EVENTS = 100