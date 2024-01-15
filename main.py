import re
import json
import hashlib
import requests
import time
import sys

def hash_string(input_string):
    sha_signature = hashlib.sha256(input_string.encode()).hexdigest()
    return sha_signature



class ParagraphFormatter:
    def __init__(self, file_path):
        with open(file_path, 'r') as file:
            content = file.read()
        # paragraphs = content.split('\n\n')  # split by blank lines
        paragraphs = content.split('__________________________________________________________________')  # split by blank lines
        self.formatted_paragraphs = [[{"pageContent": p, "metadata": {}}] for p in paragraphs]
        self.ids = [{"id": [hash_string(i)]} for i in paragraphs]
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.formatted_paragraphs):
            raise StopIteration
        result = self.formatted_paragraphs[self.index], self.ids[self.index]
        self.index += 1
        return result


def extract_references_from_file(filename):
    with open(filename, 'r') as file:
        lines = file.readlines()

    references = {}
    for line in lines:
        match = re.search(r'\[(\d+)\]', line)
        if match:
            key = int(match.group(1))  # Convert the string to an integer
            value = re.sub(r'\[\d+\]\s*', '', line).strip()  # Remove the number and the brackets
            references[key] = value

    return references

def replace_bracketed_numbers_with_dict_values(text, dictionary):
    def replacer(match):
        key = int(match.group(1))  # Convert the string to an integer
        return f"[{dictionary.get(key, match.group(0))}]"  # If the key exists in the dictionary, replace it. Otherwise, leave it as is.

    return re.sub(r'\[(\d+)\]', replacer, text)

def extract_paragraphs(bookname):
    # with open(bookname, 'r') as file:
    #     content = file.read()
    paragraphs = bookname.split('\n\n')
    paragraphs = [re.sub(' +', ' ', paragraph.replace('\n', ' ')).strip() for paragraph in paragraphs]
    return paragraphs


    

def remove_paragraphs_with_bracketed_numbers(paragraphs):
    return [paragraph for paragraph in paragraphs if not re.match(r'^\[\d+\].*', paragraph)]

def remove_fileurls(paragraphs):
    return [paragraph for paragraph in paragraphs if not re.match(r'file:', paragraph)]

def split_array(arr, delimiter):
    result = []
    temp = []
    for i in arr:
        if i == delimiter:
            result.append(temp)
            temp = []
        else:
            temp.append(i)
    if temp:
        result.append(temp)
    return result

def main(filename):
    
    with open(filename, 'r') as file:
        content = file.read()
    references = extract_references_from_file(filename)
    paragraphs = extract_paragraphs(content)
    paragraphs = remove_paragraphs_with_bracketed_numbers(paragraphs)
    paragraphs = [replace_bracketed_numbers_with_dict_values(paragraph, references) for paragraph in paragraphs]
    # paragraphs = [remove_fileurls(paragraph) for paragraph in paragraphs]

    with open(f'tmp/{filename}_tmp', 'a') as file:  # Open the file in append mode
        for i, book in enumerate(paragraphs):
            file.write(book)
            file.write('\n\n')  # Append double newlines after each element

    formatter = ParagraphFormatter(f'tmp/{filename}_tmp')


    headers = {
        'Authorization': 'Bearer yourmom',
    }

    for result in formatter:
        response = requests.post("https://langchain-workers.derelict.workers.dev/input", headers=headers, json=result)
        print(f"{response.status_code} + {json.dumps(result)}")
        time.sleep(1)
        # print(f"{json.dumps(result)}")



main(sys.argv[1])


if __name__ == "__main__":
    main(sys.argv[1])