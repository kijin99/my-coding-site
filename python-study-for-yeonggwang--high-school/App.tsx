import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store/AppContext';
import { LocaleProvider, useLocale } from './store/LocaleContext';
import { Problem, Submission, TypingDataPoint, Classroom, User, Student } from './types';
import { Header } from './components/Header';
import { TypingGraph } from './components/TypingGraph';
import { CodeFeedback } from './components/CodeFeedback';
import { CodeExplanation } from './components/CodeExplanation';
import { marked } from 'marked';

// Make TypeScript aware of the XLSX library loaded from the CDN
declare const XLSX: any;
// Make TypeScript aware of the Pyodide library loaded from the CDN
declare const loadPyodide: any;

// Main Application Component
const App: React.FC = () => {
  return (
    <AppProvider>
      <LocaleProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-900 text-slate-200">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Navigate to="/login" />} />
                
                <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/teacher/classes" element={<ProtectedRoute roles={['teacher']}><ClassManagementPage /></ProtectedRoute>} />
                <Route path="/teacher/materials" element={<ProtectedRoute roles={['teacher']}><MaterialsPage /></ProtectedRoute>} />
                
                <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/problem/:problemId" element={<ProtectedRoute roles={['student', 'teacher']}><CodingPage /></ProtectedRoute>} />
                
                {/* Submission detail can be seen by teachers */}
                <Route path="/submission/:submissionId" element={<ProtectedRoute roles={['teacher']}><SubmissionDetailPage /></ProtectedRoute>} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </HashRouter>
      </LocaleProvider>
    </AppProvider>
  );
};

// --- Authentication & Authorization ---

const LoginPage: React.FC = () => {
    const { login, users } = useAppContext();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { t } = useLocale();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError(t('login.errorBothFields'));
            return;
        }
        const success = login(username, password);
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (success && user) {
            if (user.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student/dashboard');
            }
        } else {
            setError(t('login.errorInvalid'));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-lg">
                {/* FIX: Corrected invalid HTML tag from `hh2` to `h2`. */}
                <h2 className="text-3xl font-bold text-center text-sky-400 mb-2">{t('login.title')}</h2>
                <p className="text-center text-slate-400 mb-8">{t('login.subtitle')}</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={t('login.usernamePlaceholder')}
                            className="w-full px-4 py-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('login.passwordPlaceholder')}
                            className="w-full px-4 py-3 bg-slate-700 text-slate-200 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        {t('login.loginButton')}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: ReactNode, roles: User['role'][] }> = ({ children, roles }) => {
    const { currentUser } = useAppContext();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!roles.includes(currentUser.role)) {
        // Redirect to their respective dashboard if they try to access a page they don't have permission for
        const dashboardPath = currentUser.role === 'teacher' ? '/teacher' : '/student/dashboard';
        return <Navigate to={dashboardPath} replace />;
    }

    return <>{children}</>;
};

// --- Teacher Components ---

