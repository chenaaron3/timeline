from constants import DECK_NAME, ROOT_PATH, START_YEAR, END_YEAR, TOTAL_EVENTS, DATA_DIRECTORY_PATH
from models import EventCollection
from utils import snake_to_pascal
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import concurrent.futures
import time

model = 'gpt-4o-mini' # 'gpt-4o-mini' for cheaper

# Load variables from .env file
load_dotenv(
    dotenv_path=os.path.join(ROOT_PATH, ".env")
)

"""
Chat GPT will only generate so many events at once.
To get cards from years 0-2000, the results need to be sharded.
"""
# limitation from OpenAI, it refuses to generate too much text at once
MAX_EVENTS_PER_PROMPT = 10 # use total events to generate it in one go
NUMBER_OF_SHARDS = TOTAL_EVENTS / MAX_EVENTS_PER_PROMPT # about 10
YEAR_RANGE_PER_PROMPT = (END_YEAR - START_YEAR) / NUMBER_OF_SHARDS # about 200
MAX_TOKENS = 16384

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

def fetch_events(start_year, end_year):
    prompt = f"""
Compile a list of significant historical events based on {snake_to_pascal(DECK_NAME)}.
Make sure to only include well known events that are mentioned in history textbooks.
The list should contain {MAX_EVENTS_PER_PROMPT} entries.
For each event, really think hard and make sure it occurs from year {start_year} to year {end_year}.
Only generate events with a definitive date, meaning the date can be attributed to one day.
For long lasting events like the World War I, you can create 2 entries for the start and end.
Each JSON entry should be formatted as below. 

{{
id: string // Lowercase unique identifier derived from the title. Use underscores for spaces.
title: string // The name of the historical event. Do not include the year in the title.
year: number // The year the event took place. If the event is BC, use a negative number.
date: string // Formatted like May 29, {end_year}. Include BC but omit AD.
country: string // Location of event
division: string // The Administrative Division of the event (State/Province/Region/Territory)
description: string // A short 1 sentence description about the event.
longDescription: string // A longer 1 paragraph description about the event. Include why the event happened, what happened at the event, how it ended, and the impact of the event.
imagePrompt: string // A prompt used for an image generation model to depict the event.
relevanceScore: number // The count of how many articles, books, and documentaries mention the event.
}}
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

if __name__ == "__main__":
    all_events = []
    years = set()

    start_time = time.time()

    # Use ThreadPoolExecutor to parallelize the API calls
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for i in range(int(NUMBER_OF_SHARDS)):
            start_year = int(START_YEAR + (i * YEAR_RANGE_PER_PROMPT))
            end_year = int(START_YEAR + ((i + 1) * YEAR_RANGE_PER_PROMPT))
            futures.append(executor.submit(fetch_events, start_year, end_year))

        for future in concurrent.futures.as_completed(futures):
            parsed_response = future.result()
            for event in parsed_response.events:
                # Do not include duplicate events
                if event.year in years:
                    print(f"Duplicate year found: {event.year}")
                else:
                    years.add(event.year)
                    all_events.append(event.model_dump())

            print("Generated events from {} to {}".format(start_year, end_year))
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