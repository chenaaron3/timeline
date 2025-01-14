# Run with python -m parsers.reddit

import requests
from bs4 import BeautifulSoup
import json
import os
from constants import DATA_DIRECTORY_PATH
from llm import client
import concurrent.futures
from utils import chunk_list

# Scrape top 10 pages
urls = [f"https://www.reddit.com/best/communities/{i}/" for i in range(1, 2)]
deck_name = "reddit_communities"

def gen_description(subreddit, description):
    response = client.beta.chat.completions.parse(
        model='gpt-4o-mini',
        messages=[
            {
                "role": "user", 
                "content": f"Generate a 1 sentence blurb about the subreddit {subreddit}. Here is a short description {description}"
            }
        ],
    )

    # Parse the response and validate it 
    raw_response = response.choices[0].message.content
    return raw_response

def process_communities(communities, seen):
    community_data = []

     # Parse top 100 popular subreddits
    for community in communities:
        try:
            name = community["data-prefixed-name"]
            id = name[2:] # strip off the r/
        except:
            continue

        image = community["data-icon-url"]
        description = community["data-public-description-text"]
        subscribers = community["data-subscribers-count"]

        # Do not use if no image provided
        if not image:
            continue
        if id in seen:
            print("skipping", name)
            continue
        print("processing", name)
        
        
        data = {
            "id": id,
            "title": name,
            "rank": int(subscribers),
            "description": description,
            "longDescription": gen_description(name, description),
            "imageURL": image
        }

        community_data.append(data)
    return community_data

def main():
    communities = []
    for url in urls:
        # Fetch the HTML content
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        root = soup.find('div', class_='community-list')
        communities += root.find_all('div') if root else []

    # Load previous data so we don't do extra work
    community_data = []
    data_path = os.path.join(DATA_DIRECTORY_PATH, f"{deck_name}.json")
    if (os.path.exists(data_path)):
        with open(data_path, "r") as fp:
            community_data = json.load(fp)
    seen_communities = set(x["id"] for x in community_data)

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        chunk_size = 10
        for chunk in chunk_list(communities, chunk_size):
            futures.append(executor.submit(process_communities, chunk, seen_communities))

        for future in concurrent.futures.as_completed(futures):
            parsed_response = future.result()
            for community in parsed_response:
                community_data.append(community)

    with open(data_path, "w") as fp:
        json.dump(
            community_data, 
            fp,
        )

main()