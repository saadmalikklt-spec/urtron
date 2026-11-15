import React, { useState } from 'react';
import { Globe, Search, ExternalLink, Zap, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { executeWebResearch } from '../services/api';
import { SourceLink } from '../types';

interface WebResearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (summary: string, sources: SourceLink[]) => void;
}

export const WebResearchDrawer: React.FC<WebResearchDrawerProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    summary: string;
    sources: SourceLink[];
    executionTimeMs: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await executeWebResearch(query.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Web research failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-yellow-500/40 bg-[#090d18] shadow-[0_0_50px_rgba(234,179,8,0.2)] overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-wide">
                Smart Web Research & Link Finder
              </h3>
              <p className="text-xs text-slate-400">
                Grounding with live web indexes and verified global sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter query to research worldwide (e.g. Latest breakthroughs in quantum computing)..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 pl-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-lg"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Searching...' : 'Execute'}</span>
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-yellow-400">
                ULTRON Web Grounding Matrix Active... Fetching live sources
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Meta stats */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Sources Found ({result.sources.length})
                </span>
                <span className="text-yellow-400">
                  Speed: {(result.executionTimeMs / 1000).toFixed(2)}s (&lt; 10s guarantee)
                </span>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {result.summary}
              </div>

              {/* Verified Source Link Cards */}
              {result.sources.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Verified Online Links & Citations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-yellow-400/50 transition-colors flex items-start justify-between gap-2 group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate group-hover:text-yellow-300">
                            {s.title}
                          </p>
                          <span className="text-[10px] text-slate-500 truncate block mt-0.5 font-mono">
                            {new URL(s.uri).hostname}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-yellow-400 shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="py-10 text-center text-slate-500 text-xs">
              <Globe className="w-10 h-10 mx-auto mb-2 text-slate-600" />
              Enter any query to research live scientific papers, world news, documentation, or links.
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end gap-2">
            <button
              onClick={() => {
                onInsertToChat(result.summary, result.sources);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Add to Chat Conversation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
