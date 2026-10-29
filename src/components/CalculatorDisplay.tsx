import React from 'react';
import { Terminal } from 'lucide-react';

interface CalculatorDisplayProps {
  expression: string;
  realtimeResult: string;
  isEvaluated: boolean;
  hasError: boolean;
  errorMessage?: string;
  scanlinesEnabled?: boolean;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  expression,
  realtimeResult,
  isEvaluated,
  hasError,
  errorMessage,
  scanlinesEnabled = true,
}) => {
  return (
    <div className="relative w-full rounded-lg bg-[#010a04] border-2 border-[#00ff41]/40 p-4 shadow-[0_0_20px_rgba(0,255,65,0.15)] overflow-hidden transition-all duration-200">
      {/* Scanlines CRT */}
      {scanlinesEnabled && (
        <div className="absolute inset-0 matrix-scanlines pointer-events-none z-20" />
      )}

      {/* Vignette CRT */}
      <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />

      {/* Visor Header: DENTAKU | デンタク */}
      <div className="relative z-30 flex items-center justify-between text-[11px] font-terminal text-[#00ff41]/75 pb-2 mb-2 border-b border-[#00ff41]/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00ff41]" />
          <span className="tracking-widest uppercase font-bold text-[#00ff41]">DENTAKU</span>
          <span className="text-[#00ff41]/40">|</span>
          <span className="text-[11px] text-[#00ff41]/80 font-mono tracking-wider">デンタク</span>
        </div>
      </div>

      {/* Visor Screen: Typed Equation and Result */}
      <div className="relative z-30 min-h-[95px] flex flex-col justify-between py-1">
        {/* Typed Equation */}
        <div className="w-full text-right text-base sm:text-lg font-terminal text-[#00ff41]/80 tracking-widest break-all overflow-x-auto select-all pr-1">
          <span className="font-mono">{expression || '0'}</span>
          <span className="inline-block w-2.5 h-4 ml-1 bg-[#00ff41] animate-cursor-blink align-middle" />
        </div>

        {/* Real-time Result */}
        <div className="w-full text-right pt-2 border-t border-[#00ff41]/15">
          <div
            className={`font-terminal font-bold transition-all duration-150 break-all select-all ${
              hasError
                ? 'text-red-400 text-2xl sm:text-3xl'
                : isEvaluated
                ? 'text-[#aaffbe] matrix-text-glow-bright text-3xl sm:text-4xl'
                : 'text-[#00ff41] matrix-text-glow text-2xl sm:text-3xl'
            }`}
          >
            <span className="text-xl opacity-60 mr-1 select-none font-normal">=</span>
            {hasError ? (errorMessage || realtimeResult) : realtimeResult}
          </div>
        </div>
      </div>
    </div>
  );
};
