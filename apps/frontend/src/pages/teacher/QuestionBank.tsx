import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { Upload, Plus, Trash2, Sparkles, Loader } from 'lucide-react';

const QuestionBank = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDiff, setFilterDiff] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    subtopic: '',
    difficulty: 'Medium',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
    marks: 1
  });


  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/teacher/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      let url = '/teacher/questions?';
      if (filterSubject) url += `subjectId=${filterSubject}&`;
      if (filterDiff) url += `difficulty=${filterDiff}&`;
      const { data } = await api.get(url);
      setQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchQuestions();
  }, [filterSubject, filterDiff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/questions', formData);
      setShowAdd(false);
      fetchQuestions();
    } catch {
      alert('Error creating question');
    }
  };


  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/teacher/questions/${id}`);
      fetchQuestions();
    } catch {
      alert('Failed to delete');
    }
  };


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
        <h2>Question Bank Management</h2>
        <div className="d-flex gap-2">

          <Link to="/teacher/bulk-import" className="btn btn-outline-primary m-0 d-flex align-items-center text-decoration-none">
            <Upload size={18} className="me-2" /> Bulk Import JSON
          </Link>
          <button className="btn btn-primary-custom d-flex align-items-center" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={18} className="me-2" /> Add Question
          </button>
        </div>
      </div>


      {showAdd && (
        <div className="premium-card p-4 mb-4 fade-in">
          <h5>Create New Question</h5>
          <form onSubmit={handleCreate}>
            <div className="row mb-3">
              <div className="col-md-4">
                <select className="form-select form-control-custom" required value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <input type="text" className="form-control form-control-custom" placeholder="Subtopic" required value={formData.subtopic} onChange={e => setFormData({...formData, subtopic: e.target.value})} />
              </div>
              <div className="col-md-4">
                <select className="form-select form-control-custom" required value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <textarea className="form-control form-control-custom" rows={3} placeholder="Question Text" required value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})}></textarea>
            </div>
            <div className="row mb-3">
              {formData.options.map((opt, i) => (
                <div className="col-md-6 mb-2" key={i}>
                  <div className="input-group">
                    <div className="input-group-text bg-white">
                      <input type="radio" name="correctOpt" checked={formData.correctOptionIndex === i} onChange={() => setFormData({...formData, correctOptionIndex: i})} />
                    </div>
                    <input type="text" className="form-control" placeholder={`Option ${i+1}`} required value={opt} onChange={e => {
                      const newOpts = [...formData.options];
                      newOpts[i] = e.target.value;
                      setFormData({...formData, options: newOpts});
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <textarea className="form-control form-control-custom" rows={2} placeholder="Explanation (Optional)" value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-success">Save Question</button>
          </form>
        </div>
      )}

      <div className="premium-card p-4 fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="row mb-4">
          <div className="col-md-3">
            <select className="form-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Subject</th>
                <th>Subtopic</th>
                <th>Difficulty</th>
                <th>Question</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q._id}>
                  <td>{q.subjectId?.name}</td>
                  <td>{q.subtopic}</td>
                  <td>
                    <span className={`badge ${q.difficulty === 'Easy' ? 'bg-success' : q.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td><div className="text-truncate" style={{ maxWidth: '300px' }}>{q.questionText}</div></td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(q._id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted">No questions found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
