import { useState } from 'react';
import axios from 'axios';
import { Upload, Search, Loader2, FileText, MessageSquare } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [queryResult, setQueryResult] = useState(null);

  const handleTextUpload = async () => {
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/upload-text`, { text });
      setUploadResult(response.data);
      setText('');
    } catch (error) {
      alert('Error uploading text: ' + error.message);
    }
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadResult(response.data);
      setFile(null);
    } catch (error) {
      alert('Error uploading file: ' + error.message);
    }
    setLoading(false);
  };

  const handleQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/query`, {
        query,
        top_k: 5
      });
      setQueryResult(response.data);
    } catch (error) {
      alert('Error processing query: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 Mini RAG System</h1>
        <p>Retrieval-Augmented Generation with Citations</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={18} />
          Upload Data
        </button>
        <button
          className={`tab ${activeTab === 'query' ? 'active' : ''}`}
          onClick={() => setActiveTab('query')}
        >
          <Search size={18} />
          Query
        </button>
      </div>

      <div className="container">
        {activeTab === 'upload' && (
          <div className="upload-section">
            <div className="input-group">
              <label>
                <FileText size={20} />
                Paste Text
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here..."
                rows={8}
              />
              <button onClick={handleTextUpload} disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
                Upload Text
              </button>
            </div>

            <div className="divider">OR</div>

            <div className="input-group">
              <label>
                <Upload size={20} />
                Upload File (.txt)
              </label>
              <input
                type="file"
                accept=".txt"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button onClick={handleFileUpload} disabled={loading || !file}>
                {loading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
                Upload File
              </button>
            </div>

            {uploadResult && (
              <div className="result success">
                <h3>✅ Upload Successful</h3>
                <p>Chunks created: {uploadResult.chunks_created}</p>
                <p>Time taken: {uploadResult.time_taken}s</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'query' && (
          <div className="query-section">
            <div className="input-group">
              <label>
                <MessageSquare size={20} />
                Ask a Question
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to know?"
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
              />
              <button onClick={handleQuery} disabled={loading}>
                {loading ? <Loader2 className="spin" size={18} /> : <Search size={18} />}
                Search
              </button>
            </div>

            {queryResult && (
              <div className="query-result">
                <div className="answer-box">
                  <h3>Answer:</h3>
                  <p>{queryResult.answer}</p>
                </div>

                <div className="metadata">
                  <span>📊 {queryResult.chunks_retrieved} chunks retrieved</span>
                  <span>🔤 {queryResult.tokens_used} tokens used</span>
                  <span>⏱️ {queryResult.time_taken}s</span>
                </div>

                {queryResult.citations.length > 0 && (
                  <div className="citations">
                    <h3>Sources & Citations:</h3>
                    {queryResult.citations.map((citation) => (
                      <div key={citation.id} className="citation">
                        <div className="citation-header">
                          <strong>[{citation.id}]</strong>
                          <span className="score">Score: {citation.relevance_score}</span>
                        </div>
                        <p>{citation.text}</p>
                        <small>Source: {citation.source}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;