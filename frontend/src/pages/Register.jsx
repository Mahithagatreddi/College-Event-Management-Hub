import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaGraduationCap, FaUser, FaIdCard, FaEnvelope, FaLock, FaBuilding, FaThLarge, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, checkRollNumberStatus } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Information Technology');
  const [section, setSection] = useState('A');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !rollNo || !email || !password || !department || !section) {
      setFormError('Please fill in all registration fields.');
      return;
    }

    // Roll expiration validator check
    const check = checkRollNumberStatus(rollNo);
    if (!check.valid) {
      setFormError(check.error);
      toast.error(check.error);
      return;
    }

    const success = await register({
      name,
      rollNo: rollNo.toUpperCase(),
      email,
      password,
      department,
      section
    });

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
        className="w-full max-w-lg bg-[#121829]/65 border border-white/5 shadow-2xl p-8 rounded-2xl backdrop-blur-2xl z-10"
      >
        <div className="text-center mb-8">
          <FaGraduationCap className="text-4xl text-neon-purple mx-auto mb-3 filter drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
          <h2 className="text-xl font-extrabold font-title tracking-tight text-white mb-1">Create Student Profile</h2>
          <p className="text-xs text-gray-500 font-medium">BTech Department Event Hub Registration</p>
        </div>

        {formError && (
          <div className="mb-6 p-3 rounded-xl border border-neon-rose/20 bg-neon-rose/10 text-neon-rose text-xs font-semibold flex items-start gap-2.5 animation-slideIn">
            <FaExclamationTriangle className="text-sm shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">Full Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amit Kumar"
                className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all"
              />
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">BTech Roll Number</label>
            <div className="relative">
              <input 
                type="text" 
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. 24481A1270"
                className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all uppercase"
              />
              <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amit@btech.edu"
                className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all"
              />
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/25 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all"
              />
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">Department</label>
            <div className="relative">
              <select 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
              </select>
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-title">Section</label>
            <div className="relative">
              <select 
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-900 border border-white/5 focus:border-neon-purple rounded-xl py-2 pl-9 pr-3 text-xs outline-none text-white transition-all"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
              <FaThLarge className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none" />
            </div>
          </div>

          <button 
            type="submit"
            className="md:col-span-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-[0_4px_20px_rgba(139,92,246,0.3)] rounded-xl text-xs font-bold transition-all duration-300 transform active:scale-95 text-white mt-4"
          >
            Create Account
          </button>
        </form>

        <div className="text-center mt-6 text-[10px] text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="text-neon-purple font-semibold hover:underline">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
