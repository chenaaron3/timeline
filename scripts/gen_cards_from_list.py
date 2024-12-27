from constants import DECK_NAME, ROOT_PATH, START_YEAR, END_YEAR, TOTAL_EVENTS, DATA_DIRECTORY_PATH
from models import EventCollection
from utils import snake_to_pascal
from dotenv import load_dotenv
from openai import OpenAI
from lists.world_history import world_history
import os
import json
import concurrent.futures
import time

model = 'gpt-4o' # 'gpt-4o-mini' for cheaper

# Load variables from .env file
load_dotenv(
    dotenv_path=os.path.join(ROOT_PATH, ".env")
)

# limitation from OpenAI, it refuses to generate too much text at once
MAX_EVENTS_PER_PROMPT = 20 # use total events to generate it in one go
MAX_TOKENS = 16384

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def fetch_events(events):
    events_list = ""
    for i, event in enumerate(events):
        events_list += f"{i + 1}. {event}\n"
    prompt = f"""
Compile a list of significant historical events based on the following list: {events_list}.
For long lasting events like the World War I, you can create 2 entries. One for the start and one for the end.
Each JSON entry should be formatted as below. 

{{
id: string // Lowercase unique identifier derived from the title. Use underscores for spaces.
title: string // Should be less than 30 characters. Do not include the year.
year: number // The year the event took place. If the event is BC, use a negative number.
date: string // Formatted like May 29, 2024. Include BC but omit AD.
country: string // The location of the event
description: string // A short 1 sentence description about the event.
longDescription: string // A longer 1 paragraph description about the event. Include why the event happened, what happened at the event, how it ended, and the impact of the event.
imagePrompt: string // A descriptive prompt used for an image generation model to depict the event. Describe the environment and any subjects involved.
}}

Below are a couple examples to help guide your answer.

Input List: 
1. "The Agricultural Revolution: Humans Domesticate Plants and Animals",
2. "The Rise and Fall of Ancient Roman Civilization",

Output:
[
{{
    "id": "agricultural_revolution",
    "title": "The Agricultural Revolution",
    "year": -11000,
    "date": "11,000 BCE",
    "country": "Iraq",
    "description": "Humans begin to domesticate plants and animals.",
    "longDescription": "The Agricultural Revolution marks a pivotal point in human history, as societies transitioned from nomadic lifestyles to settled agricultural communities. This period, spanning from approximately 11,000 to 4,000 BCE, saw the domestication of key crops like wheat and barley as well as animals such as sheep and goats. This shift allowed for more stable food supplies, supporting population growth and the formation of complex societies. The consequences were profound, as agriculture laid the foundation for civilization, ultimately leading to advancements in technology, governance, and culture.",
    "imagePrompt": "A vibrant landscape of ancient farming with domesticated animals and early humans cultivating crops.",
}},
// Notice below that the range event is splitted into 2 entries
{{
    "id": "rise_roman_civilization",
    "title": "Rise of Ancient Roman Civilization",
    "year": -509,
    "date": "509 BCE",
    "country": "Italy",
    "description": "Ancient Roman civilization begins with the establishment of the Republic.",
    "longDescription": "The rise of ancient Roman civilization officially began in 509 BCE with the overthrow of the last king, leading to the establishment of the Roman Republic. This pivotal transformation introduced a system of governance characterized by elected representatives and a complex constitution, fostering political stability and growth. Rome soon expanded through military conquests and strategic alliances, evolving into a dominant power in the Mediterranean, laying the groundwork for the eventual empire.",
    "imagePrompt": "A grand depiction of the Roman Forum filled with citizens and senators engaging in democratic discussions in ancient Rome."
}},
{{
    "id": "fall_roman_civilization",
    "title": "Fall of Ancient Roman Civilization",
    "year": 476,
    "date": "476", // AD is omitted
    "country": "Italy",
    "description": "The Western Roman Empire falls, marking the end of ancient Rome.",
    "longDescription": "The fall of the Western Roman Empire in 476 CE marked the end of ancient Roman civilization as the last emperor was deposed by Germanic chieftain Odoacer. This event signified not only the collapse of imperial rule but also the fragmentation of political authority across Europe, leading to the Middle Ages. Despite the fall, the legacy of Roman law, culture, and engineering continued to shape European history for centuries to come.",
    "imagePrompt": "The crumbling ruins of a once-grand Roman city, with citizens fleeing as barbarian tribes advance, symbolizing the empire's collapse."
}}
]
"""
    print(prompt)
    response = client.beta.chat.completions.parse(
        model=model,
        messages=[
            {
                "role": "user", 
                "content": prompt
            }
        ],
        response_format=EventCollection,
        max_tokens=MAX_TOKENS
    )

    # Parse the response and validate it 
    raw_response = response.choices[0].message.content
    print(raw_response)
    parsed_response = EventCollection.model_validate_json(raw_response)
    return parsed_response

# splits a list into chunks
def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

master_list = world_history

if __name__ == "__main__":
    all_events = []
    years = set()

    start_time = time.time()

    # Use ThreadPoolExecutor to parallelize the API calls
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for chunk in chunk_list(master_list, MAX_EVENTS_PER_PROMPT):
            futures.append(executor.submit(fetch_events, chunk))

        for future in concurrent.futures.as_completed(futures):
            parsed_response = future.result()
            for event in parsed_response.events:
                # Do not include duplicate events
                if event.year in years:
                    print(f"Duplicate year found: {event.year}")
                else:
                    years.add(event.year)
                    all_events.append(event.model_dump())

            print([e.year for e in parsed_response.events])

    end_time = time.time()
    # Calculate elapsed time
    elapsed_time = end_time - start_time
    print(f"Elapsed time: {elapsed_time} seconds")

    # Sort the events by date
    all_events = sorted(all_events, key=lambda x: x["year"])

    # Write the events to a JSON file
    with open(os.path.join(DATA_DIRECTORY_PATH, f"{DECK_NAME}.json"), "w") as f:
        json.dump(all_events, f, indent=4)