const TeacherDashboard: React.FC = () => {
    const { classrooms, problems, submissions } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
    const [selectedClassId, setSelectedClassId] = useState<string>('all');
    const { t } = useLocale();

    const filteredClassrooms = selectedClassId === 'all'
        ? classrooms
        : classrooms.filter(c => c.id === selectedClassId);

    let content;
    if (classrooms.length === 0) {
        content = <p className="text-center text-slate-400 mt-8">{t('teacherDashboard.noClassroomsMessage')}</p>;
    } else if (problems.length === 0) {
        content = <p className="text-center text-slate-400 mt-8">{t('teacherDashboard.noProblems')}</p>;
    } else {
        content = (
            <div className="space-y-12">
                {filteredClassrooms.map(classroom => (
                    <section key={classroom.id} aria-labelledby={`classroom-heading-${classroom.id}`}>
                        <h3 id={`classroom-heading-${classroom.id}`} className="text-2xl font-bold text-sky-300 mb-4 border-b border-slate-700 pb-2">
                            {t('teacherDashboard.classLabel')} {classroom.name}
                        </h3>
                        <div className="space-y-6 pt-4">
                            {problems.map(problem => {
                                const classroomProblemSubmissions = submissions.filter(s =>
                                    s.problemId === problem.id && s.classId === classroom.id
                                );
                                return (
                                    <ProblemSubmissions
                                        key={`${classroom.id}-${problem.id}`}
                                        problem={problem}
                                        submissions={classroomProblemSubmissions}
                                        onEdit={setEditingProblem}
                                    />
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-sky-400">{t('teacherDashboard.title')}</h2>
                <div className="flex gap-4">
                    <Link to="/teacher/materials" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">{t('teacherDashboard.myMaterials')}</Link>
                    <Link to="/teacher/classes" className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg">{t('teacherDashboard.manageClasses')}</Link>
                    <button onClick={() => setIsModalOpen(true)} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg">
                        {t('teacherDashboard.createProblem')}
                    </button>
                </div>
            </div>

            {classrooms.length > 0 && (
                <div className="flex justify-start items-center bg-slate-800 p-4 rounded-lg">
                    <label htmlFor="class-filter" className="text-md font-medium text-slate-300 mr-4">{t('teacherDashboard.selectClassLabel')}</label>
                    <select
                        id="class-filter"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full max-w-xs p-2.5"
                    >
                        <option value="all">{t('teacherDashboard.allClassesOption')}</option>
                        {classrooms.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {content}

            {isModalOpen && <CreateProblemModal onClose={() => setIsModalOpen(false)} />}
            {editingProblem && <EditProblemModal problem={editingProblem} onClose={() => setEditingProblem(null)} />}
        </div>
    );
};

const CreateProblemModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addProblem } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [initialCode, setInitialCode] = useState('');
    const [hint, setHint] = useState('');
    const { t } = useLocale();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;
        addProblem({ title, description, initialCode, hint });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-2xl font-bold mb-6 text-sky-400">{t('createProblemModal.title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('createProblemModal.problemTitle')} className="w-full p-2 bg-slate-700 rounded" required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('createProblemModal.description')} className="w-full p-2 bg-slate-700 rounded h-32" required />
                    <textarea value={initialCode} onChange={e => setInitialCode(e.target.value)} placeholder={t('createProblemModal.initialCode')} className="w-full p-2 bg-slate-700 rounded h-24 font-mono" />
                    <textarea value={hint} onChange={e => setHint(e.target.value)} placeholder="Hint (Optional)" className="w-full p-2 bg-slate-700 rounded h-24" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">{t('createProblemModal.cancel')}</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('createProblemModal.create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditProblemModal: React.FC<{ problem: Problem; onClose: () => void }> = ({ problem, onClose }) => {
    const { updateProblem } = useAppContext();
    const [title, setTitle] = useState(problem.title);
    const [description, setDescription] = useState(problem.description);
    const [initialCode, setInitialCode] = useState(problem.initialCode);
    const [hint, setHint] = useState(problem.hint || '');
    const { t } = useLocale();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) return;
        // For simplicity, we are not updating the translation keys here.
        // Teacher-created problems use the direct title/description fields.
        updateProblem(problem.id, { title, description, initialCode, hint });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-2xl font-bold mb-6 text-sky-400">{t('editProblemModal.title')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('createProblemModal.problemTitle')} className="w-full p-2 bg-slate-700 rounded" required />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('createProblemModal.description')} className="w-full p-2 bg-slate-700 rounded h-32" required />
                    <textarea value={initialCode} onChange={e => setInitialCode(e.target.value)} placeholder={t('createProblemModal.initialCode')} className="w-full p-2 bg-slate-700 rounded h-24 font-mono" />
                    <textarea value={hint} onChange={e => setHint(e.target.value)} placeholder="Hint (Optional)" className="w-full p-2 bg-slate-700 rounded h-24" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">{t('createProblemModal.cancel')}</button>
                        <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('editProblemModal.save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ProblemSubmissions: React.FC<{ problem: Problem; submissions: Submission[]; onEdit: (problem: Problem) => void }> = ({ problem, submissions, onEdit }) => {
    const { students } = useAppContext();
    const navigate = useNavigate();
    const { t } = useLocale();

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown Student';
    const problemTitle = problem.titleKey ? t(problem.titleKey) : problem.title;

    // Show all submissions, sorted by the most recent first.
    const sortedSubmissions = [...submissions].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    return (
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-semibold mb-4 text-sky-400">{problemTitle}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(problem)} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    {t('problemSubmissions.edit')}
                </button>
                <button onClick={() => navigate(`/problem/${problem.id}`)} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg text-sm">
                    {t('problemSubmissions.solveProblem')}
                </button>
              </div>
            </div>
            
            <ul className="space-y-3">
                {sortedSubmissions.length > 0 ? (
                    sortedSubmissions.map(submission => (
                        <li key={submission.id} className="bg-slate-700 p-4 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{getStudentName(submission.studentId)}</p>
                                <p className="text-sm text-slate-400">{t('problemSubmissions.submittedAt')} {submission.submittedAt.toLocaleString()}</p>
                            </div>
                            <button onClick={() => navigate(`/submission/${submission.id}`)} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-3 rounded-md text-sm">
                                {t('problemSubmissions.viewDetails')}
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-slate-400">{t('problemSubmissions.noSubmissions')}</p>
                )}
            </ul>
        </div>
    );
};

const EditStudentModal: React.FC<{ student: Student; onClose: () => void; onSave: (studentId: string, data: Partial<Student>) => string | null }> = ({ student, onClose, onSave }) => {
    const [name, setName] = useState(student.name);
    const [username, setUsername] = useState(student.username);
    const [password, setPassword] = useState('');
    const [studentNumber, setStudentNumber] = useState(student.studentNumber || '');
    const { t } = useLocale();

    const handleSave = () => {
        if (!name.trim() || !username.trim()) {
            alert(t('editStudentModal.errorEmpty'));
            return;
        }
        const dataToUpdate: Partial<Student> = { name, username, studentNumber };
        if (password) {
            dataToUpdate.password = password;
        }
        const error = onSave(student.id, dataToUpdate);
        if (error) {
            alert(error);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold mb-6 text-sky-400">{t('editStudentModal.title')}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('editStudentModal.name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('editStudentModal.username')}</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 bg-slate-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('editStudentModal.studentNumber')}</label>
                        <input type="text" value={studentNumber} onChange={e => setStudentNumber(e.target.value)} className="w-full p-2 bg-slate-700 rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">{t('editStudentModal.newPassword')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('editStudentModal.newPasswordPlaceholder')} className="w-full p-2 bg-slate-700 rounded" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">{t('editStudentModal.cancel')}</button>
                        <button type="button" onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('editStudentModal.save')}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const ClassManagementPage: React.FC = () => {
  const { classrooms, students, addClassroom, addStudentToClassroom, addStudentsToClassroom, updateStudent } = useAppContext();
  const { t } = useLocale();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(classrooms[0]?.id || null);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentUsername, setNewStudentUsername] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const selectedClass = classrooms.find(c => c.id === selectedClassId);
  const classStudents = selectedClass ? students.filter(s => selectedClass.studentIds.includes(s.id)) : [];

  const handleAddClassroom = (e: React.FormEvent) => {
      e.preventDefault();
      if (newClassName.trim()) {
          addClassroom(newClassName.trim());
          setNewClassName('');
      }
  };

  const handleAddStudent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClassId) return;
      if (!newStudentName.trim() || !newStudentUsername.trim() || !newStudentPassword.trim()) {
          alert(t('classManagement.addStudentAlert'));
          return;
      }
      const error = addStudentToClassroom({
          name: newStudentName.trim(),
          username: newStudentUsername.trim(),
          password: newStudentPassword.trim(),
          studentNumber: newStudentNumber.trim(),
      }, selectedClassId);

      if (error) {
          alert(error);
      } else {
          setNewStudentName('');
          setNewStudentUsername('');
          setNewStudentPassword('');
          setNewStudentNumber('');
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!selectedClassId) return;
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = new Uint8Array(event.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const json: any[] = XLSX.utils.sheet_to_json(worksheet);

              const newStudents = json.map(row => ({
                  name: String(row.name || ''),
                  username: String(row.username || ''),
                  password: String(row.password || ''),
                  studentNumber: String(row.studentNumber || ''),
              })).filter(s => s.name && s.username && s.password);

              if (newStudents.length > 0) {
                  const error = addStudentsToClassroom(newStudents, selectedClassId);
                  if (error) {
                      alert(error);
                  } else {
                      alert(t('classManagement.bulkAddSuccess').replace('{count}', String(newStudents.length)));
                  }
              } else {
                  alert(t('classManagement.bulkAddNoData'));
              }
          } catch (err) {
              console.error(err);
              alert(t('classManagement.bulkAddFileError'));
          } finally {
              if (e.target) e.target.value = ''; // Reset file input
          }
      };
      reader.readAsArrayBuffer(file);
  };
  
  return (
    <div className="space-y-8">
      <Link to="/teacher" className="text-sky-400 hover:text-sky-300">&larr; {t('classManagement.back')}</Link>
      <h2 className="text-3xl font-bold text-sky-400">{t('classManagement.title')}</h2>
      
      {/* Classrooms List and Add Form */}
      <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex flex-wrap gap-2 mb-4">
              {classrooms.map(c => (
                  <button key={c.id} onClick={() => setSelectedClassId(c.id)}
                      className={`px-4 py-2 rounded-lg transition-colors text-white ${selectedClassId === c.id ? 'bg-sky-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      {c.name}
                  </button>
              ))}
          </div>
          <form onSubmit={handleAddClassroom} className="flex gap-2">
              <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder={t('classManagement.newClassName')} className="flex-grow p-2 bg-slate-700 rounded" />
              <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('classManagement.addClass')}</button>
          </form>
      </div>

      {/* Selected Classroom Details */}
      {selectedClass && (
          <div className="bg-slate-800 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4 text-sky-400">{selectedClass.name} - {t('classManagement.students')}</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-3">{t('classManagement.studentNumber')}</th>
                      <th className="p-3">{t('classManagement.newStudentName')}</th>
                      <th className="p-3">{t('classManagement.username')}</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                  {classStudents.length > 0 ? classStudents.map(student => (
                      <tr key={student.id} className="border-b border-slate-700">
                          <td className="p-3">{student.studentNumber || '-'}</td>
                          <td className="p-3">{student.name}</td>
                          <td className="p-3">{student.username}</td>
                          <td className="p-3 text-right">
                              <button onClick={() => setEditingStudent(student)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-1 px-3 rounded">{t('classManagement.edit')}</button>
                          </td>
                      </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center p-4 text-slate-400">{t('classManagement.noStudents')}</td></tr>
                  )}
                  </tbody>
                </table>
              </div>
          </div>
      )}

      {/* Add Student Forms */}
      {selectedClassId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-slate-800 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold mb-4 text-sky-400">{t('classManagement.addStudent')}</h4>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                      <input type="text" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder={t('classManagement.newStudentName')} className="w-full p-2 bg-slate-700 rounded" required/>
                      <input type="text" value={newStudentUsername} onChange={e => setNewStudentUsername(e.target.value)} placeholder={t('classManagement.username')} className="w-full p-2 bg-slate-700 rounded" required/>
                      <input type="text" value={newStudentNumber} onChange={e => setNewStudentNumber(e.target.value)} placeholder={t('classManagement.studentNumber')} className="w-full p-2 bg-slate-700 rounded" />
                      <input type="password" value={newStudentPassword} onChange={e => setNewStudentPassword(e.target.value)} placeholder={t('classManagement.password')} className="w-full p-2 bg-slate-700 rounded" required/>
                      <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('classManagement.addStudent')}</button>
                  </form>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg text-center">
                  <h4 className="text-xl font-semibold mb-4 text-sky-400">{t('classManagement.bulkAdd')}</h4>
                  <input type="file" id="bulk-add-file" accept=".xlsx, .xls" onChange={handleFileChange} className="hidden" />
                  <label htmlFor="bulk-add-file" className="cursor-pointer bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">
                      Upload XLSX
                  </label>
              </div>
          </div>
      )}

      {editingStudent && <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} onSave={updateStudent} />}
    </div>
  );
};

const UploadMaterialModal: React.FC<{ onClose: () => void; onUpload: (name: string, description: string, file: File) => void }> = ({ onClose, onUpload }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { t } = useLocale();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = () => {
        if (!name.trim()) {
            alert(t('uploadMaterialModal.errorName'));
            return;
        }
        if (!file) {
            alert(t('uploadMaterialModal.errorFile'));
            return;
        }
        onUpload(name, description, file);
        onClose();
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
              <h3 className="text-2xl font-bold mb-6 text-sky-400">{t('uploadMaterialModal.title')}</h3>
              <div className="space-y-4">
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('uploadMaterialModal.name')} className="w-full p-2 bg-slate-700 rounded" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('uploadMaterialModal.description')} className="w-full p-2 bg-slate-700 rounded h-24" />
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">{t('uploadMaterialModal.file')}</label>
                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                        {file ? <p>{file.name}</p> : <p>{t('uploadMaterialModal.uploadPrompt')} <span className="text-sky-400">{t('uploadMaterialModal.dragDrop')}</span></p>}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded">{t('uploadMaterialModal.cancel')}</button>
                      <button type="button" onClick={handleUpload} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded">{t('uploadMaterialModal.upload')}</button>
                  </div>
              </div>
          </div>
      </div>
    );
};


const MaterialsPage: React.FC = () => {
    const { materials, addMaterial, deleteMaterial } = useAppContext();
    const { t } = useLocale();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <div className="space-y-8">
            <Link to="/teacher" className="text-sky-400 hover:text-sky-300">&larr; {t('materials.back')}</Link>
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-sky-400">{t('materials.title')}</h2>
                <button onClick={() => setIsUploadModalOpen(true)} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg">
                    {t('materials.uploadNew')}
                </button>
            </div>

            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-3">{t('materials.fileName')}</th>
                                <th className="p-3">{t('materials.description')}</th>
                                <th className="p-3">{t('materials.dateUploaded')}</th>
                                <th className="p-3 text-right">{t('materials.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materials.length > 0 ? materials.map(material => (
                                <tr key={material.id} className="border-b border-slate-700">
                                    <td className="p-3 font-medium">
                                      <a href={material.fileURL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                                        {material.name}
                                      </a>
                                    </td>
                                    <td className="p-3 text-slate-400">{material.description}</td>
                                    <td className="p-3 text-slate-400">{material.uploadedAt.toLocaleDateString()}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteMaterial(material.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded">
                                          {t('materials.delete')}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-slate-400">{t('materials.noMaterials')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isUploadModalOpen && <UploadMaterialModal onClose={() => setIsUploadModalOpen(false)} onUpload={addMaterial} />}
        </div>
    );
};


const SubmissionDetailPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>();
    const { submissions, problems, students, classrooms } = useAppContext();
    const { t } = useLocale();
    const navigate = useNavigate();

    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return <p>{t('problemNotFound')}</p>;

    const problem = problems.find(p => p.id === submission.problemId);
    const student = students.find(s => s.id === submission.studentId);
    const classroom = classrooms.find(c => c.id === submission.classId);
    const problemTitle = problem?.titleKey ? t(problem.titleKey) : problem?.title;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="text-sky-400 hover:text-sky-300">&larr; {t('submissionDetail.backToDashboard')}</button>
            <h2 className="text-3xl font-bold text-sky-400">{t('submissionDetail.title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
                <p><strong>{t('submissionDetail.student')}:</strong> {student?.name}</p>
                <p><strong>{t('submissionDetail.class')}:</strong> {classroom?.name}</p>
                <p><strong>{t('submissionDetail.problem')}:</strong> {problemTitle}</p>
                <p><strong>{t('submissionDetail.submittedAt')}:</strong> {submission.submittedAt.toLocaleString()}</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold mb-4 text-sky-400">{t('submissionDetail.finalCode')}</h3>
                <pre className="bg-slate-900 p-4 rounded-md overflow-x-auto"><code className="language-python">{submission.finalCode}</code></pre>
            </div>
            
            <TypingGraph data={submission.typingHistory} />
            <CodeFeedback code={submission.finalCode} />
            <CodeExplanation code={submission.finalCode} />
        </div>
    );
};


// --- Student Components ---

const StudentDashboard: React.FC = () => {
    const { problems, currentUser, classrooms } = useAppContext();
    const { t, locale } = useLocale();

    const studentClass = classrooms.find(c => c.id === currentUser?.classId);
    
    const welcomeMessage = locale === 'ko' 
        ? <>{currentUser?.name}{t('studentDashboard.welcome')}</>
        : <>{t('studentDashboard.welcome')} {currentUser?.name}!</>;

    return (
        <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-sky-400">{t('studentDashboard.title')}</h2>
              <p className="text-slate-400 mt-1">{welcomeMessage} {studentClass && `${t('from')} ${studentClass.name}`}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {problems.map(problem => (
                    <div key={problem.id} className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-sky-400">{problem.titleKey ? t(problem.titleKey) : problem.title}</h3>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-3">{problem.descriptionKey ? t(problem.descriptionKey) : problem.description}</p>
                        </div>
                        <Link to={`/problem/${problem.id}`} className="mt-auto text-center bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg w-full">
                            {t('studentDashboard.solveProblem')}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Shared Components (Coding Page) ---

const CodingPage: React.FC = () => {
    const { problemId } = useParams<{ problemId: string }>();
    const { problems, submissions, addSubmission, currentUser } = useAppContext();
    const { t } = useLocale();
    const navigate = useNavigate();
    
    const problem = problems.find(p => p.id === problemId);

    const [code, setCode] = useState(() => {
        // Pre-fill code for students with their last submission
        if (currentUser?.role === 'student') {
            const latestSubmission = submissions
                .filter(s => s.problemId === problemId && s.studentId === currentUser.id)
                .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0];
            
            if (latestSubmission) {
                return latestSubmission.finalCode;
            }
        }
        // Teachers or students with no submissions see the initial code
        return problem?.initialCode || '';
    });

    const [output, setOutput] = useState('');
    const [pyodide, setPyodide] = useState<any>(null);
    const [pyodideStatus, setPyodideStatus] = useState(t('codingPage.pyodideLoading'));
    const [runHistory, setRunHistory] = useState('');
    const [showHint, setShowHint] = useState(false);

    const [typingHistory, setTypingHistory] = useState<TypingDataPoint[]>([]);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        async function initializePyodide() {
            try {
                const pyodideInstance = await loadPyodide();
                // Redirect stdout and stderr to capture print statements
                pyodideInstance.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
                `);
                setPyodide(pyodideInstance);
                setPyodideStatus(t('codingPage.pyodideLoaded'));
            } catch (error) {
                console.error("Pyodide loading failed:", error);
                setPyodideStatus(t('codingPage.pyodideError'));
            }
        }
        initializePyodide();
    }, [t]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (startTimeRef.current === null) {
            startTimeRef.current = Date.now();
        }
        const newCode = e.target.value;
        setCode(newCode);
        setTypingHistory(prev => [
            ...prev,
            { timestamp: Date.now() - startTimeRef.current!, codeLength: newCode.length }
        ]);
    };

    const runCode = async () => {
        if (!pyodide) return;
        setOutput(t('codingPage.runMessage'));
        setRunHistory(code); // Save the code that was run
        
        try {
            // Reset buffers before each run to clear previous output
            pyodide.runPython("sys.stdout.seek(0); sys.stdout.truncate(0); sys.stderr.seek(0); sys.stderr.truncate(0)");
            
            await pyodide.loadPackagesFromImports(code);
            const result = pyodide.runPython(code);
            
            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            const stderr = pyodide.runPython("sys.stderr.getvalue()");

            let finalOutput = "";
            if (stdout) {
                finalOutput += stdout;
            }
            if (stderr) {
                finalOutput += stderr;
            }
            
            // The result of the last expression is returned by runPython.
            // It's a PyProxy object. `print()` returns None, so we should avoid printing "None" as output.
            if (result !== undefined && result !== null) {
                const resultStr = result.toString();
                if (resultStr !== "None") {
                    finalOutput += resultStr;
                }
            }
    
            if (finalOutput.trim() === '') {
                setOutput(t('codingPage.successMessage'));
            } else {
                setOutput(finalOutput.trimEnd());
            }

        } catch (err: any) {
            // This catches compile-time errors. The error message from pyodide is comprehensive.
            // We can also check stderr in case something was written there before the exception.
            const stderr = pyodide.runPython("sys.stderr.getvalue()");
            setOutput(`${t('codingPage.executionError')}\n${stderr}${err.message}`);
        }
    };

    const submitCode = () => {
        if (!problem || !currentUser?.classId) return;
        addSubmission({
            problemId: problem.id,
            studentId: currentUser.id,
            classId: currentUser.classId,
            finalCode: code,
            typingHistory,
        });
        alert(t('codingPage.submissionSuccess'));
        navigate('/student/dashboard');
    };

    if (!problem) {
        return <div className="text-center">{t('codingPage.problemNotFound')}</div>;
    }

    const problemDescriptionHtml = marked.parse(problem.descriptionKey ? t(problem.descriptionKey) : problem.description);
    const problemTitle = problem.titleKey ? t(problem.titleKey) : problem.title;
    const problemHint = problem.hintKey ? t(problem.hintKey) : problem.hint;
    
    const isTeacher = currentUser?.role === 'teacher';

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="text-sky-400 hover:text-sky-300">&larr; {t('codingPage.backToDashboard')}</button>
            
            <h2 className="text-3xl font-bold text-sky-400">{problemTitle}</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Problem Description */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold mb-4 text-sky-400">{t('codingPage.problemDescription')}</h3>
                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: problemDescriptionHtml }}></div>
                        {problemHint && (
                          <div className="mt-4">
                            <button onClick={() => setShowHint(!showHint)} className="bg-sky-700 hover:bg-sky-600 text-white text-sm font-bold py-2 px-3 rounded">
                              {showHint ? 'Hide Hint' : 'Show Hint'}
                            </button>
                            {showHint && <p className="mt-2 p-3 bg-slate-700 rounded text-slate-300">{problemHint}</p>}
                          </div>
                        )}
                    </div>

                    {/* Code Editor */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold mb-4 text-sky-400">{t('codingPage.yourCode')}</h3>
                        <textarea
                            value={code}
                            onChange={handleCodeChange}
                            className="w-full h-96 bg-slate-900 p-4 rounded-md font-mono text-sm border border-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            spellCheck="false"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Action Buttons & Output */}
                    <div className="bg-slate-800 p-6 rounded-lg shadow-inner">
                        <div className="flex flex-wrap gap-4 mb-4">
                            <button onClick={runCode} disabled={!pyodide} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {t('codingPage.runCode')}
                            </button>
                            <div className="relative flex-1 group">
                                <button
                                    onClick={submitCode}
                                    disabled={isTeacher}
                                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    {t('codingPage.submitFinalCode')}
                                </button>
                                {isTeacher && (
                                    <div className="absolute bottom-full mb-2 w-max bg-slate-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {t('problemSubmissions.submitDisabledTooltip')}
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{pyodideStatus}</p>
                        <h3 className="text-lg font-semibold mb-2 text-sky-400">{t('codingPage.output')}</h3>
                        <pre className="w-full h-40 bg-slate-900 p-4 rounded-md text-sm overflow-auto">{output}</pre>
                    </div>

                    {/* AI Tools */}
                    {runHistory ? (
                        <>
                          <CodeFeedback code={runHistory} />
                          <CodeExplanation code={runHistory} />
                        </>
                    ) : (
                      <div className="bg-slate-800 p-6 rounded-lg shadow-inner text-center text-slate-400">
                        <p>{t('codingPage.getAIFeedback')}</p>
                      </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default App;