import React, { useEffect, useState } from 'react';
import { User, Phone, MapPin, Calendar, Edit3, Save, X } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMyProfile, createProfile, updateProfile } from '../api/students';
import type { Profile as ProfileType } from '../types';

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [form, setForm] = useState({
    address: '',
    dob: '',
    gender: '',
    phone: '',
  });

  useEffect(() => {
    getMyProfile()
      .then((p) => {
        setProfile(p);
        setForm({ address: p.address, dob: p.dob, gender: p.gender, phone: p.phone });
      })
      .catch(() => setEditing(true)) // No profile yet → show create form
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile) {
        const updated = await updateProfile(profile.id, form);
        setProfile(updated);
        setAlert({ type: 'success', msg: 'Profile updated successfully!' });
      } else {
        const created = await createProfile(form);
        setProfile(created);
        setAlert({ type: 'success', msg: 'Profile created successfully!' });
      }
      setEditing(false);
    } catch {
      setAlert({ type: 'error', msg: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading profile…" /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="My Profile"
        subtitle="View and manage your personal information"
        action={
          profile && !editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : undefined
        }
      />

      {alert && (
        <div className="mb-5">
          <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
        </div>
      )}

      {!editing && profile ? (
        /* View mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar card */}
          <div className="card flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Student Profile</h2>
            <span className="badge bg-green-100 text-green-700 mt-1">Active</span>
            <p className="text-xs text-gray-400 mt-3">
              Member since {new Date(profile.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Info card */}
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 mb-5">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={<MapPin className="w-4 h-4 text-primary-500" />} label="Address" value={profile.address} />
              <InfoRow icon={<Calendar className="w-4 h-4 text-primary-500" />} label="Date of Birth" value={new Date(profile.dob).toLocaleDateString('en-KE')} />
              <InfoRow icon={<User className="w-4 h-4 text-primary-500" />} label="Gender" value={profile.gender} />
              <InfoRow icon={<Phone className="w-4 h-4 text-primary-500" />} label="Phone" value={profile.phone} />
            </div>
          </div>
        </div>
      ) : (
        /* Edit / Create mode */
        <div className="max-w-2xl">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-5">
              {profile ? 'Edit Profile' : 'Create Your Profile'}
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="label" htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Your address (e.g., Nairobi, Kenya)"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="dob">Date of Birth</label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    className="input-field"
                    value={form.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="input-field"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select gender</option>
                    {genderOptions.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="+254 712 345 678"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving…' : 'Save Profile'}</span>
                </button>
                {profile && (
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <div className="flex items-start space-x-3">
    <span className="mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-gray-800 font-medium">{value || '–'}</p>
    </div>
  </div>
);

export default Profile;
