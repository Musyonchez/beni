'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import client from '@/api/client';

export default function AccountPage() {
  const { user, patchUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setProfileMsg({ ok: false, text: 'Name cannot be empty' }); return; }
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await client.put('/auth/me', { name: name.trim(), phone: phone.trim() });
      patchUser({ name: res.data.name, phone: res.data.phone });
      setProfileMsg({ ok: true, text: 'Profile updated' });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err?.response?.data?.message ?? 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPwdMsg({ ok: false, text: 'Passwords do not match' }); return; }
    if (newPassword.length < 6) { setPwdMsg({ ok: false, text: 'Password must be at least 6 characters' }); return; }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      const res = await client.put('/auth/password', { currentPassword, newPassword });
      setPwdMsg({ ok: true, text: res.data.message ?? 'Password updated' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMsg({ ok: false, text: err?.response?.data?.message ?? 'Password update failed' });
    } finally {
      setPwdSaving(false);
    }
  };

  const roleBadge: Record<string, string> = {
    buyer: 'bg-blue-100 text-blue-700',
    farmer: 'bg-green-100 text-green-700',
    admin: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Avatar + info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl shrink-0">
            {(user?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            {user?.role && (
              <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge[user.role] ?? 'bg-gray-100 text-gray-600'}`}>
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Profile</h2>
          <form onSubmit={handleProfileSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XXXXXXXX"
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Email</label>
              <input value={user?.email ?? ''} disabled
                className="w-full border rounded-lg px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            {profileMsg && (
              <p className={`text-sm font-medium ${profileMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                {profileMsg.ok ? '✓ ' : '✕ '}{profileMsg.text}
              </p>
            )}
            <button type="submit" disabled={profileSaving}
              className="bg-green-700 text-white rounded-lg py-2.5 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors">
              {profileSaving ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Current Password</label>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            {pwdMsg && (
              <p className={`text-sm font-medium ${pwdMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                {pwdMsg.ok ? '✓ ' : '✕ '}{pwdMsg.text}
              </p>
            )}
            <button type="submit" disabled={pwdSaving}
              className="bg-green-700 text-white rounded-lg py-2.5 font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors">
              {pwdSaving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
