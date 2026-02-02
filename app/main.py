"""
Flask web application for EAA Recruit platform.
"""
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import os
from app.models.recruitment_engine import RecruitmentEngine

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize recruitment engine
engine = RecruitmentEngine()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx', 'doc'}


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


@app.route('/upload_job', methods=['POST'])
def upload_job():
    """Upload and process job description."""
    try:
        if 'job_file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['job_file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Use PDF, DOCX, or TXT'}), 400
        
        # Read and parse file
        file_content = file.read()
        filename = secure_filename(file.filename)
        
        # Parse document
        job_text = engine.parse_document(file_content, filename)
        
        # Process job description
        result = engine.process_job_description(job_text)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/upload_resumes', methods=['POST'])
def upload_resumes():
    """Upload and process candidate resumes."""
    try:
        if 'resume_files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('resume_files')
        
        if not files or all(f.filename == '' for f in files):
            return jsonify({'error': 'No files selected'}), 400
        
        # Process all resumes
        resumes = []
        for file in files:
            if file and allowed_file(file.filename):
                file_content = file.read()
                filename = secure_filename(file.filename)
                
                # Parse document
                resume_text = engine.parse_document(file_content, filename)
                
                resumes.append({
                    'id': filename,
                    'text': resume_text
                })
        
        if not resumes:
            return jsonify({'error': 'No valid resume files provided'}), 400
        
        # Rank candidates
        result = engine.rank_candidates(resumes)
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200


if __name__ == '__main__':
    # Use debug=True only for development. Set to False for production.
    import os
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
