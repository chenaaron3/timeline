from constants import DECK_NAME, ROOT_PATH, DATA_DIRECTORY_PATH, LIST_PATH
from models import EventCollection
from utils import snake_to_pascal
import argparse
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import concurrent.futures
import time

# Load variables from .env file
load_dotenv(
    dotenv_path=os.path.join(ROOT_PATH, ".env")
)
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# constants
model = 'gpt-4o' # 'gpt-4o-mini' for cheaper
input_data = json.load(open(LIST_PATH))
master_list = input_data["list"]

# limitation from OpenAI, it refuses to generate too much text at once
MAX_EVENTS_PER_PROMPT = 10 # use total events to generate it in one go
MAX_TOKENS = 16384

def list_to_numbered_string(l):
    return "\n".join([f"{i + 1}. {item}" for i, item in enumerate(l)])

def fetch_events(events):
    events_list = list_to_numbered_string(events)
    example_input = list_to_numbered_string(input_data["example_input"])
    example_output = json.dumps(input_data["example_output"], indent=4)
    title =  input_data["title"] if "title" in input_data else ""
    description = input_data["description"]
    image_prompt = input_data["image_prompt"]

    prompt = f"""
Compile a list of significant historical events based on the following list:
{events_list}

Each JSON entry should be formatted as below. 
{{
id: string // Lowercase unique identifier derived from the title. Use underscores for spaces.
title: string // Should be less than 30 characters. Do not include the year. {title}
year: number // The year the event took place. If the event is BC, use a negative number.
date: string // Formatted like May 29, 2024. Include BC but omit AD.
country: string // The location of the event
description: string // A short 1 sentence description about the event.
longDescription: string // A longer 1 paragraph description about the event. {description}
imagePrompt: string // A descriptive prompt used for an image generation model to depict the event. {image_prompt}
}}

Below are a couple examples to help guide your answer.
Input List: 
{example_input}

Output:
{example_output}
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate card info from a curated list.")
    parser.add_argument('--sample', action='store_true', help='Only generate a couple samples. Use for iterating on prompt and generating samples.')
    args = parser.parse_args()

    all_events = []
    years = set()

    start_time = time.time()

    # Use ThreadPoolExecutor to parallelize the API calls
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        chunk_size = 3 if args.sample else MAX_EVENTS_PER_PROMPT
        for chunk in chunk_list(master_list, chunk_size):
            futures.append(executor.submit(fetch_events, chunk))
            if args.sample:
                break

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