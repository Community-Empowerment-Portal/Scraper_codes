import requests
import io
import pdfplumber
from docx import Document
import pypandoc
import os
import json
from structureGemini import process_and_structure_document
import time
from google.api_core.exceptions import ResourceExhausted
from dotenv import load_dotenv

load_dotenv()

base_file_path = os.path.join(os.path.dirname(__file__),'..','goaScraper','goa_pdf_link.json')
absolute_file_path = os.path.abspath(base_file_path)

api_keys = [
    os.getenv("API_KEY_1"),
    os.getenv("API_KEY_2"),
    os.getenv("API_KEY_3"),
    os.getenv("API_KEY_4"),
    os.getenv("API_KEY_5"),
    os.getenv("API_KEY_6"),
    os.getenv("API_KEY_7")
]




print("ye dekhna:",absolute_file_path)

with open(absolute_file_path, "r") as file:
    goaPdfText = json.load(file)

def parse_pdf(pdf_url):
    pdfText = ''
    response = requests.get(pdf_url)
    response.raise_for_status()

    pdf_buffer = io.BytesIO(response.content)

    with pdfplumber.open(pdf_buffer) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            pdfText += text
    return pdfText


def parse_docx(docx_url):
    """ Parse DOCX file from URL and extract text """
    docxText = ''
    response = requests.get(docx_url)
    response.raise_for_status()

    docx_buffer = io.BytesIO(response.content)
    doc = Document(docx_buffer)

    # Extract text from paragraphs
    for para in doc.paragraphs:
        docxText += para.text + "\n"
    return docxText

def parse_doc(doc_url):
    docText = ''
    response = requests.get(doc_url)
    response.raise_for_status()

    docText = pypandoc.convert_file(io.BytesIO(response.content), 'plain')
    return docText

def parse_document(url):
    print("ye url",url)

    file_extension = url.split('.')[-1].lower()


    if file_extension == 'pdf':
        return parse_pdf(url)

    elif file_extension == 'docx':
        return parse_docx(url)


    elif file_extension == 'doc':
        return parse_doc(url)

    else:
        pass


def process_with_api_key_rotation(extractedSchemeText, api_keys, retries=5):
    for api_key in api_keys:
        print(f"Trying API key: {api_key}")
        for attempt in range(retries):
            try:
                result = process_and_structure_document(extractedSchemeText, api_key)
                return result

            except ResourceExhausted as e:
                print(f"Attempt {attempt + 1} with API key {api_key} failed: {str(e)}")
                if attempt < retries - 1:
                    backoff_time = 2 ** attempt
                    print(f"Retrying in {backoff_time} seconds...")
                    time.sleep(backoff_time)
                else:
                    print(f"API key {api_key} exhausted, moving to the next key.")
                    break
    print("All API keys exhausted, unable to process the document.")
    return None




# for scheme in goaPdfText:
#     extractedSchemeText = parse_document(scheme["pdf_link"])
#     result = process_and_structure_document(extractedSchemeText, api_key)
#     fc = result.candidates[0].content.parts[0].function_call
#     final_data = json.dumps(type(fc).to_dict(fc), indent=4)
#     convert_data = json.loads(final_data)
#     final_converted_data = convert_data.get("args",{})
#     print("This is structured result:", json.dumps(final_converted_data, indent=4))

final_results = []

for scheme in goaPdfText:
    extractedSchemeText = parse_document(scheme["pdf_link"])

    if extractedSchemeText:
        result = process_with_api_key_rotation(extractedSchemeText, api_keys)

        if result:
            fc = result.candidates[0].content.parts[0].function_call
            final_data = json.dumps(type(fc).to_dict(fc), indent=4)
            convert_data = json.loads(final_data)
            final_converted_data = convert_data.get("args", {})
            final_converted_data = final_converted_data.get("state")
            # final_scheme_json = json.dumps(final_converted_data, indent=4)
            final_results.append(final_converted_data)
            print("This is structured result:", final_converted_data)
        else:
            print(f"Failed to process the scheme: {scheme['pdf_link']}")
    else:
        print(f"Failed to extract text from the PDF: {scheme['pdf_link']}")


output_file = os.path.join(os.path.dirname(__file__), 'structured_results.json')
with open(output_file, 'w') as f:
    json.dump(final_results, f, indent=4)

print(f"Structured results have been written to {output_file}")



