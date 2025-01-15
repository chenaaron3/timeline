import re

def snake_to_pascal(snake_str):
    # Split the string by underscores and capitalize the first letter of each part
    if "_" in snake_str:
        parts = snake_str.split('_')
    elif "-" in snake_str:
        parts = snake_str.split('-')
    else:
        return snake_str.capitalize()
    pascal_str = ''.join(word.capitalize() for word in parts)
    return pascal_str

def strip_numbers(s):
    digit_map = {
        '0': 'zero',
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine',
    }
    return re.sub(r'\d', lambda match: digit_map[match.group()], s)

def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

def remove_non_alphabetic(input_string):
    """
    Removes all non-alphabetic characters from the input string.
    
    Args:
        input_string (str): The string to process.
    
    Returns:
        str: A string containing only alphabetic characters.
    """
    return ''.join(char for char in input_string if char.isalpha())