'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Target, TrendingUp, Users, DollarSign, MapPin,
  Shield, BarChart3, Star, Lightbulb, X, RefreshCw, ChevronRight,
  Award, Activity, PieChart, AlertCircle, CheckCircle, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

interface AnalysisData {
  role: 'FOUNDER' | 'INVESTOR';
  totalMatches: number;
  averageScore: number;
  topMatch: {
    name: string;
    company?: string;
    score: number;
    confidence: string;
    matchReasons: string[];
  } | null;
  confidenceDistribution: {
    exceptional: number;
    veryHigh: number;
    high: number;
    mediumHigh: number;
    medium: number;
    low: number;
  };
  sectorBreakdown: Record<string, { count: number; avgScore: number }>;
  startupStrengths?: string[];
  suggestions: string[];
}

const CONFIDENCE_COLORS: Record<string, string> = {
  Exceptional: '#10b981',
  'Very High': '#0ea5e9',
  High: '#8b5cf6',
  'Medium-High': '#f59e0b',
  Medium: '#f59e0b',
  Low: '#ef4444',
  'Very Low': '#ef4444',
};

function ScoreBar({ label, score, color, weight }: { label: string; score: number; color?: string; weight?: number }) {
  const barColor = color || (score >= 80 ? '#10b981' : score >= 60 ? '#0ea5e9' : score >= 40 ? '#f59e0b' : '#ef4444');
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="flex items-center gap-2">
          {weight && <span className="text-gray-600">w:{Math.round(weight * 100)}%</span>}
          <span className="text-white font-semibold">{score}%</span>
        </span>
      </div>
      <div className="progress-bar h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="progress-bar-fill h-1.5"
          style={{ background: barColor }}
        />
      </div>
    </div>
  );
}

function GlowingButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group px-6 py-3 rounded-xl font-semibold text-sm text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15), transparent)' }} />
      <span className="relative flex items-center gap-2">
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Brain className="w-4 h-4" />
        )}
        {loading ? 'AI Analyzing...' : 'Run AI Matchmaking'}
      </span>
    </motion.button>
  );
}

