import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import concurrent.futures
from utils import chunk_list, remove_non_alphabetic
import json
import os
from constants import DATA_DIRECTORY_PATH

deck_name = "league"
all_stats_url = "https://lol-web-api.op.gg/api/v1.0/internal/bypass/statistics/global/champions/ranked?period=month&tier=all"
opgg_url = "https://www.op.gg/statistics/champions?hl=en_US&period=month"

def load_page(url, selector, headless=False):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)  # Set headless to False to view the process
        page = browser.new_page()

        # Step 1: Navigate to the URL
        page.goto(url, wait_until='domcontentloaded')
        page.wait_for_selector(selector, timeout=30000)  # 30-second timeout
        
        # Get the page content
        return page.content()

def get_all_stats():
    response = requests.get(all_stats_url)
    json = response.json()
    champions = json["data"]
    return champions

def get_champion_names():
    content = load_page(opgg_url, "text=Caitlyn")

    # Find all <tbody> elements
    soup = BeautifulSoup(content, 'html.parser')
    tbodies = soup.find_all("tbody")

    # Find the table containing the champions
    target_tbody = next((tbody for tbody in tbodies if len(tbody.find_all("tr")) > 160), None)
    if not target_tbody:
        raise Exception("Cannot find champion table!")
    
    # Parse out the name
    champion_divs = target_tbody.find_all("tr")
    champion_names = []
    for champion_component in champion_divs:
        name = champion_component.find("strong").text
        champion_names.append(name)
    return champion_names

def get_champion_images(champions):
    images = {}
    for champ in champions:
        print(f"Looking for {champ}")
        image_url = f"https://leagueoflegends.fandom.com/wiki/League_of_Legends_Wiki?file={champ.replace(' ', '_')}_OriginalLoading.jpg"
        try:
            content = load_page(image_url, ".WikiaLightbox .media img", True)
        except:
            print(f"Could not find image for {champ}")
            continue
        soup = BeautifulSoup(content, 'html.parser')
        image = soup.select_one(".WikiaLightbox .media img")['src']
        images[champ] = image
        print(f"Found {champ} image!")
    return images

def main():
    all_stats = get_all_stats()
    champs = get_champion_names()
    images = {}

    data_path = os.path.join(DATA_DIRECTORY_PATH, f"{deck_name}.json")
    if os.path.exists(data_path):
        with open(data_path, "r") as fp:
            previous_data = json.load(fp)
        images = {}
        for entry in previous_data:
            images[entry["title"]] = entry["imageURL"]

    # champs without images
    # champs_without_images = list(set(champs) - set(images.keys()))
    # with concurrent.futures.ThreadPoolExecutor(max_workers=7) as executor:
    #     futures = []
    #     chunk_size = 10
    #     for chunk in chunk_list(champs_without_images, chunk_size):
    #         futures.append(executor.submit(get_champion_images, chunk))

    #     for future in concurrent.futures.as_completed(futures):
    #         parsed_response = future.result()
    #         images.update(parsed_response)

    data = []
    for stats, champ in zip(all_stats, champs):
        if champ not in images:
            continue
        image = images[champ]
        entry = {
            "id": remove_non_alphabetic(champ),
            "title": champ,
            "rank": stats["play"],
            "description": champ,
            "longDescription": champ,
            "imageURL": image,
        }
        entry.update(stats)
        data.append(entry)

    with open(data_path, "w") as fp:
        json.dump(
            data, 
            fp,
        )

main()