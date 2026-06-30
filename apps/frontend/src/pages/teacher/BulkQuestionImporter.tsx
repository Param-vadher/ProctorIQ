import React, { useState } from 'react';
import { UploadCloud, FileJson, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const BulkQuestionImporter: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setSuccessMsg('');

    try {
      // 1. Read file content
      const text = await file.text();
      const parsedData = JSON.parse(text);

      if (!Array.isArray(parsedData)) {
        throw new Error("File must contain a JSON array of questions.");
      }

      // 2. Fetch existing subjects
      const { data: existingSubjects } = await api.get('/teacher/subjects');
      const subjectMap: Record<string, string> = {}; // map of subjectName to subjectId
      existingSubjects.forEach((s: any) => {
        subjectMap[s.name.toLowerCase()] = s._id;
      });

      const formattedQuestions = [];

      for (const q of parsedData) {
        // Find or create subject
        const subjectName = q.subject || 'General';
        const normalizedName = subjectName.toLowerCase();
        
        if (!subjectMap[normalizedName]) {
          // Create new subject automatically
          const { data: newSubject } = await api.post('/teacher/subjects', { name: subjectName });
          subjectMap[normalizedName] = newSubject._id;
        }

        const subjectId = subjectMap[normalizedName];

        // Find correct option index
        const correctIndex = q.options?.findIndex((opt: string) => opt === q.correctAnswer) ?? 0;

        let diff = 'Medium';
        if (q.difficulty) {
          const d = q.difficulty.toLowerCase();
          if (d === 'easy') diff = 'Easy';
          if (d === 'hard') diff = 'Hard';
        }

        formattedQuestions.push({
          subjectId,
          subtopic: q.topic || 'General',
          difficulty: diff,
          questionText: q.text,
          options: q.options || [],
          correctOptionIndex: correctIndex >= 0 ? correctIndex : 0,
          explanation: q.explanation || `The correct answer is ${q.correctAnswer}`,
          marks: q.marks || 1
        });
      }

      // 3. Send bulk import
      await api.post('/teacher/questions/bulk', { questions: formattedQuestions });

      setSuccessMsg(`Successfully imported ${formattedQuestions.length} questions! New subjects were created if they didn't exist.`);
      setFile(null);
    } catch (err: any) {
      alert(`Error processing file: ${err.message || 'Unknown error'}`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="mb-4 fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Bulk Question Importer</h2>
      <div className="premium-card p-5 text-center">
        <p className="text-muted mb-4">Upload a structured JSON file containing questions to quickly populate the Question Bank.</p>

        <div 
          className={`p-5 border border-2 rounded ${dragActive ? 'border-primary bg-light' : 'border-dashed border-secondary'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
        >
          {file ? (
            <div className="d-flex flex-column align-items-center">
              <FileJson size={48} className="text-success mb-3" />
              <h5 className="fw-bold">{file.name}</h5>
              <p className="text-muted small">{(file.size / 1024).toFixed(2)} KB</p>
              
              {successMsg && (
                <div className="alert alert-success mt-3 d-flex align-items-center">
                  <CheckCircle size={20} className="me-2" />
                  {successMsg}
                </div>
              )}

              <div className="d-flex gap-3 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => { setFile(null); setSuccessMsg(''); }}>
                  Cancel
                </button>
                <button className="btn btn-primary-custom" onClick={handleUpload} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Process and Import'}
                </button>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center">
              <UploadCloud size={48} className="text-muted mb-3" />
              <h5>Drag & Drop your JSON file here</h5>
              <p className="text-muted">or click to browse from your computer</p>
              <input 
                type="file" 
                accept=".json" 
                className="d-none" 
                id="fileUpload" 
                onChange={(e) => e.target.files && setFile(e.target.files[0])} 
              />
              <label htmlFor="fileUpload" className="btn btn-outline-custom mt-3">Select File</label>
            </div>
          )}
        </div>

        {successMsg && !file && (
          <div className="alert alert-success mt-4 d-flex align-items-center justify-content-center">
            <CheckCircle size={20} className="me-2" />
            {successMsg}
          </div>
        )}

        <div className="text-start mt-5">
          <h6 className="fw-bold">JSON Format Structure Requirements:</h6>
          <pre className="bg-light p-3 rounded small text-muted">
{`[
  {
    "text": "What is the capital of France?",
    "type": "multiple_choice",
    "difficulty": "Easy",
    "subject": "Geography",
    "topic": "World Capitals",
    "options": ["London", "Paris", "Berlin", "Madrid"],
    "correctAnswer": "Paris",
    "marks": 1
  }
]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BulkQuestionImporter;
