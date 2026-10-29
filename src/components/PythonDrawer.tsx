import React, { useState, useEffect } from 'react';
import { Code2, Terminal, History, Copy, Check, Download, Play, RefreshCw, X } from 'lucide-react';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  steps?: string[];
  elapsedMs?: number;
}

interface PythonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistoryItem: (expr: string) => void;
  onClearHistory: () => void;
}

export const PythonDrawer: React.FC<PythonDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'code' | 'repl'>('history');
  const [pythonCode, setPythonCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [replInput, setReplInput] = useState<string>('');
  const [replLogs, setReplLogs] = useState<Array<{ type: 'in' | 'out' | 'err'; text: string }>>([
    { type: 'out', text: 'Python 3.10.12 [GCC 11.4.0] on linux' },
    { type: 'out', text: 'Matrix Kernel Core v1.0.4 - Type arithmetic expressions (+, -, *, /):' }
  ]);
  const [replLoading, setReplLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/python-code')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.code) {
          setPythonCode(data.code);
        }
      })
      .catch(() => {
        setPythonCode('# Failed to load calculator.py');
      });
  }, []);

  const handleCopyCode = async () => {
    if (!pythonCode) return;
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore error
    }
  };

  const handleDownloadCode = () => {
    if (!pythonCode) return;
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calculator.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendRepl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = replInput.trim();
    if (!cmd || replLoading) return;

    setReplLogs((prev) => [...prev, { type: 'in', text: `>>> ${cmd}` }]);
    setReplInput('');
    setReplLoading(true);

    try {
      const res = await fetch('/api/python-repl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd })
      });
      const data = await res.json();
      if (data.success) {
        setReplLogs((prev) => [...prev, { type: 'out', text: data.output }]);
      } else {
        setReplLogs((prev) => [...prev, { type: 'err', text: `ERROR: ${data.output || 'Execution failure'}` }]);
      }
    } catch (err: any) {
      setReplLogs((prev) => [...prev, { type: 'err', text: `NETWORK ERROR: ${err.message}` }]);
    } finally {
      setReplLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-[#010904]/95 backdrop-blur-md border-l border-[#00ff41]/40 shadow-[-10px_0_30px_rgba(0,0,0,0.8)] flex flex-col font-terminal transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#00ff41]/20 bg-[#021307]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#00ff41]" />
          <span className="font-bold text-[#00ff41] text-sm tracking-wider">
            PYTHON TERMINAL // INSPECTOR
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-[#00ff41]/60 hover:text-[#00ff41] hover:bg-[#00ff41]/10 transition-colors"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#00ff41]/20 bg-[#000d05] text-xs">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold transition-colors border-r border-[#00ff41]/10 ${
            activeTab === 'history'
              ? 'text-[#00ff41] bg-[#00ff41]/15 border-b-2 border-b-[#00ff41]'
              : 'text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/5'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Tape / History ({history.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold transition-colors border-r border-[#00ff41]/10 ${
            activeTab === 'code'
              ? 'text-[#00ff41] bg-[#00ff41]/15 border-b-2 border-b-[#00ff41]'
              : 'text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/5'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Python Source (calculator.py)</span>
        </button>

        <button
          onClick={() => setActiveTab('repl')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold transition-colors ${
            activeTab === 'repl'
              ? 'text-[#00ff41] bg-[#00ff41]/15 border-b-2 border-b-[#00ff41]'
              : 'text-[#00ff41]/50 hover:text-[#00ff41] hover:bg-[#00ff41]/5'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>REPL / Console</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#00ff41]/20 text-[#00ff41]/60">
              <span>ACTIVE CALCULATION SESSION</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-red-400 hover:text-red-300 hover:underline"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-[#00ff41]/40 font-mono">
                <p>&gt; No operations recorded yet.</p>
                <p className="text-[11px] mt-1">Perform calculations on the keypad to view Python logs.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectHistoryItem(item.expression)}
                    className="group p-2.5 rounded bg-[#011407] border border-[#00ff41]/30 hover:border-[#00ff41] cursor-pointer transition-all hover:bg-[#03240e]"
                  >
                    <div className="flex items-center justify-between text-[#00ff41]/50 text-[10px] mb-1">
                      <span>{item.timestamp}</span>
                      <span className="font-mono text-[#00ff41]/70">
                        {item.elapsedMs !== undefined ? `${item.elapsedMs.toFixed(1)}ms` : 'PyCore'}
                      </span>
                    </div>

                    <div className="font-mono text-sm text-[#00ff41] font-bold">
                      &gt;&gt;&gt; {item.expression}
                    </div>

                    <div className="font-mono text-base text-[#70ff88] mt-1 font-extrabold flex items-center justify-between">
                      <span>= {item.result}</span>
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#00ff41]/80 border border-[#00ff41]/40 px-1.5 py-0.5 rounded">
                        Load
                      </span>
                    </div>

                    {item.steps && item.steps.length > 0 && (
                      <div className="mt-1.5 pt-1.5 border-t border-[#00ff41]/10 text-[10px] text-[#00ff41]/60 space-y-0.5">
                        {item.steps.map((st, idx) => (
                          <div key={idx}>└─ {st}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PYTHON SOURCE CODE */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#00ff41]/20">
              <span className="text-[#00ff41]/70 font-bold">calculator.py</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ff41]/15 text-[#00ff41] hover:bg-[#00ff41]/25 border border-[#00ff41]/40 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#00ff41]/15 text-[#00ff41] hover:bg-[#00ff41]/25 border border-[#00ff41]/40 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .py</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-[#00ff41]/75 leading-relaxed bg-[#021307] p-2.5 rounded border border-[#00ff41]/20">
              <span className="text-[#70ff88] font-bold">Module Overview:</span> Implements the 4 elementary arithmetic functions:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#00ff41]/90">
                <li><code className="text-[#aaffbe]">adicao(a, b)</code>: Returns <code className="text-[#aaffbe]">a + b</code></li>
                <li><code className="text-[#aaffbe]">subtracao(a, b)</code>: Returns <code className="text-[#aaffbe]">a - b</code></li>
                <li><code className="text-[#aaffbe]">multiplicacao(a, b)</code>: Returns <code className="text-[#aaffbe]">a * b</code></li>
                <li><code className="text-[#aaffbe]">divisao(a, b)</code>: Returns <code className="text-[#aaffbe]">a / b</code> with zero-division validation.</li>
              </ul>
            </div>

            <pre className="p-3 bg-black rounded border border-[#00ff41]/30 text-[#00ff41] text-[11px] font-mono overflow-x-auto leading-relaxed select-all whitespace-pre">
              {pythonCode || 'Loading code...'}
            </pre>
          </div>
        )}

        {/* TAB: INTERACTIVE REPL */}
        {activeTab === 'repl' && (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex-1 min-h-[300px] p-3 rounded bg-black border border-[#00ff41]/30 font-mono text-[11px] overflow-y-auto space-y-1">
              {replLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.type === 'in'
                      ? 'text-[#70ff88] font-bold'
                      : log.type === 'err'
                      ? 'text-red-400 font-bold'
                      : 'text-[#00ff41]/85'
                  }
                >
                  {log.text}
                </div>
              ))}
              {replLoading && (
                <div className="text-amber-400 flex items-center gap-1 text-[10px]">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Executing on Python 3 engine...</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSendRepl} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#00ff41] font-mono font-bold">
                  &gt;&gt;&gt;
                </span>
                <input
                  type="text"
                  value={replInput}
                  onChange={(e) => setReplInput(e.target.value)}
                  placeholder="e.g. 50 * 4 + 20 / 2"
                  className="w-full bg-[#021307] border border-[#00ff41]/40 rounded pl-12 pr-3 py-2 text-[#00ff41] font-mono text-xs focus:outline-none focus:border-[#00ff41] focus:ring-1 focus:ring-[#00ff41]"
                />
              </div>
              <button
                type="submit"
                disabled={replLoading || !replInput.trim()}
                className="px-3 py-2 rounded bg-[#00ff41] text-black font-bold text-xs hover:bg-[#70ff88] disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="px-4 py-2 border-t border-[#00ff41]/20 bg-[#000b04] text-[10px] text-[#00ff41]/40 flex items-center justify-between">
        <span>RUNTIME: PYTHON 3.10.12 LINUX</span>
        <span>STATUS: ACTIVE</span>
      </div>
    </div>
  );
};
