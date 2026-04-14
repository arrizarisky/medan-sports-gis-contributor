import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from '../components/UI';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';

import LogoIcons from '../assets/logos/logo.png';
import LogoGoogle from '../assets/icons/google.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const currentOrigin = window.location.origin
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentOrigin, 
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mobile-container flex flex-col items-center justify-center p-8">
        <div className="w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-4xl">
              <img src={LogoIcons} alt="Logo" className="h-15 w-15 object-contain" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tighter text-zinc-900">Welcome Contributor</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Contributor Mobile App
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <form className="space-y-4" onSubmit={handleLogin}>
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

              <Button type="submit" className="w-full py-6 rounded-full mt-4" isLoading={loading}>
                Sign In
              </Button>
            </form>

            {/* <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-white px-4 text-zinc-300">Or continue with</span>
              </div>
            </div> */}

            {/* <Button
              variant="outline"
              className="w-full py-6 gap-2 rounded-full border-zinc-100 bg-white"
              onClick={handleGoogleLogin}
            >
              <img src={LogoGoogle} alt="Logo google" className="h-5 w-5 object-contain" />
              Login with Google
            </Button> */}

            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              New here?{' '}
              <Link to="/register" className="text-zinc-900 underline underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
