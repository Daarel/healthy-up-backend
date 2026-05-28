import { useState } from "react";
import { X, Target } from "lucide-react";

/**
 * Modal untuk mengubah target berat badan — konten dari OnboardingStep4.
 *
 * Props:
 *  - isOpen         {boolean}
 *  - onClose        {fn}
 *  - currentWeight  {number}  berat saat ini (untuk kartu "Saat Ini")
 *  - initialTarget  {number}  target yang sudah tersimpan
 *  - onSave         {fn(newTarget: number)}
 */
export default function TargetWeightModal({
  isOpen,
  onClose,
  currentWeight,
  initialTarget,
  onSave,
}) {
  const [targetWeight, setTargetWeight] = useState(initialTarget);

  if (!isOpen) return null;

  const diff = Math.abs(targetWeight - currentWeight);
  const isLose = targetWeight < currentWeight;
  const isGain = targetWeight > currentWeight;

  const handleSave = () => {
    onSave(targetWeight);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="target-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-[#006e2f]" />
            </div>
            <div>
              <h2
                id="target-modal-title"
                className="text-lg font-bold text-[#191c20] font-lexend"
              >
                Target Berat Badan
              </h2>
              <p className="text-xs text-[#6d7b6c] font-jakarta">
                Geser slider untuk mengubah target
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Angka target besar */}
          <div className="text-center">
            <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target Berat</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-[#006e2f] font-lexend">
                {targetWeight}
              </span>
              <span className="text-lg text-[#6d7b6c] font-jakarta">kg</span>
            </div>
          </div>

          {/* Slider */}
          <div className="px-1">
            <input
              type="range"
              min="30"
              max="150"
              value={targetWeight}
              onChange={(e) => setTargetWeight(Number(e.target.value))}
              aria-label="Target berat badan"
              className="w-full h-2 bg-[#e5eeff] rounded-full appearance-none cursor-pointer accent-[#006e2f]"
            />
            <div className="flex justify-between text-xs text-[#6d7b6c] mt-1.5 font-jakarta">
              <span>30 kg</span>
              <span>150 kg</span>
            </div>
          </div>

          {/* Stats: Saat Ini / Target / Perlu */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
              <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Saat Ini</p>
              <p className="text-base font-bold text-[#191c20] font-lexend">
                {currentWeight} kg
              </p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center border-2 border-[#006e2f]">
              <p className="text-[10px] text-[#006e2f] font-jakarta mb-1">Target</p>
              <p className="text-base font-bold text-[#006e2f] font-lexend">
                {targetWeight} kg
              </p>
            </div>
            <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
              <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Perlu</p>
              <p
                className={`text-base font-bold font-lexend ${
                  isLose ? "text-blue-500" : isGain ? "text-orange-500" : "text-[#191c20]"
                }`}
              >
                {diff} kg
              </p>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-[#6d7b6c] font-jakarta text-center">
            Target penurunan berat badan yang sehat adalah 0.5–1 kg per minggu.
          </p>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005425] transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
