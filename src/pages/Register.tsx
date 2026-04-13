import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from '../components/UI';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mobile-container flex flex-col items-center justify-center p-8">
        <div className="w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-4xl bg-zinc-900 text-white shadow-2xl shadow-zinc-200">
              <UserPlus className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Join Us</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Create Contributor Account
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    className="pl-12 rounded-3xl bg-white border-zinc-100"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-12 rounded-3xl bg-white border-zinc-100"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 rounded-3xl bg-white border-zinc-100"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-6 rounded-3xl mt-4" isLoading={loading}>
                Register
              </Button>
            </form>

            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-zinc-900 underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
