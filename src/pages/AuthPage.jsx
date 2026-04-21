import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import './AuthPage.css';
import { supabase } from '../supabase/config';

const AuthPage = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/profile';

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  const saveUserToSupabase = async (user, fullName) => {
    // Note: This requires a 'profiles' table with columns: id, email, full_name, role
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName || user.user_metadata?.full_name || 'User',
      role: 'renter',
      updated_at: new Date().toISOString()
    });
    if (error) console.error("Error saving profile:", error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName
            }
          }
        });
        if (error) throw error;
        if (data.user) await saveUserToSupabase(data.user, formData.fullName);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
      }
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container glass-panel animate-fade-in">
        <div className="auth-image-side" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1000")'}}>
          <div className="auth-image-overlay">
            <Link to="/" className="auth-logo">
              <Home size={28} color="white" />
              <span>Rentor</span>
            </Link>
            <div className="auth-quote">
              <h2>"Finding your perfect space has never been easier."</h2>
              <p>Join thousands of renters and property owners on Rentor today.</p>
            </div>
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-form-content">
            <div className="auth-header">
              <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
              <p>
                {mode === 'login' 
                  ? 'Enter your details to access your account.' 
                  : 'Start your journey to better renting.'}
              </p>
            </div>



            {error && <div className="auth-error-message" style={{color: '#dc2626', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'signup' && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <UserIcon size={18} />
                    <input name="fullName" type="text" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                </div>
              </div>

              {mode === 'login' && (
                <div className="forgot-password">
                  <a href="#">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                <span>{loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'login' ? (
                <p>Don't have an account? <button type="button" onClick={toggleMode}>Sign up</button></p>
              ) : (
                <p>Already have an account? <button type="button" onClick={toggleMode}>Sign in</button></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
