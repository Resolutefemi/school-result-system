'use client';

import React, { useState, useEffect } from 'react';

export default function AdminSchoolSettings() {
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchool();
  }, []);

  const fetchSchool = async () => {
    try {
      const res = await fetch('/api/admin/school-settings');
      if (res.ok) {
        const data = await res.json();
        setSchool(data.school);
      }
    } catch {
      console.error('Failed to fetch school');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/admin/school-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          address: formData.get('address'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          principalName: formData.get('principalName'),
        }),
      });

      if (res.ok) {
        alert('School settings updated successfully!');
        fetchSchool();
      } else {
        alert('Failed to update settings');
      }
    } catch {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl mx-auto space-y-6 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your school information</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        {/* Logo Upload */}
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
            {school?.logoUrl ? (
              <img src={school.logoUrl} alt="School Logo" className="w-full h-full object-contain" />
            ) : (
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Upload logo via the &quot;Upload Logo&quot; button below
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
            <input type="text" name="name" defaultValue={school?.name || ''} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
            <input type="text" name="principalName" defaultValue={school?.principalName || ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" defaultValue={school?.phone || ''} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" defaultValue={school?.email || ''} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea name="address" defaultValue={school?.address || ''} className="input-field" rows={3} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {/* Upload Logo Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Upload Logo & Principal Signature</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Logo</label>
            <UploadArea label="Upload Logo" endpoint="/api/admin/upload-logo" onUpload={fetchSchool} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Principal Signature</label>
            <UploadArea label="Upload Signature" endpoint="/api/admin/upload-signature" onUpload={fetchSchool} />
          </div>
        </div>
      </div>

      {/* Database Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4">Setup Checklist</h3>
        <div className="space-y-3">
          <CheckItem done={!!school?.name} label="Set school name" />
          <CheckItem done={!!school?.logoUrl} label="Upload school logo" />
          <CheckItem done={!!school?.principalSigUrl} label="Upload principal signature" />
          <CheckItem done={!!school?.principalName} label="Set principal name" />
        </div>
      </div>
    </div>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center space-x-3">
      {done ? (
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
      )}
      <span className={`text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function UploadArea({ label, endpoint, onUpload }: { label: string; endpoint: string; onUpload: () => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      if (res.ok) {
        alert('Upload successful!');
        onUpload();
      } else {
        alert('Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
      <div className="text-center">
        {uploading ? (
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          <>
            <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs text-gray-500">{label}</span>
          </>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </label>
  );
}
