import PyPDF2

# Open and read the PDF
with open('CAFETERIA ORDERING & LOYALTY REWARD SYSTEM.pdf', 'rb') as pdf_file:
    reader = PyPDF2.PdfReader(pdf_file)
    
    print(f"Total pages: {len(reader.pages)}")
    
    # Extract all text
    full_text = ""
    for page_num, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        full_text += f"\n\n{'='*80}\nPAGE {page_num}\n{'='*80}\n\n"
        full_text += text
    
    # Save to file
    with open('pdf_extracted_text.txt', 'w', encoding='utf-8') as output_file:
        output_file.write(full_text)
    
    print(f"Extracted text saved to pdf_extracted_text.txt")
    print(f"Total characters: {len(full_text)}")
    print(f"Estimated words: {len(full_text.split())}")
