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