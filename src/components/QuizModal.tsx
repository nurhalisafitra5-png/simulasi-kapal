/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Award, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer.ts';

interface QuizQuestionItem {
  id: number;
  scenario: string;
  question: string;
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
  preset?: { a: number; b: number; p: number };
}

const QUESTIONS: QuizQuestionItem[] = [
  {
    id: 1,
    scenario: 'Stasiun Radar Pantai O mendeteksi dua pelampung target dengan sudut pancaran pusat ∠AOB sebesar 84°.',
    question: 'Berapakah sudut pandang optik ∠APB yang diukur oleh kru di anjungan Kapal Patroli P?',
    options: [
      { label: '42.0° (Tepat Setengah)', isCorrect: true },
      { label: '84.0° (Sama Besar)', isCorrect: false },
      { label: '168.0° (Dua Kali Lipat)', isCorrect: false },
      { label: '90.0° (Sudut Siku-siku)', isCorrect: false },
    ],
    explanation: 'Berdasarkan Teorema Sudut Lingkaran, sudut keliling (∠APB) selalu tepat setengah dari sudut pusat (∠AOB) yang menghadap busur yang sama: ∠APB = ½ × 84° = 42.0°.',
    preset: { a: 20, b: 104, p: 230 },
  },
  {
    id: 2,
    scenario: 'Kapten Kapal Patroli P mengamati dua suar darurat di laut dan mengukur sudut pandang optik ∠APB = 35.5°.',
    question: 'Berapakah sudut pancaran radar ∠AOB yang dipancarkan oleh menara radar pusat O?',
    options: [
      { label: '17.75° (Separuh)', isCorrect: false },
      { label: '71.0° (Dua Kali Lipat)', isCorrect: true },
      { label: '142.0° (Empat Kali Lipat)', isCorrect: false },
      { label: '54.5° (Pelurus)', isCorrect: false },
    ],
    explanation: 'Sudut pusat adalah dua kali dari sudut keliling yang menghadap busur yang sama: ∠AOB = 2 × ∠APB = 2 × 35.5° = 71.0°.',
    preset: { a: 15, b: 86, p: 210 },
  },
  {
    id: 3,
    scenario: 'Kapal P bergerak berlayar di sepanjang tepi keliling lingkaran samudera, menghadap busur AB yang tetap.',
    question: 'Apakah besar sudut pandang optik ∠APB akan berubah saat kapal berpindah lokasi di sepanjang tepi lingkaran?',
    options: [
      { label: 'Tidak, nilainya tetap sama konstan di semua posisi tepi lingkaran', isCorrect: true },
      { label: 'Ya, semakin jauh kapal maka sudutnya makin kecil', isCorrect: false },
      { label: 'Ya, sudut membesar ketika kapal mendekati kutub utara', isCorrect: false },
      { label: 'Sudut berubah acak bergantung kecepatan kapal', isCorrect: false },
    ],
    explanation: 'Semua sudut keliling yang menghadap busur lingkaran yang sama memiliki besar sudut yang PERSIS SAMA (invariansi sudut keliling), tidak peduli di mana pun titik P berada pada tepi lingkaran.',
    preset: { a: 40, b: 120, p: 260 },
  },
  {
    id: 4,
    scenario: 'Pelampung A berada pada sudut 30° dan Pelampung B berada pada sudut 150° (sudut pusat ∠AOB = 120°).',
    question: 'Berapakah sudut keliling ∠APB yang terbentuk di Kapal P?',
    options: [
      { label: '60.0°', isCorrect: true },
      { label: '120.0°', isCorrect: false },
      { label: '30.0°', isCorrect: false },
      { label: '45.0°', isCorrect: false },
    ],
    explanation: '∠AOB = |150° - 30°| = 120°. Maka sudut keliling ∠APB = ½ × 120° = 60.0°.',
    preset: { a: 30, b: 150, p: 270 },
  },
];

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (a: number, b: number, p: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onApplyPreset }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (currentQ.options[idx].isCorrect) {
      setScore((prev) => prev + 1);
      soundFx.playSuccessChime();
    } else {
      soundFx.playBeaconChime();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setScore(0);
  };

  const handleApplyToScene = () => {
    if (currentQ.preset) {
      onApplyPreset(currentQ.preset.a, currentQ.preset.b, currentQ.preset.p);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#070e1c] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/25">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display">Tantangan Geometri Maritim</h2>
              <div className="text-xs text-slate-400">
                Pertanyaan {currentIdx + 1} dari {QUESTIONS.length}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Content */}
        {!isFinished ? (
          <div className="space-y-4">
            {/* Scenario Box */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-400">Skenario Radar:</strong> {currentQ.scenario}
            </div>

            {/* Question Text */}
            <div className="text-sm font-semibold text-slate-100 leading-snug">
              {currentQ.question}
            </div>

            {/* Options List */}
            <div className="space-y-2">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                if (isAnswered) {
                  if (opt.isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold';
                  } else if (selectedOption === idx) {
                    btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-300';
                  } else {
                    btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt.label}</span>
                    {isAnswered && opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isAnswered && selectedOption === idx && !opt.isCorrect && (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Action Bar */}
            {isAnswered && (
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 space-y-2">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <span>💡 Penjelasan Matematis:</span>
                </div>
                <p className="leading-relaxed">{currentQ.explanation}</p>

                {currentQ.preset && (
                  <button
                    onClick={handleApplyToScene}
                    className="mt-1 px-3 py-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Terapkan Posisi Ini ke Simulasi 3D</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end pt-2">
              {isAnswered && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentIdx + 1 < QUESTIONS.length ? 'Soal Berikutnya' : 'Lihat Hasil Akhir'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Quiz Results View */
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold font-display text-slate-100">Tantangan Selesai!</h3>
            <p className="text-sm text-slate-300">
              Skor Anda:{' '}
              <span className="font-mono text-xl font-bold text-emerald-400">
                {score} / {QUESTIONS.length}
              </span>
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {score === QUESTIONS.length
                ? 'Luar biasa! Anda telah menguasai konsep hubungan Sudut Pusat dan Sudut Keliling lingkaran maritim secara sempurna.'
                : 'Bagus sekali! Terus latih pemahaman geometri Anda dengan menggeser kapal dan pelampung langsung di peta 3D.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ulangi Kuis</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
              >
                Kembali ke 3D
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
