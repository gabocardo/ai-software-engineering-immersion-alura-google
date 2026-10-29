/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Code2,
  Tv,
  Binary,
  HelpCircle,
} from 'lucide-react';
import { MatrixRain } from './components/MatrixRain';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { CalculatorKeypad } from './components/CalculatorKeypad';
import { PythonDrawer } from './components/PythonDrawer';
import { evaluateRealtime, calculateViaPython } from './utils/calculatorEngine';
import { sound } from './utils/audio';

interface HistoryRecord {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  steps?: string[];
  elapsedMs?: number;
}

export default function App() {
  // Real-time Expression & Evaluation State
  const [expression, setExpression] = useState<string>('');
  const [realtimeResult, setRealtimeResult] = useState<string>('0');
  const [isEvaluated, setIsEvaluated] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeOperator, setActiveOperator] = useState<string | null>(null);

  // Calculation History
  const [history, setHistory] = useState<HistoryRecord[]>(() => {
    return [
      {
        id: '1',
        expression: '1024 * 4',
        result: '4096',
        timestamp: '14:20:01',
        steps: ['1024 × 4 = 4096'],
        elapsedMs: 0.8
      },
      {
        id: '2',
        expression: '500 / 4 + 75',
        result: '200',
        timestamp: '14:21:15',
        steps: ['500 ÷ 4 = 125', '125 + 75 = 200'],
        elapsedMs: 1.1
      }
    ];
  });

  // Matrix Aesthetic Configuration
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [matrixRainEnabled, setMatrixRainEnabled] = useState<boolean>(true);
  const [scanlinesEnabled, setScanlinesEnabled] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showQuickGuide, setShowQuickGuide] = useState<boolean>(false);

  // Sync sound with audio synthesizer
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Recalculate result in real-time as expression changes
  useEffect(() => {
    if (!expression.trim()) {
      setRealtimeResult('0');
      setHasError(false);
      setErrorMessage('');
      setActiveOperator(null);
      return;
    }

    const evalData = evaluateRealtime(expression);
    if (evalData.success) {
      setRealtimeResult(evalData.result);
      setHasError(false);
      setErrorMessage('');
    } else {
      setHasError(true);
      setErrorMessage(evalData.error || 'Error');
      setRealtimeResult(evalData.result);
    }

    // Detect active trailing operator
    const lastChar = expression.trim().slice(-1);
    if (['+', '-', '×', '÷', '*', '/'].includes(lastChar)) {
      setActiveOperator(lastChar.replace('*', '×').replace('/', '÷'));
    } else {
      setActiveOperator(null);
    }
  }, [expression]);

  // Digit Input (0 to 9)
  const handleDigit = useCallback((digit: string) => {
    setExpression((prev) => {
      if (isEvaluated) {
        setIsEvaluated(false);
        return digit;
      }
      if (prev === '0') {
        return digit;
      }
      return prev + digit;
    });
  }, [isEvaluated]);

  // Operator Input (+, -, ×, ÷)
  const handleOperator = useCallback((op: string) => {
    setIsEvaluated(false);
    setExpression((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) {
        return op === '-' ? '-' : '0 ' + op + ' ';
      }
      const lastChar = trimmed.slice(-1);
      if (['+', '-', '×', '÷', '*', '/'].includes(lastChar)) {
        return trimmed.slice(0, -1).trim() + ' ' + op + ' ';
      }
      return trimmed + ' ' + op + ' ';
    });
  }, []);

  // Clear All (AC)
  const handleClear = useCallback(() => {
    setExpression('');
    setRealtimeResult('0');
    setIsEvaluated(false);
    setHasError(false);
    setErrorMessage('');
    setActiveOperator(null);
  }, []);

  // Backspace (DEL)
  const handleBackspace = useCallback(() => {
    setIsEvaluated(false);
    setExpression((prev) => {
      const trimmed = prev.trimEnd();
      if (trimmed.length <= 1) return '';
      if (trimmed.endsWith(' +') || trimmed.endsWith(' -') || trimmed.endsWith(' ×') || trimmed.endsWith(' ÷')) {
        return trimmed.slice(0, -2).trimEnd();
      }
      return trimmed.slice(0, -1);
    });
  }, []);

  // Toggle Sign (±)
  const handleToggleSign = useCallback(() => {
    setIsEvaluated(false);
    setExpression((prev) => {
      if (!prev || prev === '0') return '-';
      if (prev.startsWith('-')) return prev.slice(1);
      return '-' + prev;
    });
  }, []);

  // Decimal Point (.)
  const handleDecimal = useCallback(() => {
    setIsEvaluated(false);
    setExpression((prev) => {
      if (!prev) return '0.';
      const tokens = prev.split(/[\+\-\×\÷\*\/\s]+/);
      const currentToken = tokens[tokens.length - 1];
      if (currentToken.includes('.')) return prev;
      return prev + '.';
    });
  }, []);

  // Equals (=) with Async Python Execution
  const handleEquals = useCallback(async () => {
    if (!expression.trim()) return;

    const startTime = performance.now();
    const pyResponse = await calculateViaPython(expression);
    const elapsed = performance.now() - startTime;

    if (pyResponse.success && pyResponse.result !== undefined) {
      setRealtimeResult(pyResponse.result);
      setIsEvaluated(true);
      setHasError(false);
      setErrorMessage('');

      // Add to history
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        expression: expression,
        result: pyResponse.result,
        timestamp: timeStr,
        steps: pyResponse.steps,
        elapsedMs: pyResponse.elapsedMs ?? elapsed
      };
      setHistory((prev) => [newRecord, ...prev.slice(0, 19)]);
    } else {
      setHasError(true);
      setErrorMessage(pyResponse.error || 'Calculation error');
    }
  }, [expression]);

  // Physical Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        sound.playKeyClick();
        handleDigit(e.key);
      } else if (e.key === '+') {
        sound.playOperationBeep();
        handleOperator('+');
      } else if (e.key === '-') {
        sound.playOperationBeep();
        handleOperator('-');
      } else if (e.key === '*' || e.key === 'x') {
        sound.playOperationBeep();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        sound.playOperationBeep();
        handleOperator('÷');
      } else if (e.key === '.' || e.key === ',') {
        sound.playKeyClick();
        handleDecimal();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        sound.playEqualsBeep();
        handleEquals();
      } else if (e.key === 'Backspace') {
        sound.playKeyClick();
        handleBackspace();
      } else if (e.key === 'Escape') {
        sound.playClearSound();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleOperator, handleDecimal, handleEquals, handleBackspace, handleClear]);

  return (
    <div className="relative min-h-screen w-full bg-[#010502] text-[#00ff41] font-terminal selection:bg-[#003b00] selection:text-[#00ff41] flex flex-col justify-between overflow-x-hidden">
      {/* Background Matrix Digital Rain */}
      <MatrixRain enabled={matrixRainEnabled} opacity={0.2} speed={1.1} />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full border-b border-[#00ff41]/25 bg-[#010d05]/90 backdrop-blur px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff41] shadow-[0_0_8px_#00ff41] animate-pulse" />
          <span className="font-bold tracking-widest text-sm text-[#00ff41] matrix-text-glow">
            DENTAKU // py_calc
          </span>
        </div>

        {/* Top Controls: Sound, Scanlines, Rain & Python Core */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className={`p-1.5 rounded border transition-colors flex items-center gap-1 ${
              soundEnabled
                ? 'bg-[#00ff41]/15 border-[#00ff41]/50 text-[#00ff41]'
                : 'bg-black/50 border-[#00ff41]/20 text-[#00ff41]/40'
            }`}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[10px]">
              {soundEnabled ? 'SOUND: ON' : 'SOUND: OFF'}
            </span>
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            onClick={() => setScanlinesEnabled((v) => !v)}
            className={`p-1.5 rounded border transition-colors flex items-center gap-1 ${
              scanlinesEnabled
                ? 'bg-[#00ff41]/15 border-[#00ff41]/50 text-[#00ff41]'
                : 'bg-black/50 border-[#00ff41]/20 text-[#00ff41]/40'
            }`}
            title="Toggle CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">SCANLINES</span>
          </button>

          {/* Matrix Rain Toggle */}
          <button
            onClick={() => setMatrixRainEnabled((v) => !v)}
            className={`p-1.5 rounded border transition-colors flex items-center gap-1 ${
              matrixRainEnabled
                ? 'bg-[#00ff41]/15 border-[#00ff41]/50 text-[#00ff41]'
                : 'bg-black/50 border-[#00ff41]/20 text-[#00ff41]/40'
            }`}
            title="Toggle Matrix Digital Rain"
          >
            <Binary className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[10px]">MATRIX RAIN</span>
          </button>

          {/* Open Python Core Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00ff41] text-black font-bold text-xs hover:bg-[#6aff87] shadow-[0_0_10px_rgba(0,255,65,0.4)] transition-all"
            title="Open Python Source & History"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PYTHON CORE</span>
          </button>
        </div>
      </header>

      {/* Main Physical Calculator Frame */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-[420px]">
          {/* Chassis */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0a180e] via-[#051107] to-[#020a04] border-2 border-[#00ff41]/50 p-4 sm:p-6 shadow-[0_0_40px_rgba(0,255,65,0.22),inset_0_1px_0_rgba(0,255,65,0.4)]">
            
            {/* Hex Screws at 4 Corners */}
            <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full border border-[#00ff41]/40 bg-[#020b04] flex items-center justify-center text-[7px] text-[#00ff41]/40 font-mono select-none">
              +
            </div>
            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full border border-[#00ff41]/40 bg-[#020b04] flex items-center justify-center text-[7px] text-[#00ff41]/40 font-mono select-none">
              +
            </div>
            <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-full border border-[#00ff41]/40 bg-[#020b04] flex items-center justify-center text-[7px] text-[#00ff41]/40 font-mono select-none">
              +
            </div>
            <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-full border border-[#00ff41]/40 bg-[#020b04] flex items-center justify-center text-[7px] text-[#00ff41]/40 font-mono select-none">
              +
            </div>

            {/* Chassis Badge */}
            <div className="flex items-center justify-between pb-3 mb-2 px-1 text-[10px] text-[#00ff41]/70 border-b border-[#00ff41]/20 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 bg-[#00ff41] rounded-sm animate-ping" />
                <span className="font-bold text-[#00ff41] tracking-wider">DENTAKU // py_calc</span>
              </div>
              <div className="text-[10px] text-[#00ff41]/60">
                REALTIME
              </div>
            </div>

            {/* Visor Display */}
            <div className="mb-4">
              <CalculatorDisplay
                expression={expression}
                realtimeResult={realtimeResult}
                isEvaluated={isEvaluated}
                hasError={hasError}
                errorMessage={errorMessage}
                scanlinesEnabled={scanlinesEnabled}
              />
            </div>

            {/* Keypad */}
            <div>
              <CalculatorKeypad
                onDigit={handleDigit}
                onOperator={handleOperator}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onToggleSign={handleToggleSign}
                onDecimal={handleDecimal}
                onEquals={handleEquals}
                activeOperator={activeOperator}
              />
            </div>

            {/* Chassis Footer */}
            <div className="mt-3.5 pt-2 border-t border-[#00ff41]/15 flex items-center justify-between text-[10px] text-[#00ff41]/60 font-mono">
              <button
                onClick={() => setShowQuickGuide((v) => !v)}
                className="flex items-center gap-1 hover:text-[#00ff41] transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-[#00ff41]" />
                <span>Keyboard Shortcuts</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="hover:text-[#00ff41] transition-colors flex items-center gap-1"
              >
                <span>Tape: {history.length}</span>
                <span className="text-[#00ff41]">➔</span>
              </button>
            </div>
          </div>

          {/* Quick Keyboard Guide */}
          {showQuickGuide && (
            <div className="mt-3 p-3 rounded-lg bg-[#011206] border border-[#00ff41]/30 text-xs text-[#00ff41]/80 space-y-1 font-mono transition-all">
              <div className="font-bold text-[#70ff88] pb-1 border-b border-[#00ff41]/20">
                Physical Keyboard Shortcuts:
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] pt-1">
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">0-9</kbd> Digits</div>
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">+ - * /</kbd> Operators</div>
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">Enter</kbd> / <kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">=</kbd> Calculate</div>
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">Backspace</kbd> Delete</div>
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">Esc</kbd> Clear All</div>
                <div><kbd className="px-1 bg-black border border-[#00ff41]/40 rounded">.</kbd> Decimal Point</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Side Python Drawer */}
      <PythonDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        history={history}
        onSelectHistoryItem={(expr) => {
          setExpression(expr);
          setIsEvaluated(false);
          setIsDrawerOpen(false);
        }}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