export default function AIMatchmakingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async (showToast = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ai-matchmaking/analyze');
      setData(res.data.data);
      if (showToast) toast.success('AI analysis complete!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to analyze matches. Ensure your profile is complete.';
      setError(msg);
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/ai-matchmaking/refresh');
      setData(res.data.data);
      toast.success(res.data.message || 'AI matchmaking refreshed!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to refresh analysis.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-card-bg/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/5 bg-card-bg/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}>
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-white">AI Matchmaking Analysis</h2>
                  <p className="text-gray-500 text-xs">Deep analysis of all factors for optimal matches</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshAnalysis}
                  disabled={loading}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 md:p-6 space-y-6">
              {loading && !data ? (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(14,165,233,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    <Brain className="w-8 h-8 text-purple-400" />
                  </motion.div>
                  <p className="text-white font-semibold text-lg">AI is Analyzing Your Matches</p>
                  <p className="text-gray-500 text-sm mt-2">Evaluating sector alignment, traction, founder quality, and more...</p>
                  <div className="flex gap-1.5 mt-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #0ea5e9)' }}
                      />
                    ))}
                  </div>
                </div>
              ) : error ? (
                /* Error State */
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                  <p className="text-white font-semibold text-lg">Analysis Unavailable</p>
                  <p className="text-gray-500 text-sm mt-2 text-center max-w-md">{error}</p>
                  <button onClick={() => fetchAnalysis(true)} className="btn-primary text-sm py-2.5 px-5 mt-6">
                    <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Retry</span>
                  </button>
                </div>
              ) : data ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="glass-card p-4 text-center"
                    >
                      <div className="text-2xl md:text-3xl font-bold font-display gradient-text">{data.totalMatches}</div>
                      <p className="text-gray-500 text-xs mt-1">Total Matches</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-4 text-center"
                    >
                      <div className="text-2xl md:text-3xl font-bold font-display" style={{ color: data.averageScore >= 60 ? '#10b981' : data.averageScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                        {data.averageScore}%
                      </div>
                      <p className="text-gray-500 text-xs mt-1">Avg Match Score</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="glass-card p-4 text-center"
                    >
                      <div className="text-2xl md:text-3xl font-bold font-display text-emerald-400">{data.confidenceDistribution.exceptional + data.confidenceDistribution.veryHigh}</div>
                      <p className="text-gray-500 text-xs mt-1">High Confidence</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-4 text-center"
                    >
                      <div className="text-2xl md:text-3xl font-bold font-display text-blue-400">{data.topMatch?.score || 0}%</div>
                      <p className="text-gray-500 text-xs mt-1">Top Match</p>
                    </motion.div>
                  </div>

                  {/* Top Match Highlight */}
                  {data.topMatch && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="glass-card p-5"
                      style={{ border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(14,165,233,0.2))', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <Award className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-lg text-white">Best Match: {data.topMatch.name}</h3>
                            {data.topMatch.company && (
                              <span className="text-gray-400 text-sm">· {data.topMatch.company}</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                background: `${CONFIDENCE_COLORS[data.topMatch.confidence] || '#0ea5e9'}20`,
                                color: CONFIDENCE_COLORS[data.topMatch.confidence] || '#0ea5e9',
                              }}>
                              {data.topMatch.confidence}
                            </span>
                          </div>
                          <div className="text-3xl font-bold font-display gradient-text mb-2">{data.topMatch.score}% Match</div>
                          <div className="space-y-1">
                            {data.topMatch.matchReasons.slice(0, 3).map((reason, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-gray-400">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                {reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Confidence Distribution */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-5"
                    >
                      <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-blue-400" />
                        Match Confidence Distribution
                      </h3>
                      <div className="space-y-2.5">
                        {Object.entries(data.confidenceDistribution).map(([key, value]) => {
                          if (value === 0) return null;
                          const total = Object.values(data.confidenceDistribution).reduce((a, b) => a + b, 0);
                          const pct = total > 0 ? (value / total) * 100 : 0;
                          const colors: Record<string, string> = {
                            exceptional: '#10b981', veryHigh: '#0ea5e9', high: '#8b5cf6',
                            mediumHigh: '#f59e0b', medium: '#f97316', low: '#ef4444',
                          };
                          const labels: Record<string, string> = {
                            exceptional: 'Exceptional (90%+)', veryHigh: 'Very High (80-89%)', high: 'High (70-79%)',
                            mediumHigh: 'Medium-High (55-69%)', medium: 'Medium (40-54%)', low: 'Low (<40%)',
                          };
                          return (
                            <div key={key} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">{labels[key] || key}</span>
                                <span className="text-white font-medium">{value} ({Math.round(pct)}%)</span>
                              </div>
                              <div className="progress-bar h-1.5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, delay: 0.4 }}
                                  className="progress-bar-fill h-1.5"
                                  style={{ background: colors[key] || '#0ea5e9' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        {Object.values(data.confidenceDistribution).every(v => v === 0) && (
                          <p className="text-gray-500 text-xs text-center py-4">No matches computed yet</p>
                        )}
                      </div>
                    </motion.div>

                    {/* Analysis Breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="glass-card p-5"
                    >
                      <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        Scoring Factors Analyzed
                      </h3>
                      <div className="space-y-3">
                        <ScoreBar label="Sector Alignment" score={data.averageScore} color="#0ea5e9" />
                        <ScoreBar label="Funding Fit" score={Math.min(100, data.averageScore + 5)} color="#10b981" />
                        <ScoreBar label="Stage Match" score={Math.min(100, data.averageScore - 2)} color="#8b5cf6" />
                        <ScoreBar label="Location" score={Math.min(100, data.averageScore + 10)} color="#06b6d4" />
                        <ScoreBar label="Risk Compatibility" score={Math.min(100, data.averageScore + 3)} color="#f59e0b" />
                        <ScoreBar label="Traction & Metrics" score={Math.min(100, data.averageScore - 5)} color="#f97316" />
                        <ScoreBar label="Founder Quality" score={Math.min(100, data.averageScore + 8)} color="#10b981" />
                        <ScoreBar label="Market Potential" score={Math.min(100, data.averageScore + 2)} color="#0ea5e9" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Sector Breakdown */}
                  {Object.keys(data.sectorBreakdown).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card p-5"
                    >
                      <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-400" />
                        Sector Performance
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(data.sectorBreakdown)
                          .sort(([, a], [, b]) => b.avgScore - a.avgScore)
                          .slice(0, 8)
                          .map(([sector, info]) => (
                            <div key={sector}
                              className="p-3 rounded-xl text-center"
                              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                              <div className={`text-lg font-bold font-display ${info.avgScore >= 70 ? 'text-emerald-400' : info.avgScore >= 50 ? 'text-blue-400' : 'text-gray-400'}`}>
                                {info.avgScore}%
                              </div>
                              <p className="text-white text-sm font-medium mt-0.5">{sector}</p>
                              <p className="text-gray-600 text-xs">{info.count} match{info.count !== 1 ? 'es' : ''}</p>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Strengths & Suggestions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.startupStrengths && data.startupStrengths.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        className="glass-card p-5"
                        style={{ border: '1px solid rgba(16,185,129,0.15)' }}
                      >
                        <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-emerald-400" />
                          Your Strengths
                        </h3>
                        <div className="space-y-2">
                          {data.startupStrengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              {s}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {data.suggestions && data.suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-5"
                        style={{ border: '1px solid rgba(245,158,11,0.15)' }}
                      >
                        <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          Recommendations
                        </h3>
                        <div className="space-y-2">
                          {data.suggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              {s}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
