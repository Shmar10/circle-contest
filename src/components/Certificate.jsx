import React from 'react';
import { Printer, ArrowLeft, Award, Circle } from 'lucide-react';

export default function Certificate({ winnerName, score, date, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div id="certificate-root" className="fixed inset-0 z-[100] bg-slate-100 overflow-y-auto print:bg-white flex flex-col items-center">
      {/* Screen Controls */}
      <div className="w-full py-4 px-6 flex justify-between items-center print:hidden bg-slate-900 shadow-lg shrink-0">
        <button onClick={onClose} className="text-white flex items-center gap-2 hover:text-amber-400 transition-colors font-bold">
          <ArrowLeft className="w-5 h-5"/> Close Window
        </button>
        <button onClick={handlePrint} className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-900 px-6 py-2.5 rounded-full font-black flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5">
          <Printer className="w-5 h-5"/> Print Certificate
        </button>
      </div>

      {/* Certificate Container */}
      <div className="flex-1 w-full flex items-center justify-center p-4 md:p-8 print:p-0">
        <div className="bg-white w-full max-w-[1056px] min-h-[816px] aspect-[11/8.5] shadow-2xl relative overflow-hidden border-[12px] border-double border-amber-200 print:shadow-none print:aspect-auto print:border-none print:w-[100vw] print:h-[100vh] print:m-0 print:absolute print:top-0 print:left-0 flex flex-col">
          
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-6 left-6 w-20 h-20 border-t-8 border-l-8 border-amber-400 rounded-tl-[40px]"></div>
          <div className="absolute top-6 right-6 w-20 h-20 border-t-8 border-r-8 border-amber-400 rounded-tr-[40px]"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 border-b-8 border-l-8 border-amber-400 rounded-bl-[40px]"></div>
          <div className="absolute bottom-6 right-6 w-20 h-20 border-b-8 border-r-8 border-amber-400 rounded-br-[40px]"></div>

          {/* Watermark/Background Graphics */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none">
            <Circle className="w-[800px] h-[800px] text-amber-900" strokeWidth={0.5} />
          </div>

          <div className="relative z-10 w-full h-full flex-grow flex flex-col items-center justify-center p-8 text-center mt-12">
            
            <div className="mb-6">
              <Award className="w-28 h-28 text-amber-500 mx-auto drop-shadow-xl" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 uppercase tracking-[0.2em] mb-4 font-serif text-center px-4">
              Certificate of Perfection
            </h1>
            
            <h2 className="text-lg md:text-2xl text-amber-600 uppercase tracking-[0.4em] font-bold mb-12 text-center">
              The Perfect Circle Challenge
            </h2>

            <p className="text-xl md:text-2xl italic text-slate-500 mb-6 font-serif">
              This prestigious award is proudly presented to
            </p>

            <div className="w-full max-w-3xl px-8 border-b-2 border-slate-300 pb-2 mb-8">
              <h3 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 py-2 truncate">
                {winnerName || 'Participant Name'}
              </h3>
            </div>

            <p className="text-lg md:text-2xl text-slate-600 max-w-4xl leading-relaxed mb-12 font-serif px-8">
              For demonstrating unparalleled mastery of freehand geometry, achieving an extraordinary level of precision, and proving beyond a doubt their superior circle-drawing abilities.
            </p>

            {score !== null && score !== undefined && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl px-8 py-4 mb-4 shadow-sm inline-block">
                 <p className="text-sm uppercase tracking-widest text-amber-700 font-bold mb-1">Winning Error Margin</p>
                 <p className="text-4xl font-black text-amber-600 font-mono">{Number(score).toFixed(2)}%</p>
              </div>
            )}

            <div className="flex w-full max-w-4xl justify-between px-12 mt-auto mb-12">
              <div className="text-center w-48 sm:w-64">
                <div className="border-b-2 border-slate-400 pb-2 mb-2">
                  <span className="text-xl font-bold text-slate-800">{date || new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Date Awarded</p>
              </div>
              
              <div className="text-center w-48 sm:w-64">
                <div className="border-b-2 border-slate-400 pb-2 mb-2 h-9">
                  {/* Empty space for physical signature */}
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Official Judge</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Hide all other elements natively during print via Tailwind's print:hidden on the <body> if needed, or rely on our absolute print positions */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate-root, #certificate-root * {
            visibility: visible;
          }
          #certificate-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: landscape; margin: 0; }
        }
      `}} />
    </div>
  );
}
