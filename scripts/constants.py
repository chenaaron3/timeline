import os

DECK_NAME = "world_history"

# Root Directory Paths
ROOT_PATH = os.path.abspath(os.path.join(__file__, "..", ".."))
PUBLIC_DIRECTORY_PATH = os.path.join(ROOT_PATH, "public")
SRC_DIRECTORY_PATH = os.path.join(ROOT_PATH, "src")

# Derived paths
DATA_DIRECTORY_PATH = os.path.join(SRC_DIRECTORY_PATH, "data")
GENERATED_DIRECTORY_PATH = os.path.join(SRC_DIRECTORY_PATH, "generated")
JSON_PATH = os.path.join(DATA_DIRECTORY_PATH, f"{DECK_NAME}.json")

# Deck Constants
START_YEAR = 0
END_YEAR = 2024
TOTAL_EVENTS = 100