import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Pakai hook buatanmu

export default function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Jika loading sudah selesai dan user terdeteksi, baru pindah halaman
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 mx-auto mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Syncing Session...
        </p>
      </div>
    </div>
  );
}