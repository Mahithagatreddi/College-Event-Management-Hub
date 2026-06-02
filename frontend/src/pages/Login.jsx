import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGraduationCap, FaIdCard, FaLock, FaUserTie, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student');
  const [rollNo, setRollNo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    let credentials = {};
    if (activeTab === 'student') {
      if (!rollNo || !password) {
        setAuthError('Please fill in Roll Number and Password.');
        return;
      }
      credentials = { rollNo: rollNo.trim().toUpperCase(), password };
    } else {
      if (!username || !password) {
        setAuthError('Please fill in Staff Username and Password.');
        return;
      }
      credentials = { username: username.trim().toLowerCase(), password };
    }

    const success = await login(credentials);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center p-4 antialiased select-none font-body relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#121829]/65 border border-white/5 shadow-2xl p-8 rounded-2xl backdrop-blur-2xl z-10"
      >
        <div className="text-center mb-8">
          <FaGraduationCap className="text-4xl text-neon-purple mx-auto mb-3 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
          <h2 className="text-xl font-extrabold font-title tracking-tight text-white mb-1">Apex College Hub</h2>
          <p className="text-xs text-gray-500 font-medium">College Event & Department Management System</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/20 border border-white/5 p-1 rounded-xl mb-6">
          <button 
            onClick={() => { setActiveTab('student'); setAuthError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 font-title ${activeTab === 'student' ? 'bg-[#0e1320] text-white border border-white/5 shadow-lg' : 'text-gray-500'}`}
          >
            Student Portal
          </button>
          <button 
            onClick={() => { setActiveTab('admin'); setAuthError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 font-title ${activeTab === 'admin' ? 'bg-[#0e1320] text-white border border-white/5 shadow-lg' : 'text-gray-500'}`}
          >
            Staff Access
          </button>
        </div>

        {/* Error alerting card */}
        {authError && (
          <div className="mb-6 p-3 rounded-xl border border-neon-rose/20 bg-neon-rose/10 text-neon-rose text-xs font-semibold flex items-start gap-2.5 animation-slideIn">
            <FaExclamationTriangle className="text-sm shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {activeTab === 'student' ? (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5 font-title">BTech Roll Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 24481A1270"
                    className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none text-white transition-all focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] uppercase"
                  />
                  <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                </div>
                <span className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
                  <FaQuestionCircle className="text-neon-amber text-[10px]" /> First 2 digits identify your admission year.
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5 font-title">Staff Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. coordinator or admin"
                    className="w-full bg-black/25 border border-white/5 focus:border-neon-cyan rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none text-white transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  />
                  <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5 font-title">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium outline-none text-white transition-all focus:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              />
              <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-3 rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 text-white ${activeTab === 'student' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_4px_20px_rgba(139,92,246,0.3)]' : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-[0_4px_20px_rgba(6,182,212,0.3)]'}`}
          >
            Authenticate Portal
          </button>
        </form>

        {activeTab === 'student' && (
          <div className="text-center mt-6 text-[10px] text-gray-500">
            Don't have an active student account?{' '}
            <Link to="/register" className="text-neon-purple font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
