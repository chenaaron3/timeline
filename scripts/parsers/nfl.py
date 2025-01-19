import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import concurrent.futures
from utils import chunk_list, remove_non_alphabetic, list_to_dict, dict_to_list
import json
import os
from constants import DATA_DIRECTORY_PATH
from llm import client
import time

deck_name = "nfl_pass_yards"
base_url='https://www.pro-football-reference.com'
url='https://www.pro-football-reference.com/leaders/pass_yds_career.htm'
data_path = os.path.join(DATA_DIRECTORY_PATH, f"{deck_name}.json")

def gen_description(player, yards):
    response = client.beta.chat.completions.parse(
        model='gpt-4o-mini',
        messages=[
            {
                "role": "user", 
                "content": f"Generate a 1 sentence blurb about the NFL player {player} who threw {yards} Passing Yards"
            }
        ],
    )

    # Parse the response and validate it 
    raw_response = response.choices[0].message.content
    return raw_response

def load_page(url, selector, headless=False):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)  # Set headless to False to view the process
        page = browser.new_page()

        # Step 1: Navigate to the URL
        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_selector(selector, timeout=30000)  # 30-second timeout
        
        # Get the page content
        return page.content()

def get_image(relative_url):
    content = load_page(base_url + relative_url, "text=Football", True)
    soup = BeautifulSoup(content, 'html.parser')
    image = soup.find(id="meta").find("img")['src']
    return image

def get_stats():
    content = load_page(url, "text=Tom")

    # Find all <tbody> elements
    soup = BeautifulSoup(content, 'html.parser')
    tbodies = soup.find_all("tbody")

    # Find the table containing the champions
    target_tbody = next((tbody for tbody in tbodies if len(tbody.find_all("tr")) > 160), None)
    if not target_tbody:
        raise Exception("Cannot find champion table!")
    
    # Parse out the name
    players = target_tbody.find_all("tr")
    stats = []
    for player_component in players:
        try:
            name = player_component.find("a").text.replace("+", "")
            print("Parsing player", name)
            stat = int(player_component.find(attrs={"data-stat": "pass_yds"}).text.replace(",", ""))
            description = ""
            image = player_component.find("a")["href"]
            stats.append({
                "id": remove_non_alphabetic(name).lower(),
                "title": name,
                "rank": stat,
                "description": name,
                "longDescription": description,
                "imageURL": image,
            })
        except:
            print("failed")
    return stats

def process_player(player):
    try:
        if player["imageURL"].startswith("/"):
            img = get_image(player['imageURL'])
            player['imageURL'] = img
        if player["longDescription"] == "":
            player["longDescription"] = gen_description(player['title'], player['rank'])
        return player, True
    except:
        return player, False

def flush(data):
    print("Flushing!")
    with open(data_path, "w") as fp:
        json.dump(
            data, 
            fp,
        )

def main():
    # Load stats from file if exists
    if os.path.exists(data_path):
        with open(data_path, "r") as fp:
            # apply previous data on top of stats
            all_stats = json.load(fp)
    else:
        # Get quick catalogue of information
        all_stats = get_stats()
    all_stats_lookup = list_to_dict(all_stats)

    # Process data in chunks and flush back into file for checkpointing
    for chunk in chunk_list(list(all_stats_lookup.values()), 5):
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = []
            for player in chunk:
                futures.append(executor.submit(process_player, player))
            for future in concurrent.futures.as_completed(futures):
                parsed_response, valid = future.result()
                if not valid:
                    print("Cannot process player!", parsed_response)
                    del all_stats_lookup[parsed_response['id']]
                else:
                    print("Processed player!", parsed_response)
                    all_stats_lookup[parsed_response['id']] = parsed_response
        flush(dict_to_list(all_stats_lookup))
        time.sleep(20)
    flush(dict_to_list(all_stats_lookup))
main()