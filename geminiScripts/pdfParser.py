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
from google.api_core.exceptions import DeadlineExceeded
from trackScheme import (
    calculate_hash,
    load_previous_state,
    save_current_state,
    identify_changes,
)



base_file_path = os.path.join(os.path.dirname(__file__),'..','goaScraper','goa_pdf_link.json')
absolute_file_path = os.path.abspath(base_file_path)
output_file = os.path.join(os.path.dirname(__file__), 'structured_results.json')
state_file = 'scheme_state.json'

api_keys = [
    "AIzaSyCwZDOJVmSi7hxrw-1oHadN__3-Qnh3-uE",
    "AIzaSyDun0IvxbLRGtj484dh2H59ZJQY125pozc",
    "AIzaSyDryM70GXyoxoZOUuT-oiJSEypjNohBGDI",
    "AIzaSyAUdZiWi-TBgR5NK43_zs3G4yQEiMm9zpw",
    "AIzaSyCtyRHNl2W0jsFA-yiA2jGaNkG6_zr2mzc",
    "AIzaSyB4XEu-v61Jlxz_otvFPrQfJvPxCgm_FFs",
    "AIzaSyDdahnDepkau1tx5gf4gFiDq0R_hxbwfcg"
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
            except DeadlineExceeded as e:
                print(f"Attempt {attempt + 1} with API key {api_key} failed due to DeadlineExceeded: {str(e)}")
                if attempt < retries - 1:
                    backoff_time = 2 ** attempt
                    print(f"Retrying in {backoff_time} seconds...")
                    time.sleep(backoff_time)
                else:
                    print(f"API key {api_key} exhausted, moving to the next key.")
                    break

            except Exception as e:
                print(f"Attempt {attempt + 1} with API key {api_key} failed due to an unexpected error: {str(e)}")
                if attempt < retries - 1:
                    backoff_time = 2 ** attempt
                    print(f"Retrying in {backoff_time} seconds...")
                    time.sleep(backoff_time)
                else:
                    print(f"API key {api_key} exhausted, moving to the next key.")
                    break
    print("All API keys exhausted, unable to process the document.")
    return None


def main():
    previous_state = load_previous_state(state_file)

    new_schemes, updated_schemes = identify_changes(goaPdfText, previous_state)
    schemes_to_process = new_schemes + updated_schemes

    final_results = []

    for scheme in schemes_to_process:
        extractedSchemeText = parse_document(scheme["pdf_link"])

        if extractedSchemeText:
            result = process_with_api_key_rotation(extractedSchemeText, api_keys)

            if result and result.candidates:
                try:
                    fc = result.candidates[0].content.parts[0].function_call
                    final_data = json.dumps(type(fc).to_dict(fc), indent=4)
                    convert_data = json.loads(final_data)
                    final_converted_data = convert_data.get("args", {})
                    final_converted_data = final_converted_data.get("scheme_details")
                
                    with open(output_file, 'a') as f:
                        if os.stat(output_file).st_size == 0:
                            f.write("[\n")
                            json.dump(final_converted_data, f, indent=4)
                        else:
                            # f.seek(f.tell() - 1, os.SEEK_SET)  
                            f.write(",\n")
                            json.dump(final_converted_data, f, indent=4)
                            
                        
                    print(f"Processed and appended scheme: {scheme['pdf_link']}")
                except IndexError as e:
                    print(f"Error processing the result for {scheme['pdf_link']}: {e}")
            else:
                print(f"Failed to process the scheme: {scheme['pdf_link']}")
        else:
            print(f"Failed to extract text from the document: {scheme['pdf_link']}")
    with open(output_file, 'a') as f:
        f.write("\n]")
    current_state = {scheme["id"]: calculate_hash(scheme) for scheme in goaPdfText}
    save_current_state(state_file, current_state)

if __name__ == "__main__":
    main()

