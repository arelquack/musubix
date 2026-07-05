import React, { useState } from 'react';

export const EditProfileModal = ({ 
  user, 
  onClose, 
  onSuccess 
}: { 
  user: any; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pubKey: user.stellarPubKey,
          bio,
          skills,
          avatarUrl
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      alert('Profile updated successfully!');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ background: 'var(--ink-card)', padding: '32px', borderRadius: 'var(--radius-m)', border: '1px solid var(--ink-line)', width: '100%', maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: 0, fontWeight: 500, color: 'var(--text-1)' }}>Edit Profile Details</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(200,73,60,0.1)', color: 'var(--shu)', padding: '12px', borderRadius: 'var(--radius-s)', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Bio / Tagline</label>
            <textarea 
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell clients about yourself..."
              rows={4}
              style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Skills (Comma-separated)</label>
            <input 
              type="text" 
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. React, Node.js, Smart Contracts"
              style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px', fontWeight: 600 }}>Avatar Image URL</label>
            <input 
              type="url" 
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              style={{ width: '100%', background: 'var(--ink)', border: '1px solid var(--ink-line)', color: 'var(--text-1)', borderRadius: 'var(--radius-s)', padding: '12px 16px', fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
