import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface CalculatorKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onDecimal: () => void;
  onEquals: () => void;
  activeOperator: string | null;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onBackspace,
  onToggleSign,
  onDecimal,
  onEquals,
  activeOperator,
}) => {
  const handleDigit = (digit: string) => {
    sound.playKeyClick();
    onDigit(digit);
  };

  const handleOp = (op: string) => {
    sound.playOperationBeep();
    onOperator(op);
  };

  const handleClear = () => {
    sound.playClearSound();
    onClear();
  };

  const handleBksp = () => {
    sound.playKeyClick();
    onBackspace();
  };

  const handleSign = () => {
    sound.playKeyClick();
    onToggleSign();
  };

  const handleDot = () => {
    sound.playKeyClick();
    onDecimal();
  };

  const handleEq = () => {
    sound.playEqualsBeep();
    onEquals();
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-lg bg-[#020703] border border-[#00ff41]/30 shadow-inner">
      {/* ROW 1: Controls & Division */}
      <button
        type="button"
        onClick={handleClear}
        className="group relative flex items-center justify-center h-14 rounded border border-red-500/50 bg-[#120202] text-red-400 font-terminal font-bold text-base tracking-wider hover:bg-red-950/40 hover:border-red-400 hover:text-red-300 active:translate-y-0.5 transition-all shadow-[0_2px_0_#330000] focus:outline-none focus:ring-1 focus:ring-red-400"
        title="Clear all (Esc)"
      >
        <div className="flex items-center gap-1">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>AC</span>
        </div>
      </button>

      <button
        type="button"
        onClick={handleBksp}
        className="group relative flex items-center justify-center h-14 rounded border border-[#00ff41]/40 bg-[#041306] text-[#00ff41] font-terminal font-semibold text-sm hover:bg-[#08290f] hover:border-[#00ff41] active:translate-y-0.5 transition-all shadow-[0_2px_0_#002008] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
        title="Backspace (DEL)"
      >
        <div className="flex items-center gap-1 text-xs sm:text-sm">
          <Delete className="w-4 h-4" />
          <span>DEL</span>
        </div>
      </button>

      <button
        type="button"
        onClick={handleSign}
        className="group relative flex items-center justify-center h-14 rounded border border-[#00ff41]/40 bg-[#041306] text-[#00ff41] font-terminal font-bold text-base hover:bg-[#08290f] hover:border-[#00ff41] active:translate-y-0.5 transition-all shadow-[0_2px_0_#002008] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
        title="Toggle sign (±)"
      >
        ±
      </button>

      <button
        type="button"
        onClick={() => handleOp('÷')}
        className={`group relative flex items-center justify-center h-14 rounded border font-terminal font-bold text-xl active:translate-y-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-[#00ff41] ${
          activeOperator === '÷'
            ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_12px_#00ff41]'
            : 'border-[#00ff41]/60 bg-[#07240c] text-[#70ff88] hover:bg-[#0c3814] hover:border-[#00ff41] shadow-[0_2px_0_#00350d]'
        }`}
        title="Divide (/)"
      >
        ÷
      </button>

      {/* ROW 2: 7, 8, 9 & Multiplication */}
      <button
        type="button"
        onClick={() => handleDigit('7')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        7
      </button>
      <button
        type="button"
        onClick={() => handleDigit('8')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        8
      </button>
      <button
        type="button"
        onClick={() => handleDigit('9')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        9
      </button>
      <button
        type="button"
        onClick={() => handleOp('×')}
        className={`group relative flex items-center justify-center h-14 rounded border font-terminal font-bold text-xl active:translate-y-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-[#00ff41] ${
          activeOperator === '×'
            ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_12px_#00ff41]'
            : 'border-[#00ff41]/60 bg-[#07240c] text-[#70ff88] hover:bg-[#0c3814] hover:border-[#00ff41] shadow-[0_2px_0_#00350d]'
        }`}
        title="Multiply (*)"
      >
        ×
      </button>

      {/* ROW 3: 4, 5, 6 & Subtraction */}
      <button
        type="button"
        onClick={() => handleDigit('4')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        4
      </button>
      <button
        type="button"
        onClick={() => handleDigit('5')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        5
      </button>
      <button
        type="button"
        onClick={() => handleDigit('6')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        6
      </button>
      <button
        type="button"
        onClick={() => handleOp('-')}
        className={`group relative flex items-center justify-center h-14 rounded border font-terminal font-bold text-xl active:translate-y-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-[#00ff41] ${
          activeOperator === '-'
            ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_12px_#00ff41]'
            : 'border-[#00ff41]/60 bg-[#07240c] text-[#70ff88] hover:bg-[#0c3814] hover:border-[#00ff41] shadow-[0_2px_0_#00350d]'
        }`}
        title="Subtract (-)"
      >
        −
      </button>

      {/* ROW 4: 1, 2, 3 & Addition */}
      <button
        type="button"
        onClick={() => handleDigit('1')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        1
      </button>
      <button
        type="button"
        onClick={() => handleDigit('2')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        2
      </button>
      <button
        type="button"
        onClick={() => handleDigit('3')}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        3
      </button>
      <button
        type="button"
        onClick={() => handleOp('+')}
        className={`group relative flex items-center justify-center h-14 rounded border font-terminal font-bold text-xl active:translate-y-0.5 transition-all focus:outline-none focus:ring-1 focus:ring-[#00ff41] ${
          activeOperator === '+'
            ? 'bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_12px_#00ff41]'
            : 'border-[#00ff41]/60 bg-[#07240c] text-[#70ff88] hover:bg-[#0c3814] hover:border-[#00ff41] shadow-[0_2px_0_#00350d]'
        }`}
        title="Add (+)"
      >
        +
      </button>

      {/* ROW 5: 0 (double space), . and = */}
      <button
        type="button"
        onClick={() => handleDigit('0')}
        className="col-span-2 h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-xl hover:bg-[#0b2410] hover:border-[#00ff41] hover:text-[#70ff88] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
      >
        0
      </button>

      <button
        type="button"
        onClick={handleDot}
        className="h-14 rounded border border-[#00ff41]/30 bg-[#051107] text-[#00ff41] font-terminal font-bold text-2xl hover:bg-[#0b2410] hover:border-[#00ff41] active:translate-y-0.5 transition-all shadow-[0_2px_0_#021b06] focus:outline-none focus:ring-1 focus:ring-[#00ff41]"
        title="Decimal point (.)"
      >
        .
      </button>

      <button
        type="button"
        onClick={handleEq}
        className="h-14 rounded border-2 border-[#00ff41] bg-[#00ff41] text-black font-terminal font-extrabold text-2xl hover:bg-[#52ff7d] active:translate-y-0.5 transition-all shadow-[0_0_15px_rgba(0,255,65,0.6)] focus:outline-none focus:ring-2 focus:ring-[#00ff41]"
        title="Calculate (Enter / =)"
      >
        =
      </button>
    </div>
  );
};
