from abc import ABC, abstractmethod
import concurrent.futures
from utils import chunk_list, remove_non_alphabetic, list_to_dict, dict_to_list
import json
import os
from constants import DATA_DIRECTORY_PATH

class Parser(ABC):
    @abstractmethod
    def get_deck_name(self):
        pass

    @abstractmethod
    def get_entries(self):
        pass

    @abstractmethod
    def process_entry(self, entry):
        pass

    def get_data_path(self):
        return os.path.join(DATA_DIRECTORY_PATH, f"{self.get_deck_name()}.json")

    def flush(self, data):
        print("Flushing!")
        with open(self.get_data_path(), "w") as fp:
            json.dump(
                data, 
                fp,
            )

    def parse(self):
        data_path = self.get_data_path()
        # Load stats from file if exists
        if os.path.exists(data_path):
            with open(data_path, "r") as fp:
                # apply previous data on top of stats
                all_stats = json.load(fp)
        else:
            # Get quick catalogue of information (usually from a table)
            all_stats = self.get_entries()
        all_stats_lookup = list_to_dict(all_stats)

        # Process data in chunks and flush back into file for checkpointing
        for chunk in chunk_list(list(all_stats_lookup.values()), 5):
            with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                futures = []
                for entry in chunk:
                    futures.append(executor.submit(self.process_entry, entry))
                for future in concurrent.futures.as_completed(futures):
                    parsed_response, valid = future.result()
                    if not valid:
                        print("Cannot process entry!", parsed_response)
                        del all_stats_lookup[parsed_response['id']]
                    else:
                        print("Processed entry!", parsed_response)
                        all_stats_lookup[parsed_response['id']] = parsed_response
            self.flush(dict_to_list(all_stats_lookup))
        self.flush(dict_to_list(all_stats_lookup))