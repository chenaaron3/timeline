import json
import os
import time
from playwright.sync_api import sync_playwright
from constants import DECK_NAME, PUBLIC_DIRECTORY_PATH, JSON_PATH, LIST_PATH
import concurrent.futures
import json
import requests

try:
    model_name = json.load(open(LIST_PATH))["image_model"]
except:
    model_name = 'logo-generator'

# URL of the image generator
gen_url = 'https://deepai.org/machine-learning-model/' + model_name
# Name the save directory after the json name. Save into public folder
save_directory_path = os.path.join(PUBLIC_DIRECTORY_PATH,DECK_NAME)

"""
1. Open browser to https://deepai.org/machine-learning-model/anime-world-generator
2. Select HD Model
3. Select Quality Preference
4. Choose Shape 4
4. Enter the image prompt
5. Click Generate
6. Wait for the result to generate and download the image src into public folder
"""
def generate_image(prompt: str, title: str):
    print("Generating image for", title)
    with sync_playwright() as p:
        # Launch the browser
        browser = p.chromium.launch(headless=False)  # Set headless to False to view the process
        page = browser.new_page()

        # Step 1: Navigate to the URL
        page.goto(gen_url, wait_until='domcontentloaded')
        page.wait_for_selector('#modelHdButton')

        # Step 2: Select HD Model
        page.click('#modelHdButton')

        # Step 3: Select Quality Preference
        page.click('#modelQualityButton')

        # Step 4: Choose Shape 4
        page.click('#modelEditButton')
        page.click('#edit_shape_4')

        # Step 5: Enter the image prompt
        prompt_field = page.locator('textarea[name="text"]')
        prompt_field.fill(prompt)

        # Step 6: Click Generate button
        page.click('#modelSubmitButton')

        # Step 7: Wait for the result to generate
        page.wait_for_selector('#place_holder_picture_model img:not(.placeholder-image)')

        # Step 8: Download the generated image
        image_src = page.get_attribute('#place_holder_picture_model img', 'src')  # Get the image URL

        # Download the image and save it to a file
        image_response = page.goto(image_src)
        image_buffer = image_response.body()

        save_path = os.path.join(save_directory_path, title + ".jpg")

        # Save the image to the specified path
        os.makedirs(save_directory_path, exist_ok=True)
        with open(save_path, 'wb') as f:
            f.write(image_buffer)
        
        print(f'Image successfully saved at {save_path}')

        # Close the browser
        browser.close()

def download_image(id, url):
    # Download image
    response = requests.get(url)
    os.makedirs(save_directory_path, exist_ok=True)
    with open(os.path.join(save_directory_path, f"{id}.jpg"), 'wb') as f:
        f.write(response.content)
    print("Downloaded image for ", id)

if __name__ == '__main__':
    with open(JSON_PATH, 'r') as f:
        data = json.load(f)

    # Skip downloading this entry if it already exists
    if os.path.exists(save_directory_path):
        existing_images = set([os.path.splitext(p)[0] for p in os.listdir(save_directory_path)])
    else:
        existing_images = set()

    start = time.time()
    # Generate images in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        def process_entry(entry):
            if "imagePrompt" in entry:
                generate_image(entry["title"] + ": " + entry["imagePrompt"], entry["id"])
            elif "imageURL" in entry:
                download_image(entry["id"], entry["imageURL"])
        for entry in data:
            if entry["id"] not in existing_images:
                executor.submit(process_entry, entry)
    end = time.time()
    print(f'Elapsed time: {end - start} seconds')
    print('All images generated successfully')