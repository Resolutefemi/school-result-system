'use client';

import React, { useState, useEffect } from 'react';

interface Subject {
  id: string;
  name: string;
  code: string | null;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const defaultSubjects = [
    'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
    'Geography', 'Economics', 'Government', 'Literature in English',
    'History', 'Civic Education', 'Agricultural Science', 'Further Mathematics',
    'Commerce', 'Accounting', 'Christian Religious Studies',
    'Yoruba Language', 'French', 'Computer Science', 'Basic Science',
    'Basic Technology', 'Social Studies', 'Home Economics', 'Fine Arts',
    'Physical Education', 'Music'
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/admin/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects);
      }
    } catch {
      console.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      if (res.ok) {
        setName('');
        setCode('');
        setShowForm(false);
        fetchSubjects();
      }
    } catch {
      alert('Failed to create subject');
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code || '');
    setShowEditForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      const res = await fetch(`/api/admin/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, code }),
      });
      if (res.ok) {
        setName('');
        setCode('');
        setEditingSubject(null);
        setShowEditForm(false);
        fetchSubjects();
      }
    } catch {
      alert('Failed to update subject');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      if (res.ok) fetchSubjects();
    } catch {
      alert('Failed to delete subject');
    }
  };

  const handleBulkAdd = async () => {
    const existingNames = subjects.map(s => s.name.toLowerCase());
    const toAdd = defaultSubjects.filter(s => !existingNames.includes(s.toLowerCase()));
    
    if (toAdd.length === 0) {
      alert('All default subjects already exist!');
      return;
    }

    for (const subjectName of toAdd) {
      const code = subjectName.substring(0, 4).toUpperCase();
      await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjectName, code }),
      });
    }

    fetchSubjects();
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">Manage school subjects</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleBulkAdd} className="btn-secondary text-sm">
            Add Default Subjects
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            + Add Subject
          </button>
        </div>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                {subject.code && (
                  <span className="text-xs text-gray-400">{subject.code}</span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditSubject(subject)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {subjects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500">No subjects created yet</p>
            <p className="text-sm text-gray-400 mt-1">Click &quot;Add Default Subjects&quot; to get started</p>
          </div>
        )}
      </div>

      {/* Create Subject Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Create Subject</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g., Mathematics" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code (optional)</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-field" placeholder="e.g., MATH" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {showEditForm && editingSubject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Edit Subject</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code (optional)</label>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => { setShowEditForm(false); setEditingSubject(null); setName(''); setCode(''); }} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
