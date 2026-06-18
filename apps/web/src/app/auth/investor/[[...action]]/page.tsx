'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Building2, Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, DollarSign, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  investmentCapacityMin: z.number().min(0),
  investmentCapacityMax: z.number().min(0),
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type RegisterData = z.infer<typeof registerSchema>;
type LoginData = z.infer<typeof loginSchema>;

export default function InvestorAuthPage({ params }: { params: Promise<{ action?: string[] }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const isRegister = resolvedParams.action?.[0] === 'register';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const regForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { investmentCapacityMin: 100000, investmentCapacityMax: 5000000 },
  });
  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });

  const onRegister = async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, { ...data, role: 'INVESTOR' });
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome to LightIt, ${user.name}! 🏦`);
      router.push('/investor/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const onLogin = async (data: LoginData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { ...data, role: 'INVESTOR' });
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name || 'Investor'}! 👋`);
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/investor/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Check your email and password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #050505, #0a1a2e)' }} />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display font-bold text-4xl text-white mb-4">Investor Portal</h2>
          <p className="text-gray-400 text-lg max-w-xs mx-auto">Access premium deal flow with AI-powered startup recommendations.</p>
          <div className="mt-12 space-y-4 text-left">
            {[
              { icon: '🤖', text: 'AI-curated startup recommendations' },
              { icon: '📈', text: 'Real-time deal flow analytics' },
              { icon: '🔒', text: 'Verified, quality founders only' },
              { icon: '💼', text: 'NDA-protected communications' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-400 text-sm">
                <span>{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">LightIt</span>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              {isRegister ? 'Join as Investor' : 'Investor Sign In'}
            </h1>
            <p className="text-gray-400 mb-8">{isRegister ? 'Access premium startup deal flow.' : 'Continue to your dashboard.'}</p>

            {isRegister ? (
              <form onSubmit={regForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input {...regForm.register('name')} placeholder="Your name" className="input-field pl-10 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Company</label>
                    <input {...regForm.register('company')} placeholder="Firm / Fund" className="input-field text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input {...regForm.register('email')} type="email" placeholder="investor@firm.com" className="input-field pl-10 text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Min Investment (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input {...regForm.register('investmentCapacityMin', { valueAsNumber: true })} type="number" placeholder="100,000" className="input-field pl-10 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max Investment (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                      <input {...regForm.register('investmentCapacityMax', { valueAsNumber: true })} type="number" placeholder="5,000,000" className="input-field pl-10 text-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input {...regForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" className="input-field pl-10 pr-11 text-sm" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <input {...regForm.register('confirmPassword')} type="password" placeholder="Repeat password" className="input-field pl-10 text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Investor Account <ArrowRight className="w-4 h-4" /></>}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...loginForm.register('email')} type="email" placeholder="investor@firm.com" className="input-field pl-11" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input {...loginForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="Your password" className="input-field pl-11 pr-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  </span>
                </button>
              </form>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Link href={isRegister ? '/auth/investor' : '/auth/investor/register'} className="text-blue-400 hover:text-blue-300 font-medium">
                {isRegister ? 'Sign in' : 'Create one'}
              </Link>
            </p>
            <div className="mt-4 text-center">
              <Link href="/auth/founder" className="text-gray-600 text-xs hover:text-gray-400">Are you a founder? →</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
