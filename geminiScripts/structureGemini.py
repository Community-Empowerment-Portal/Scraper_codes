import google.generativeai as genai
import os
import textwrap
import json







# BELOW FUNCTION IS FOR GETTING STRUCTURED JSON FORMAT FROM PDF EXTRACTED TEXT

def process_and_structure_document(document_extracted_text: str, api_key: str):

    genai.configure(api_key=api_key)

    beneficiary = genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'beneficiary_type': genai.protos.Schema(type=genai.protos.Type.STRING)
        },
        required=['beneficiary_type']
    )

    sponsor = genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'sponsor_type': genai.protos.Schema(type=genai.protos.Type.STRING)
        },
        required=['sponsor_type']
    )

    criteria = genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'description': genai.protos.Schema(type=genai.protos.Type.STRING)
        },
        required=['description']
    )

    procedure = genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'step_description': genai.protos.Schema(type=genai.protos.Type.STRING)
        },
        required=['step_description']
    )

    scheme = genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={
            'title': genai.protos.Schema(type=genai.protos.Type.STRING),
            'department_name': genai.protos.Schema(type=genai.protos.Type.STRING),
            'introduced_on': genai.protos.Schema(type=genai.protos.Type.STRING),
            'valid_upto': genai.protos.Schema(type=genai.protos.Type.STRING),
            'funding_pattern': genai.protos.Schema(type=genai.protos.Type.STRING),
            'description': genai.protos.Schema(type=genai.protos.Type.STRING),
            'scheme_link': genai.protos.Schema(type=genai.protos.Type.STRING),
            'beneficiaries': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=beneficiary),
            'documents': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=genai.protos.Schema(type=genai.protos.Type.STRING)),
            'sponsors': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=sponsor),
            'criteria': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=criteria),
            'procedures': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=procedure),
            'tags': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=genai.protos.Schema(type=genai.protos.Type.STRING))
        },
        required=['title', 'introduced_on', 'valid_upto', 'funding_pattern', 'description', 'scheme_link', 'beneficiaries', 'documents', 'sponsors', 'criteria', 'procedures', 'tags']
    )

    # department = genai.protos.Schema(
    #     type=genai.protos.Type.OBJECT,
    #     properties={
    #         'department_name': genai.protos.Schema(type=genai.protos.Type.STRING),
    #         'created_at': genai.protos.Schema(type=genai.protos.Type.STRING),
    #         'schemes': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=scheme)
    #     },
    #     required=['department_name', 'created_at', 'schemes']
    # )

    # state = genai.protos.Schema(
    #     type=genai.protos.Type.OBJECT,
    #     properties={
    #         'state_name': genai.protos.Schema(type=genai.protos.Type.STRING),
    #         'created_at': genai.protos.Schema(type=genai.protos.Type.STRING),
    #         'departments': genai.protos.Schema(type=genai.protos.Type.ARRAY, items=department)
    #     },
    #     required=['state_name', 'created_at', 'departments']
    # )

    add_to_database = genai.protos.FunctionDeclaration(
        name="add_to_database",
        description=textwrap.dedent("""\
            Adds entities to the database.
            """),
        parameters=genai.protos.Schema(
            type=genai.protos.Type.OBJECT,
            properties={
                'scheme_details': scheme
            }
        )
    )

    model = genai.GenerativeModel(
        model_name='models/gemini-1.5-pro-latest',
        tools=[add_to_database]
    )


    # absolute_file_path = os.path.abspath(document_extracted_text)
    # print("Absolute file path:", absolute_file_path)
    
    # with open(absolute_file_path, "r") as file:
    #     goaPdfText = json.load(file)

    # Generate the content and call the API function
    result = model.generate_content(f"""
    Please add the following information from the extracted document text into the structured database:

    {document_extracted_text}
    """, tool_config={'function_calling_config': 'ANY'}, request_options={"timeout": 1000})

    return result


