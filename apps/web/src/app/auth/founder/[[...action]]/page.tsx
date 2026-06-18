'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Rocket, Eye, EyeOff, ArrowRight, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '@/lib/axios';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

export default function FounderAuthPage({ params }: { params: Promise<{ action?: string[] }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const isRegister = resolvedParams.action?.[0] === 'register';
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onRegister = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        ...data,
        role: 'FOUNDER',
      });
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome to LightIt, ${user.name}! 🚀`);
      router.push('/founder/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        ...data,
        role: 'FOUNDER',
      });
      const { accessToken, refreshToken, user } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success(`Welcome back, ${user.name || 'Founder'}! 🚀`);
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/founder/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Check your email and password.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #050505, #0a0a2e)' }} />
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="font-display font-bold text-4xl text-white mb-4">Founder Portal</h2>
          <p className="text-gray-400 text-lg max-w-xs mx-auto leading-relaxed">
            Join thousands of founders who found their perfect investor match on LightIt.
          </p>

          <div className="mt-12 space-y-4 text-left">
            {[
              { icon: '🎯', text: 'AI-matched investors in minutes' },
              { icon: '💬', text: 'Encrypted direct messaging' },
              { icon: '📊', text: 'Real-time analytics & insights' },
              { icon: '🏆', text: 'Pitch competitions & events' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-gray-400 text-sm">
                <span className="text-lg">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">LightIt</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display font-bold text-3xl text-white mb-2">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-400 mb-8">
              {isRegister ? 'Start your funding journey today.' : 'Sign in to your founder dashboard.'}
            </p>

            {isRegister ? (
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...registerForm.register('name')}
                      placeholder="Your full name"
                      className="input-field pl-11"
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...registerForm.register('email')}
                      type="email"
                      placeholder="you@startup.com"
                      className="input-field pl-11"
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...registerForm.register('phone')}
                      placeholder="+1 234 567 8900"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...registerForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="input-field pl-11 pr-11"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...registerForm.register('confirmPassword')}
                      type="password"
                      placeholder="Repeat password"
                      className="input-field pl-11"
                    />
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Founder Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      placeholder="you@startup.com"
                      className="input-field pl-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      {...loginForm.register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Your password"
                      className="input-field pl-11 pr-11"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign In <ArrowRight className="w-4 h-4" /></>
                    )}
                  </span>
                </button>
              </form>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Link
                href={isRegister ? '/auth/founder' : '/auth/founder/register'}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isRegister ? 'Sign in' : 'Create one'}
              </Link>
            </p>

            <div className="mt-4 text-center">
              <Link href="/auth/investor" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
                Are you an investor? →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
