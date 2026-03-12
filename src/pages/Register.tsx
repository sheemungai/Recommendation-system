import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

interface FormState {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  password2: string;
}

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: Record<string, string[]> } };
      const errData = axiosErr?.response?.data;
      if (errData) {
        const msgs = Object.values(errData).flat();
        setError(msgs.join(' '));
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fields: { name: keyof FormState; label: string; type?: string; placeholder: string; half?: boolean }[] = [
    { name: 'first_name', label: 'First Name', placeholder: 'John', half: true },
    { name: 'last_name',  label: 'Last Name',  placeholder: 'Doe',  half: true },
    { name: 'username',   label: 'Username',   placeholder: 'johndoe' },
    { name: 'email',      label: 'Email',      type: 'email', placeholder: 'john@example.com' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              CareerPath <span className="text-primary-600">Kenya</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500 mt-1">Create your free account</p>
        </div>

        <div className="card shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign up</h2>

          {error && (
            <div className="mb-5">
              <Alert type="error" message={error} onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fields.filter((f) => f.half).map((field) => (
                <div key={field.name}>
                  <label className="label" htmlFor={field.name}>{field.label}</label>
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    className="input-field"
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            {fields.filter((f) => !f.half).map((field) => (
              <div key={field.name}>
                <label className="label" htmlFor={field.name}>{field.label}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || 'text'}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password2">Confirm Password</label>
              <input
                id="password2"
                name="password2"
                type={showPw ? 'text' : 'password'}
                className="input-field"
                placeholder="Re-enter your password"
                value={form.password2}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-2.5 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
