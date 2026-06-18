'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FounderLayout } from '@/components/dashboard/FounderLayout';
import { Upload, FileText, CheckCircle, Star, TrendingUp, AlertCircle, Eye, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const TIPS = [
  { icon: CheckCircle, color: '#10b981', title: 'Problem & Solution', done: true,  desc: 'Clearly define the problem you solve' },
  { icon: TrendingUp,  color: '#0ea5e9', title: 'Market Size (TAM/SAM/SOM)', done: true,  desc: 'Show addressable market with data' },
  { icon: CheckCircle, color: '#10b981', title: 'Business Model',       done: true,  desc: 'Revenue streams and unit economics' },
  { icon: AlertCircle, color: '#f59e0b', title: 'Traction & Metrics',   done: false, desc: 'MRR, ARR, growth rate, retention' },
  { icon: AlertCircle, color: '#f59e0b', title: 'Team Slide',           done: false, desc: 'Founder backgrounds and advisors' },
  { icon: AlertCircle, color: '#ec4899', title: 'Financial Projections', done: false, desc: '3-year P&L and funding use of proceeds' },
];

export default function PitchDeckPage() {
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/founders/profile');
      if (res.data.data?.startup) {
        setStartup(res.data.data.startup);
      }
    } catch (err) {
      toast.error('Failed to load data room');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleFile = async (file: File) => {
    if (!startup) {
      toast.error('Please complete your startup profile first.');
      return;
    }
    
    // Simulate upload delay
    const toastId = toast.loading(`Uploading ${file.name}...`);
    setTimeout(async () => {
      try {
        await api.post(`/startups/${startup.id}/documents`, {
          name: file.name,
          url: `https://mock-storage.lightit.com/${file.name}`,
          size: file.size,
          type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.pptx') ? 'PPTX' : 'DOCUMENT'
        });
        toast.success('Document uploaded successfully!', { id: toastId });
        fetchProfile();
      } catch (err) {
        toast.error('Upload failed', { id: toastId });
      }
    }, 1500);
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('Remove this document?')) return;
    try {
      await api.delete(`/startups/${startup.id}/documents/${docId}`);
      toast.success('Document removed');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to remove document');
    }
  };

  return (
    <FounderLayout title="Data Room" subtitle="Manage your pitch deck, financials, and legal documents">
      {loading ? <div className="text-center py-10 text-gray-500">Loading data room...</div> : 
       !startup ? (
         <div className="text-center py-10 text-gray-500 glass-card flex flex-col items-center gap-4">
           <p>Please set up your startup profile in the Settings page first.</p>
           <button onClick={() => window.location.href='/founder/dashboard/settings'} className="btn-primary py-2 px-4 text-sm">Go to Settings</button>
         </div>
       ) :
      (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload zone */}
        <div className="lg:col-span-2 space-y-6">
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => inputRef.current?.click()}
            className="glass-card p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
            style={{ border: dragging ? '2px dashed #0ea5e9' : '2px dashed rgba(255,255,255,0.1)', minHeight: 220 }}
          >
            <input ref={inputRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Upload className="w-7 h-7 text-blue-400" />
            </div>
            <p className="text-white font-semibold text-lg">Drop your documents here</p>
            <p className="text-gray-500 text-sm mt-1">PDF, PPTX, XLSX · Max 50MB</p>
            <button className="btn-primary mt-5 text-sm py-2.5 px-6"><span>Browse Files</span></button>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-white text-lg mb-4">Uploaded Documents</h3>
            {startup.documents?.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {startup.documents?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-black/30 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{doc.name}</p>
                        <p className="text-gray-500 text-xs">{(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score + Tips */}
        <div className="space-y-5">
          <div className="glass-card p-6 text-center">
            <p className="text-gray-400 text-sm mb-3">Data Room Readiness</p>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#scoreGrad)" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50 * 68 / 100} ${2 * Math.PI * 50 * (1 - 68 / 100)}`}
                  strokeLinecap="round" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%"><stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-display gradient-text">68</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <p className="text-white font-semibold">Good Foundation</p>
            <p className="text-gray-500 text-xs mt-1">Add team slide & financials to reach 90+</p>
          </div>

          <div className="glass-card p-6">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-blue-400" /> Visibility</h4>
            <div className="space-y-3">
              {[{ label: 'Profile Views', val: startup.viewCount || 0, sub: 'total' }, { label: 'Deck Views', val: '0', sub: 'by investors' }, { label: 'Saved by', val: '0', sub: 'investors' }].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div><p className="text-gray-400 text-xs">{s.label}</p><p className="text-xs text-gray-600">{s.sub}</p></div>
                  <span className="text-white font-bold">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </FounderLayout>
  );
}
