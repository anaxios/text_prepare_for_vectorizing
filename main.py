from importlib import metadata
import re
import json
import hashlib
import requests
import time
import sys
import os

working_directory = os.getcwd()

def hash_string(input_string):
    sha_signature = hashlib.sha256(input_string.encode()).hexdigest()
    return sha_signature[:31]



def extract_references_from_paragraphs(paragraphs):
    references = {}
    for line in paragraphs:
        match = re.search(r'\[(\d+)\]', line)
        if match:
            key = int(match.group(1))  # Convert the string to an integer
            value = re.sub(r'\[\d+\]\s*', '', line).strip()  # Remove the number and the brackets
            references[key] = value

    return references

def replace_bracketed_numbers_with_dict_values(dictionary):
    def with_text(text):
        def replacer(match):
            key = int(match.group(1))  # Convert the string to an integer
            return f"[{dictionary.get(key, match.group(0))}]"  # If the key exists in the dictionary, replace it. Otherwise, leave it as is.
        return re.sub(r'\[(\d+)\]', replacer, text)
    return with_text

def extract_paragraphs(bookname):
    paragraphs = bookname.split('\n\n')
    return paragraphs

def remove_line_from_string(s):
    return re.sub('_{3,}', '', s)

def trim_whitespace(s):
    return re.sub(' +', ' ', s).strip()

def replace_newlines_with_spaces(s):
    return re.sub('\n', ' ', s)

def remove_reference_lines_from_paragraph(paragraph):
    return None if re.match(r'^\[\d+\].*', paragraph) else paragraph

def remove_paraphraphs_shorter_than(minimum):
        def with_paragraph(paragraph):
            temp = paragraph.split(' ')
            return None if len(temp) <= minimum else paragraph
        return with_paragraph

def transform_paragraphs(paragraphs, algorithm):
    temp = [algorithm(paragraph) for paragraph in paragraphs]
    return [paragraph for paragraph in temp if paragraph]

def match_paragraphs_to_hashes(paragraphs, hash_function=hash_string):
    dict = {}
    for paragraph in paragraphs:
        key = hash_function(paragraph)
        dict[key] = paragraph
    return dict

class Paragraph_format_to_vector_json:
    def __init__(self, paragraphs, metadata):
        self.index = 0
        self.formatted_paragraphs = []
        self.ids = []

        for key, val in paragraphs.items():
            self.formatted_paragraphs.append({"pageContent": val, "metadata": metadata })
            self.ids.append({"ids": [key]})

    def __iter__(self):
        return self

    def __next__(self):
        if self.index >= len(self.formatted_paragraphs):
            raise StopIteration
        result = [self.formatted_paragraphs[self.index]], self.ids[self.index]
        self.index += 1
        return result

def main(file_path):
    filename = os.path.basename(file_path)

    with open(file_path, 'r') as file:
        content = file.read()

    paragraphs = extract_paragraphs(content)

    paragraphs = transform_paragraphs(paragraphs, replace_newlines_with_spaces)
    paragraphs = transform_paragraphs(paragraphs, remove_line_from_string)
    paragraphs = transform_paragraphs(paragraphs, trim_whitespace)

    # now that it's cleaned up, we can extract the references
    references = extract_references_from_paragraphs(paragraphs)

    paragraphs = transform_paragraphs(paragraphs, remove_reference_lines_from_paragraph)
    paragraphs = transform_paragraphs(paragraphs, replace_bracketed_numbers_with_dict_values(references))
    paragraphs = transform_paragraphs(paragraphs, remove_paraphraphs_shorter_than(12))

    paragraphs_hashes = match_paragraphs_to_hashes(paragraphs)

    paragraphs = Paragraph_format_to_vector_json(paragraphs_hashes, {"filename": filename})


    headers = {
        'Authorization': 'Bearer yourmom',
    }

    for result in paragraphs:
        response = requests.post("https://langchain-workers.derelict.workers.dev/input", headers=headers, json=result)
        print(f"{response.status_code} {json.dumps(response.text)} + {json.dumps(result)}")
        # time.sleep(1)
        # print(f"{json.dumps(result)}")





if __name__ == "__main__":
    main(sys.argv[1])