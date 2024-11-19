import json
import hashlib
import os

def calculate_hash(scheme):
    scheme_string = json.dumps(scheme, sort_keys=True)
    return hashlib.sha256(scheme_string.encode()).hexdigest()

def load_previous_state(state_file):
    if os.path.exists(state_file):
        print("yaha aya tha")
        with open(state_file, 'r') as file:
            return json.load(file)
    print("nahi bhai yaha aya tha")
    return {}

def save_current_state(state_file, state_data):
    with open(state_file, 'w') as file:
        json.dump(state_data, file)

def identify_changes(current_schemes, previous_state):
    new_schemes = []
    updated_schemes = []

    for scheme in current_schemes:
        scheme_id = scheme.get("id")
        scheme_hash = calculate_hash(scheme)

        if scheme_id not in previous_state:
            print("it is present bhai")
            new_schemes.append(scheme)
        elif previous_state[scheme_id] != scheme_hash:
            print("needs to be equal bro")
            updated_schemes.append(scheme)

    return new_schemes, updated_schemes

def process_schemes(new_schemes, updated_schemes):
    for scheme in new_schemes + updated_schemes:
        send_to_gemini_api(scheme)

def send_to_gemini_api(scheme):
    # Dummy function, replace with actual implementation
    print(f"Processing scheme: {scheme['id']}")
