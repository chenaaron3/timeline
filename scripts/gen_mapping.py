from constants import DECK_NAME, GENERATED_DIRECTORY_PATH, JSON_PATH
from utils import snake_to_pascal

import json
import os

"""
The images need to be imported into the codebase instead of being
referenced from the public folder.
Since there are a lot of images, it is worth generating the code.
"""

if __name__ == '__main__':
    # The generated file will be named after the deck name
    generated_path = os.path.join(GENERATED_DIRECTORY_PATH, f"{snake_to_pascal(DECK_NAME)+'Images'}.tsx")

    # Load the JSON data
    with open(JSON_PATH, 'r') as f:
        data = json.load(f)

    contents = """// DO NOT MODIFY! This file is generated automatically.
// Run python3 scripts/gen_mapping.py to update this file.
import { StaticImageData } from 'next/image';

"""

    # Generate the import statements
    for i, entry in enumerate(data):
        id = entry['id']
        image_path = f"@public/{DECK_NAME}/{id}.jpg"
        contents += f"import {snake_to_pascal(id)} from '{image_path}';\n"

    # Generate the map from id to import alias
    contents += "\nexport const IMAGE_MAP: Record<string, StaticImageData> = {\n"
    for i, entry in enumerate(data):
        id = entry['id']
        contents += f"  '{id}': {snake_to_pascal(id)},\n"
    contents += "};"


    with open(generated_path, 'w') as f:
        f.write(contents)