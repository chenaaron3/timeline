# Run with python -m parsers.reddit

import requests
from bs4 import BeautifulSoup
import json
import os
from constants import DATA_DIRECTORY_PATH, PUBLIC_DIRECTORY_PATH
from llm import client
import concurrent.futures
from utils import chunk_list

# URL to scrape
url = "https://www.reddit.com/best/communities/1/"
deck_name = "reddit_communities"

def gen_description(subreddit):
    response = client.beta.chat.completions.parse(
        model='gpt-4o-mini',
        messages=[
            {
                "role": "user", 
                "content": f"Generate a 1 sentence blurb about the subreddit {subreddit}"
            }
        ],
    )

    # Parse the response and validate it 
    raw_response = response.choices[0].message.content
    return raw_response

def process_communities(communities):
    community_data = []

     # Parse top 100 popular subreddits
    for community in communities:
        try:
            name = community["data-prefixed-name"]
            id = name[2:] # strip off the r/
        except:
            continue
        print("processing", name)
        
        image = community["data-icon-url"]
        description = community["data-public-description-text"]
        subscribers = community["data-subscribers-count"]

        # Do not use if no image provided
        if not image:
            continue
        
        data = {
            "id": id,
            "title": name,
            "rank": int(subscribers),
            "description": description,
            "longDescription": gen_description(name),
            "imageURL": image
        }

        community_data.append(data)
    return community_data

def main():
    # Fetch the HTML content
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    root = soup.find('div', class_='community-list')
    communities = root.find_all('div') if root else []

    community_data = []
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        chunk_size = 10
        for chunk in chunk_list(communities, chunk_size):
            futures.append(executor.submit(process_communities, chunk))

        for future in concurrent.futures.as_completed(futures):
            parsed_response = future.result()
            for community in parsed_response:
                community_data.append(community)

    with open(os.path.join(DATA_DIRECTORY_PATH, f"{deck_name}.json"), "w") as fp:
        json.dump(
            community_data, 
            fp,
        )

main()