"""
Document parser for extracting text from various file formats.
"""
import PyPDF2
from docx import Document
import io


class DocumentParser:
    """Parse documents in various formats (PDF, DOCX, TXT)."""
    
    def parse_pdf(self, file_content):
        """
        Extract text from PDF file.
        
        Args:
            file_content (bytes): PDF file content
            
        Returns:
            str: Extracted text
        """
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise ValueError(f"Error parsing PDF: {str(e)}")
    
    def parse_docx(self, file_content):
        """
        Extract text from DOCX file.
        
        Args:
            file_content (bytes): DOCX file content
            
        Returns:
            str: Extracted text
        """
        try:
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            raise ValueError(f"Error parsing DOCX: {str(e)}")
    
    def parse_txt(self, file_content):
        """
        Extract text from TXT file.
        
        Args:
            file_content (bytes): TXT file content
            
        Returns:
            str: Extracted text
        """
        try:
            return file_content.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Error parsing TXT: {str(e)}")
    
    def parse(self, file_content, filename):
        """
        Parse document based on file extension.
        
        Args:
            file_content (bytes): File content
            filename (str): Name of the file
            
        Returns:
            str: Extracted text
        """
        extension = filename.lower().split('.')[-1]
        
        if extension == 'pdf':
            return self.parse_pdf(file_content)
        elif extension in ['docx', 'doc']:
            return self.parse_docx(file_content)
        elif extension == 'txt':
            return self.parse_txt(file_content)
        else:
            raise ValueError(f"Unsupported file format: {extension}")
