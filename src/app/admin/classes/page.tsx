'use client';

import React, { useState, useEffect } from 'react';

interface ClassSubject {
  id: string;
  subject: { id: string; name: string; code: string | null };
  teacher: { id: string; name: string } | null;
}

interface ClassData {
  id: string;
  name: string;
  _count: { students: number };
  classSubjects: ClassSubject[];
}

interface SubjectData {
  id: string;
  name: string;
  code: string | null;
}

interface TeacherData {
  id: string;
  name: string;
  email: string;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [assignSubject, setAssignSubject] = useState<{ classId: string; subjectId: string } | null>(null);
  const [assignTeacher, setAssignTeacher] = useState<{ classSubjectId: string; teacherId: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        fetch('/api/admin/classes'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/teachers'),
      ]);

      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes);
      }
      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.subjects);
      }
      if (teachersRes.ok) {
        const data = await teachersRes.json();
        setTeachers(data.teachers);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      if (res.ok) {
        setNewClassName('');
        setShowCreateForm(false);
        fetchData();
      }
    } catch {
      alert('Failed to create class');
    }
  };

  const handleEditClass = (cls: ClassData) => {
    setEditingClass(cls);
    setNewClassName(cls.name);
    setShowEditForm(true);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      const res = await fetch(`/api/admin/classes/${editingClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClassName }),
      });
      if (res.ok) {
        setNewClassName('');
        setEditingClass(null);
        setShowEditForm(false);
        fetchData();
      }
    } catch {
      alert('Failed to update class');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? This will also delete all students and results in this class.')) return;
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch {
      alert('Failed to delete class');
    }
  };

  const handleAssignSubject = async () => {
    if (!assignSubject) return;
    try {
      const res = await fetch('/api/admin/assign-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignSubject),
      });
      if (res.ok) {
        setAssignSubject(null);
        fetchData();
      }
    } catch {
      alert('Failed to assign subject');
    }
  };

  const handleAssignTeacher = async () => {
    if (!assignTeacher) return;
    try {
      const res = await fetch('/api/admin/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignTeacher),
      });
      if (res.ok) {
        setAssignTeacher(null);
        fetchData();
      }
    } catch {
      alert('Failed to assign teacher');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Manage classes and subject assignments</p>
        </div>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary text-sm">
          + Add Class
        </button>
      </div>

      {/* Class List */}
      <div className="grid gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">{cls._count.students} students</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClass(cls)}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Subjects</h4>
              {cls.classSubjects.length > 0 ? (
                <div className="space-y-2">
                  {cls.classSubjects.map((cs) => (
                    <div key={cs.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{cs.subject.name}</span>
                        {cs.subject.code && (
                          <span className="text-xs text-gray-500 ml-2">({cs.subject.code})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {cs.teacher ? cs.teacher.name : 'Unassigned'}
                        </span>
                        <button
                          onClick={() => setAssignTeacher({ classSubjectId: cs.id, teacherId: '' })}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No subjects assigned yet</p>
              )}

              <button
                onClick={() => setAssignSubject({ classId: cls.id, subjectId: '' })}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                + Assign Subject
              </button>
            </div>
          </div>
        ))}

        {classes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500">No classes created yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Add Class&quot; to get started</p>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateForm && (
        <Modal onClose={() => setShowCreateForm(false)}>
          <h3 className="text-lg font-bold mb-4">Create New Class</h3>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="input-field"
              placeholder="e.g., JSS 1A, JSS 2B"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Create</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Class Modal */}
      {showEditForm && editingClass && (
        <Modal onClose={() => { setShowEditForm(false); setEditingClass(null); }}>
          <h3 className="text-lg font-bold mb-4">Edit Class</h3>
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="input-field"
              placeholder="e.g., JSS 1A"
              required
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">Save</button>
              <button type="button" onClick={() => { setShowEditForm(false); setEditingClass(null); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Assign Subject Modal */}
      {assignSubject && (
        <Modal onClose={() => setAssignSubject(null)}>
          <h3 className="text-lg font-bold mb-4">Assign Subject to Class</h3>
          <div className="space-y-4">
            <select
              value={assignSubject.subjectId}
              onChange={(e) => setAssignSubject({ ...assignSubject, subjectId: e.target.value })}
              className="input-field"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssignSubject} className="btn-primary flex-1">Assign</button>
              <button onClick={() => setAssignSubject(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Teacher Modal */}
      {assignTeacher && (
        <Modal onClose={() => setAssignTeacher(null)}>
          <h3 className="text-lg font-bold mb-4">Assign Teacher to Subject</h3>
          <div className="space-y-4">
            <select
              value={assignTeacher.teacherId}
              onChange={(e) => setAssignTeacher({ ...assignTeacher, teacherId: e.target.value })}
              className="input-field"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssignTeacher} className="btn-primary flex-1">Assign</button>
              <button onClick={() => setAssignTeacher(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {children}
      </div>
    </div>
  );
}
