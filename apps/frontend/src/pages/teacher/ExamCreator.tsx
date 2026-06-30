import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, Clock, Calendar, CheckSquare, Plus } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ExamCreator = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
  
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', description: '' });

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    subtopic: '',
    difficulty: 'medium',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    explanation: '',
    marks: 1
  });

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    windowStart: '',
    windowEnd: '',
    proctoringEnabled: true,
    manualQuestions: [] as string[],
    assignedStudents: [] as string[]
  });

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/teacher/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/teacher/students');
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchStudents();
  }, []);

  const fetchQuestions = async () => {
    if (!formData.subjectId) return;
    try {
      const { data } = await api.get(`/teacher/questions?subjectId=${formData.subjectId}`);
      setAvailableQuestions(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch questions when subject changes
  useEffect(() => {
    if (formData.subjectId) {
      fetchQuestions();
      // Clear manual selections on subject change
      setFormData(prev => ({ ...prev, manualQuestions: [] }));
    } else {
      setAvailableQuestions([]);
    }
  }, [formData.subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.manualQuestions.length === 0) {
      return toast.error('Please select at least one question for this exam.');
    }
    try {
      await api.post('/teacher/exams', formData);
      toast.success('Exam created successfully!');
      // reset
      setFormData({
        title: '',
        subjectId: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        windowStart: '',
        windowEnd: '',
        proctoringEnabled: true,
        manualQuestions: [],
        assignedStudents: []
      });
    } catch {
      toast.error('Failed to create exam');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teacher/subjects', newSubject);
      toast.success('Subject created successfully!');
      setShowSubjectModal(false);
      setNewSubject({ name: '', code: '', description: '' });
      fetchSubjects();
    } catch {
      toast.error('Failed to create subject');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId) return toast.error('Please select a subject first!');
    
    try {
      await api.post('/teacher/questions', { ...newQuestion, subjectId: formData.subjectId });
      toast.success('Question added to bank successfully!');
      setShowQuestionModal(false);
      setNewQuestion({
        subtopic: '',
        difficulty: 'medium',
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        marks: 1
      });
      fetchQuestions(); // Refresh list
    } catch {
      toast.error('Failed to create question');
    }
  };

  const toggleQuestionSelection = (qId: string) => {
    setFormData(prev => {
      const isSelected = prev.manualQuestions.includes(qId);
      return {
        ...prev,
        manualQuestions: isSelected 
          ? prev.manualQuestions.filter(id => id !== qId) 
          : [...prev.manualQuestions, qId]
      };
    });
  };

  const toggleStudentSelection = (sId: string) => {
    setFormData(prev => {
      const isSelected = prev.assignedStudents.includes(sId);
      return {
        ...prev,
        assignedStudents: isSelected 
          ? prev.assignedStudents.filter(id => id !== sId) 
          : [...prev.assignedStudents, sId]
      };
    });
  };

  const toggleSelectAllStudents = () => {
    if (formData.assignedStudents.length === students.length) {
      setFormData(prev => ({ ...prev, assignedStudents: [] }));
    } else {
      setFormData(prev => ({ ...prev, assignedStudents: students.map(s => s._id) }));
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } }
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: 'var(--bg-porcelain)', minHeight: '100vh' }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <h2 className="mb-4 fw-bold" style={{ color: 'var(--primary-deep-slate)' }}>Create New Exam</h2>
        
        <form onSubmit={handleSubmit}>
          <motion.div variants={childVariants} className="premium-card p-5 mb-4 border-0" style={{ borderRadius: '16px' }}>
            <h5 className="mb-4 fw-bold text-muted border-bottom pb-3">General Information</h5>
            
            <div className="row mb-4 g-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">Exam Title</label>
                <input type="text" className="form-control form-control-custom bg-light" required placeholder="e.g. Midterm Assessment"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">Subject</label>
                <div className="d-flex gap-2">
                  <select className="form-select form-control-custom bg-light" required
                    value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <button type="button" className="btn btn-outline-primary fw-bold" onClick={() => setShowSubjectModal(true)} title="Add New Subject">
                    + Add
                  </button>
                </div>
              </div>
              
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary"><Clock size={14} className="me-1"/> Duration (mins)</label>
                <input type="number" className="form-control form-control-custom bg-light" required min={1}
                  value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Total Marks</label>
                <input type="number" className="form-control form-control-custom bg-light" required min={1}
                  value={formData.totalMarks} onChange={e => setFormData({...formData, totalMarks: Number(e.target.value)})} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Passing Marks</label>
                <input type="number" className="form-control form-control-custom bg-light" required min={1}
                  value={formData.passingMarks} onChange={e => setFormData({...formData, passingMarks: Number(e.target.value)})} />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Security Option</label>
                <div className="form-check form-switch p-2 rounded glass-panel border w-100 d-flex align-items-center m-0" style={{ height: '42px', paddingLeft: '0.5rem' }}>
                  <input className="form-check-input m-0 ms-1 me-3" type="checkbox" role="switch" id="proctoringSwitch" style={{ cursor: 'pointer' }}
                    checked={formData.proctoringEnabled} onChange={e => setFormData({...formData, proctoringEnabled: e.target.checked})} />
                  <label className="form-check-label fs-6 fw-bold mb-0" style={{ color: 'var(--text-primary)', cursor: 'pointer' }} htmlFor="proctoringSwitch">Strict Proctoring</label>
                </div>
              </div>
            </div>

            <h5 className="mb-4 mt-5 fw-bold text-muted border-bottom pb-3"><Calendar size={18} className="me-2 text-primary"/> Availability Controls</h5>
            <div className="row mb-4 g-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">Window Start Time</label>
                <input type="datetime-local" className="form-control form-control-custom bg-light" required 
                  value={formData.windowStart} onChange={e => setFormData({...formData, windowStart: e.target.value})} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-secondary">Window End Time</label>
                <input type="datetime-local" className="form-control form-control-custom bg-light" required 
                  value={formData.windowEnd} onChange={e => setFormData({...formData, windowEnd: e.target.value})} />
              </div>
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="premium-card p-5 mb-4 border-0" style={{ borderRadius: '16px' }}>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
              <h5 className="fw-bold text-muted mb-0">Selective Access Control</h5>
              <button 
                type="button" 
                className="btn btn-sm btn-outline-primary fw-bold rounded-pill"
                onClick={toggleSelectAllStudents}
              >
                {formData.assignedStudents.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All Students'}
              </button>
            </div>
            
            <p className="small text-muted mb-4">Only the students explicitly chosen below will be allowed to view and take this exam. Currently selected: <strong>{formData.assignedStudents.length}</strong> / {students.length}</p>
            
            <div className="row g-3 max-vh-50 overflow-auto minimal-scrollbar">
              {students.length === 0 ? (
                <div className="col-12 text-center py-4 text-muted">No students found in the system.</div>
              ) : (
                students.map((student) => {
                  const isAssigned = formData.assignedStudents.includes(student._id);
                  return (
                    <div className="col-md-4 col-lg-3" key={student._id}>
                      <div 
                        className={`p-3 rounded-4 border cursor-pointer transition-all ${isAssigned ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-white'}`}
                        onClick={() => toggleStudentSelection(student._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center">
                          <input 
                            type="checkbox" 
                            className="custom-checkbox-neo me-3" 
                            checked={isAssigned}
                            onChange={() => {}} // handled by parent div click
                          />
                          <div>
                            <div className="fw-bold small" style={{ color: 'var(--text-primary)' }}>{student.name}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>{student.email}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          <motion.div variants={childVariants} className="mb-4">
            <h4 className="fw-bold mb-4 px-2" style={{ color: 'var(--primary-deep-slate)' }}>Exam Questions</h4>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-0 border-0 overflow-hidden d-flex flex-column" style={{ borderRadius: '16px', maxHeight: '600px' }}
            >
              <div className="p-4 bg-white border-bottom d-flex justify-content-between align-items-center z-index-1 position-relative shadow-sm">
                <div>
                  <h5 className="fw-bold mb-1"><CheckSquare size={20} className="me-2 text-primary"/> Select Questions</h5>
                  <p className="text-muted small mb-0">Showing {availableQuestions.length} available questions for this subject. Selected: {formData.manualQuestions.length}</p>
                </div>
                <button 
                  type="button" 
                  className="btn btn-outline-primary fw-bold apple-card-hover rounded-pill px-4 d-flex align-items-center gap-2" 
                  onClick={() => {
                    if (!formData.subjectId) return toast.error('Please select a Subject first!');
                    setShowQuestionModal(true);
                  }}
                >
                  <Plus size={18} /> Write New Question
                </button>
              </div>
              
              <div className="p-4 overflow-auto minimal-scrollbar flex-grow-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                {!formData.subjectId ? (
                  <div className="text-center py-5">
                    <h5 className="text-muted">Please select a Subject first.</h5>
                  </div>
                ) : availableQuestions.length === 0 ? (
                  <div className="text-center py-5">
                    <h5 className="text-muted mb-3">No questions found for this subject.</h5>
                    <button type="button" className="btn btn-primary-custom rounded-pill" onClick={() => setShowQuestionModal(true)}>+ Write your first Question</button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {availableQuestions.map((q, idx) => {
                      const isSelected = formData.manualQuestions.includes(q._id);
                      return (
                        <motion.div 
                          key={q._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                          onClick={() => toggleQuestionSelection(q._id)}
                          className={`glass-panel p-4 rounded-4 apple-card-hover d-flex align-items-start gap-4 cursor-pointer ${isSelected ? 'border-primary' : 'border-light'}`}
                          style={{ 
                            cursor: 'pointer', 
                            backgroundColor: isSelected ? 'rgba(20, 184, 166, 0.05)' : 'white'
                          }}
                        >
                          <div className="mt-1">
                            <input 
                              type="checkbox" 
                              className="custom-checkbox-neo" 
                              checked={isSelected}
                              onChange={() => {}} // Controlled by div onClick
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between mb-2">
                              <span className={`badge ${q.difficulty === 'easy' ? 'bg-success' : q.difficulty === 'medium' ? 'bg-warning text-dark' : 'bg-danger'} bg-opacity-75`}>
                                {q.difficulty.toUpperCase()}
                              </span>
                              <span className="text-muted small fw-bold">{q.marks} Marks</span>
                            </div>
                            <h6 className="fw-bold mb-2 lh-base" style={{ color: 'var(--text-primary)' }}>{q.questionText}</h6>
                            <div className="text-secondary small">
                              {q.options.map((opt: string, i: number) => (
                                <div key={i} className={`d-inline-block me-3 mb-2 px-2 py-1 rounded ${q.correctOptionIndex === i ? 'bg-success bg-opacity-25 text-success fw-bold' : 'bg-light text-muted'}`}>
                                  {String.fromCharCode(65 + i)}. {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={childVariants} className="text-end mt-5 pt-4 pb-5">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              className="btn btn-primary-custom px-5 py-3 fs-5 fw-bold d-inline-flex align-items-center shadow-lg rounded-pill border-0"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #10b981)' }}
            >
              <Check size={24} className="me-2" /> Launch Examination
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Create Subject Modal */}
      {showSubjectModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Add New Subject</h5>
                <button type="button" className="btn-close" onClick={() => setShowSubjectModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateSubject}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject Name</label>
                    <input type="text" className="form-control form-control-custom" required 
                      value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} placeholder="e.g., Computer Science" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Subject Code (Optional)</label>
                    <input type="text" className="form-control form-control-custom" 
                      value={newSubject.code} onChange={e => setNewSubject({...newSubject, code: e.target.value})} placeholder="e.g., CS101" />
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Description (Optional)</label>
                    <textarea className="form-control form-control-custom" rows={2}
                      value={newSubject.description} onChange={e => setNewSubject({...newSubject, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary-custom w-100 py-2 fw-bold rounded-pill">Create Subject</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {showQuestionModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Write New Question</h5>
                <button type="button" className="btn-close" onClick={() => setShowQuestionModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateQuestion}>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Subtopic</label>
                      <input type="text" className="form-control form-control-custom" placeholder="e.g. Loops" required 
                        value={newQuestion.subtopic} onChange={e => setNewQuestion({...newQuestion, subtopic: e.target.value})} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Difficulty</label>
                      <select className="form-select form-control-custom" required 
                        value={newQuestion.difficulty} onChange={e => setNewQuestion({...newQuestion, difficulty: e.target.value})}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Marks</label>
                      <input type="number" className="form-control form-control-custom" required min={1}
                        value={newQuestion.marks} onChange={e => setNewQuestion({...newQuestion, marks: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Question Text</label>
                    <textarea className="form-control form-control-custom" rows={3} placeholder="Type the question here..." required 
                      value={newQuestion.questionText} onChange={e => setNewQuestion({...newQuestion, questionText: e.target.value})}></textarea>
                  </div>
                  
                  <label className="form-label small fw-bold">Options & Correct Answer</label>
                  <p className="small text-muted mb-2">Select the radio button next to the correct option.</p>
                  <div className="row mb-4">
                    {newQuestion.options.map((opt, i) => (
                      <div className="col-md-6 mb-3" key={i}>
                        <div className="input-group">
                          <div className="input-group-text bg-light border-end-0">
                            <input type="radio" name="correctOptModal" checked={newQuestion.correctOptionIndex === i} onChange={() => setNewQuestion({...newQuestion, correctOptionIndex: i})} />
                          </div>
                          <input type="text" className="form-control form-control-custom border-start-0" placeholder={`Option ${i+1}`} required 
                            value={opt} onChange={e => {
                              const newOpts = [...newQuestion.options];
                              newOpts[i] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOpts});
                            }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label small fw-bold">Explanation (Optional)</label>
                    <textarea className="form-control form-control-custom" rows={2} placeholder="Why is this the correct answer?" 
                      value={newQuestion.explanation} onChange={e => setNewQuestion({...newQuestion, explanation: e.target.value})}></textarea>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowQuestionModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary-custom rounded-pill px-4 fw-bold">Save to Question Bank</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCreator;
