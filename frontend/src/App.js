import React, { useState } from 'react';
import './App.css';

function App() {
  const [jobFile, setJobFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobUploaded, setJobUploaded] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleJobUpload = async () => {
    if (!jobFile) {
      setMessage('Please select a job description file');
      return;
    }

    const formData = new FormData();
    formData.append('job_file', jobFile);

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/upload-job`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setJobUploaded(true);
        setMessage('✅ Job description processed successfully!');
      } else {
        setMessage('❌ Error: ' + data.detail);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (resumeFiles.length === 0) {
      setMessage('Please select resume files');
      return;
    }

    const formData = new FormData();
    resumeFiles.forEach(file => {
      formData.append('resume_files', file);
    });

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/upload-resumes`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.report);
        setMessage(`✅ Processed ${resumeFiles.length} resumes successfully!`);
      } else {
        setMessage('❌ Error: ' + data.detail);
      }
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🛫 EAA Recruit</h1>
        <p>AI-Powered Recruitment Automation for Ethiopian Airlines</p>
        <p className="subtitle">Automated Candidate Ranking using TF-IDF & Cosine Similarity</p>
      </header>

      <div className="container">
        <div className="section">
          <h2>Step 1: Upload Job Description</h2>
          <p className="instruction">Upload the job description file (PDF, DOCX, or TXT)</p>
          
          <div className="upload-area">
            <div className="upload-icon">📄</div>
            <label htmlFor="job-file">
              <strong>Click to upload job description</strong>
              <p>Supported formats: PDF, DOCX, TXT</p>
            </label>
            <input
              type="file"
              id="job-file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => setJobFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </div>

          {jobFile && <p className="file-name">Selected: {jobFile.name}</p>}
          
          <button 
            className="btn" 
            onClick={handleJobUpload}
            disabled={!jobFile || loading}
          >
            Process Job Description
          </button>
        </div>

        <div className="section">
          <h2>Step 2: Upload Candidate Resumes</h2>
          <p className="instruction">Upload multiple resume files for ranking</p>
          
          <div className="upload-area">
            <div className="upload-icon">📋</div>
            <label htmlFor="resume-files">
              <strong>Click to upload resumes</strong>
              <p>Multiple files accepted • PDF, DOCX, TXT</p>
            </label>
            <input
              type="file"
              id="resume-files"
              accept=".pdf,.docx,.doc,.txt"
              multiple
              onChange={(e) => setResumeFiles(Array.from(e.target.files))}
              style={{ display: 'none' }}
            />
          </div>

          {resumeFiles.length > 0 && (
            <p className="file-name">Selected: {resumeFiles.length} files</p>
          )}
          
          <button 
            className="btn" 
            onClick={handleResumeUpload}
            disabled={!jobUploaded || resumeFiles.length === 0 || loading}
          >
            Rank Candidates
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}

        {results && (
          <div className="results">
            <h2>🎯 Candidate Rankings</h2>
            <div className="summary">
              <h3>📊 Summary</h3>
              <p><strong>Total Candidates:</strong> {results.total_candidates}</p>
              <p><strong>Timestamp:</strong> {new Date(results.timestamp).toLocaleString()}</p>
            </div>

            {results.candidates.map((candidate) => (
              <div key={candidate.candidate_id} className="candidate-card">
                <div className="candidate-rank">Rank #{candidate.rank}</div>
                <p><strong>Candidate:</strong> {candidate.candidate_id}</p>
                <div className="match-score">Match Score: {candidate.match_percentage}%</div>
                <p className="similarity">Similarity Score: {candidate.similarity_score}</p>
                
                {candidate.top_matching_terms.length > 0 && (
                  <div className="matching-terms">
                    <p><strong>Top Matching Terms:</strong></p>
                    <div className="terms-container">
                      {candidate.top_matching_terms.slice(0, 5).map((term, idx) => (
                        <span key={idx} className="term-tag">
                          {term.term} ({term.relevance.toFixed(3)})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
