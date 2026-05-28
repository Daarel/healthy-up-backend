import { useState, useEffect } from "react";
import {
  X,
  Target,
  ArrowRight,
  Sparkle,
  CheckCircle2,
  Droplets,
  Apple,
  Footprints,
  Moon,
  UtensilsCrossed,
  Dumbbell,
  Flame,
  Star,
  Clock,
} from "lucide-react";

// Tugas harian yang "di-generate AI"
const AI_DAILY_TASKS = [
  { id: 1, title: "Minum air 8 gelas",   category: "Hidrasi",   points: 10, Icon: Droplets,        iconColor: "text-blue-500"   },
  { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi",   points: 15, Icon: Apple,           iconColor: "text-green-600"  },
  { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga",  points: 20, Icon: Footprints,      iconColor: "text-orange-500" },
  { id: 4, title: "Tidur 8 jam",         category: "Istirahat", points: 10, Icon: Moon,            iconColor: "text-purple-500" },
  { id: 5, title: "Sarapan bergizi",     category: "Nutrisi",   points: 15, Icon: UtensilsCrossed, iconColor: "text-yellow-600" },
];

// Teks animasi AI
const AI_TYPING_LINES = [
  "Menganalisis berat badan & targetmu...",
  "Menghitung kebutuhan kalori mingguan...",
  "Menyusun jadwal olahraga optimal...",
  "Membuat daftar tugas minggu ini...",
  "Rencanamu siap!",
];

const STEP_ORDER = ["weight", "target", "generating", "preview"];

/**
 * Modal 3 langkah:
 *  1. target    — set target berat badan (slider, max = berat dari onboarding)
 *  2. generating — animasi AI
 *  3. preview   — preview tugas → konfirmasi
 *
 * Props:
 *  - isOpen        {boolean}
 *  - onClose       {fn}
 *  - initialWeight {number}  berat saat ini dari onboarding/localStorage
 *  - initialTarget {number}  target awal (0 jika belum ada)
 *  - onConfirm     {fn({ currentWeight, targetWeight, tasks })}
 */
export default function SetupTargetModal({
  isOpen,
  onClose,
  initialWeight = 0,
  initialTarget = 0,
  onConfirm,
}) {
  const [step,         setStep]         = useState("target");
  const [targetWeight, setTargetWeight] = useState(initialTarget || Math.max(30, initialWeight - 5));
  const [typingIndex,  setTypingIndex]  = useState(0);

  // Reset setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setStep("target");
      setTargetWeight(initialTarget || Math.max(30, initialWeight - 5));
      setTypingIndex(0);
    }
  }, [isOpen, initialWeight, initialTarget]);

  // Animasi AI typing
  useEffect(() => {
    if (step !== "generating") return;
    if (typingIndex < AI_TYPING_LINES.length - 1) {
      const t = setTimeout(() => setTypingIndex((i) => i + 1), 650);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setStep("preview"), 800);
      return () => clearTimeout(t);
    }
  }, [typingIndex, step]);

  if (!isOpen) return null;

  const weightMax = initialWeight > 30 ? initialWeight : 150;
  const diff      = Math.abs(targetWeight - initialWeight).toFixed(1);
  const isLose    = targetWeight < initialWeight;
  const isGain    = targetWeight > initialWeight;

  const handleGenerate = () => {
    setTypingIndex(0);
    setStep("generating");
  };

  const handleConfirm = () => {
    onConfirm({ currentWeight: initialWeight, targetWeight, tasks: AI_DAILY_TASKS });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
      onClick={step === "target" ? onClose : undefined}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── STEP 1: SET TARGET ── */}
        {step === "target" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#006e2f]" />
                </div>
                <div>
                  <h2 id="setup-modal-title" className="text-lg font-bold text-[#191c20] font-lexend">
                    Set Target Berat Badan
                  </h2>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">
                    Tentukan target dan biarkan AI menyusun tugasmu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
              >
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Angka target */}
              <div className="text-center">
                <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target Berat</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-[#006e2f] font-lexend">
                    {targetWeight.toFixed(1)}
                  </span>
                  <span className="text-lg text-[#6d7b6c] font-jakarta">kg</span>
                </div>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input
                  type="range"
                  min="30"
                  max={weightMax}
                  step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                  aria-label="Target berat badan"
                  className="w-full h-2 bg-[#e5eeff] rounded-full appearance-none cursor-pointer accent-[#006e2f]"
                />
                <div className="flex justify-between text-xs text-[#6d7b6c] mt-1.5 font-jakarta">
                  <span>30 kg</span>
                  <span>{initialWeight > 0 ? `${initialWeight} kg` : "150 kg"}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Saat Ini</p>
                  <p className="text-base font-bold text-[#191c20] font-lexend">
                    {initialWeight > 0 ? `${initialWeight} kg` : "—"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 text-center border-2 border-[#006e2f]">
                  <p className="text-[10px] text-[#006e2f] font-jakarta mb-1">Target</p>
                  <p className="text-base font-bold text-[#006e2f] font-lexend">
                    {targetWeight.toFixed(1)} kg
                  </p>
                </div>
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Perlu</p>
                  <p className={`text-base font-bold font-lexend ${
                    isLose ? "text-blue-500" : isGain ? "text-orange-500" : "text-[#191c20]"
                  }`}>
                    {diff} kg
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-3.5 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005425] transition-colors flex items-center justify-center gap-2"
              >
                <Sparkle className="w-4 h-4" />
                Generate Tugas dengan AI
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: GENERATING (animasi AI) ── */}
        {step === "generating" && (
          <div className="p-8 flex flex-col items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="42" stroke="#e5eeff" strokeWidth="8" />
                <circle cx="48" cy="48" r="42" stroke="#006e2f" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="70 194" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkle className="w-7 h-7 text-[#005823]" />
              </div>
            </div>

            <div className="text-center w-full">
              <h2 className="text-xl font-bold text-[#191c20] font-lexend mb-5">
                AI sedang menyusun rencanamu
              </h2>
              <div className="space-y-3" aria-live="polite">
                {AI_TYPING_LINES.slice(0, typingIndex + 1).map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${
                      i < typingIndex ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                      i < typingIndex ? "text-[#006e2f]" : "text-[#c1c9bf] animate-pulse"
                    }`} />
                    <span className={`text-sm font-lexend ${
                      i < typingIndex ? "text-[#6d7b6c]" : "text-[#191c20]"
                    }`}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: PREVIEW TUGAS ── */}
        {step === "preview" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div>
                <h2 className="text-lg font-bold text-[#191c20] font-lexend">
                  Rencanamu sudah siap!
                </h2>
                <p className="text-xs text-[#6d7b6c] font-jakarta mt-0.5">
                  Target:{" "}
                  <span className="font-semibold text-[#006e2f]">{targetWeight.toFixed(1)} kg</span>
                  {" · "}
                  <span className="font-semibold text-blue-500">{diff} kg</span> lagi
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
              >
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            {/* Ringkasan */}
            <div className="px-6 pt-5 grid grid-cols-3 gap-2 mb-4">
              <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-[#191c20] font-lexend">1.800</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">kkal/hari</p>
              </div>
              <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Dumbbell className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-[#191c20] font-lexend">5x</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">olahraga/minggu</p>
              </div>
              <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-sm font-bold text-[#191c20] font-lexend">12</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">minggu target</p>
              </div>
            </div>

            {/* Daftar tugas */}
            <div className="px-6 pb-2">
              <p className="text-xs font-semibold text-[#6d7b6c] font-jakarta mb-2 uppercase tracking-wide">
                Tugas Minggu Ini
              </p>
              <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5eeff] overflow-hidden">
                {AI_DAILY_TASKS.map((task, i) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < AI_DAILY_TASKS.length - 1 ? "border-b border-[#e5eeff]" : ""
                    }`}
                  >
                    <task.Icon className={`w-4 h-4 flex-shrink-0 ${task.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c20] font-jakarta truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700 font-lexend">
                        +{task.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-center text-[#6d7b6c] font-jakarta px-6 py-3">
              Tugas diperbarui AI setiap minggu sesuai progresmu!
            </p>

            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => setStep("target")}
                className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
              >
                Ubah Target
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005425] transition-colors flex items-center justify-center gap-2"
              >
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
