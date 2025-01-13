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

def chunk_list(lst, chunk_size):
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]