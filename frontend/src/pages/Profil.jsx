import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Star,
  ChevronRight,
  User,
  Trash2,
  Flame as FireIcon,
  LogOut,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import WeightInputModal from "../components/WeightInputModal";
import Streak from "../components/ui/streak";
import { authApi } from "../lib/api";

// ─── Konstanta ────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

// SVG chart dimensions
const SVG_W = 600;
const SVG_H = 200;
const PAD_X = 20;

export default function Profile() {
  const navigate = useNavigate();

  // ─── User profile state (TODO: fetch GET /api/users/me) ───────────────────
  const [user] = useState({
    name:     "",
    joinDate: "",
    level:    1,
    title:    "Pemula",
    avatar:   "/public/profile/avatar.png",
    streak:   0,
  });

  // ─── Health stats state (TODO: fetch GET /api/users/me/stats) ─────────────
  const [stats] = useState({
    caloriesBurnedThisWeek: 0, // kkal terbakar minggu ini
    targetWeight:           65.0,
  });

  // ─── Weight log state (TODO: fetch GET /api/weight-logs) ──────────────────
  // Struktur tiap item: { id, date (ISO string), weight (number), note (string) }
  const [weightLog, setWeightLog] = useState([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [chartPeriod,    setChartPeriod]    = useState("mingguan");
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [isLoggingOut,   setIsLoggingOut]   = useState(false);

  // ─── Derived values ───────────────────────────────────────────────────────
  const hasLog        = weightLog.length > 0;
  const latestEntry   = hasLog ? weightLog[weightLog.length - 1] : null;
  const firstEntry    = hasLog ? weightLog[0] : null;
  const prevEntry     = weightLog.length >= 2 ? weightLog[weightLog.length - 2] : null;
  const currentWeight = latestEntry?.weight ?? 0;
  const weightDiff    = prevEntry ? +(currentWeight - prevEntry.weight).toFixed(1) : 0;
  const { targetWeight, caloriesBurnedThisWeek } = stats;

  // Progress menuju target (0–100%)
  const weightProgress = firstEntry && firstEntry.weight !== targetWeight
    ? Math.min(100, Math.max(0,
        ((firstEntry.weight - currentWeight) / (firstEntry.weight - targetWeight)) * 100
      ))
    : 0;

  // ─── Chart helpers ────────────────────────────────────────────────────────
  const chartEntries = weightLog.slice(-7);
  const hasChart     = chartEntries.length >= 2;
  const chartMin     = hasChart ? Math.floor(Math.min(...chartEntries.map(e => e.weight)) - 2) : 0;
  const chartMax     = hasChart ? Math.ceil(Math.max(...chartEntries.map(e => e.weight)) + 2) : 10;
  const chartRange   = chartMax - chartMin || 1;

  const toY = (w) => SVG_H - ((w - chartMin) / chartRange) * (SVG_H - 20) - 10;
  const toX = (i) => PAD_X + (i / Math.max(chartEntries.length - 1, 1)) * (SVG_W - PAD_X * 2);

  const points   = chartEntries.map((e, i) => [toX(i), toY(e.weight)]);
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const areaPath = hasChart
    ? linePath + ` L ${points[points.length - 1][0]} ${SVG_H} L ${points[0][0]} ${SVG_H} Z`
    : "";

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Tetap logout dari sisi client meski server error
    } finally {
      setIsLoggingOut(false);
      navigate("/login");
    }
  };

  // TODO: ganti dengan POST /api/weight-logs, lalu update weightLog dari response
  const handleWeightSuccess = (value, note) => {
    const today = new Date().toISOString().split("T")[0];
    setWeightLog(prev => [
      ...prev,
      { id: Date.now(), date: today, weight: value, note: note ?? "" },
    ]);
    setShowWeightModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">

          {/* Toast sukses */}
          {showSuccess && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-[#006e2f] flex-shrink-0" />
              <p className="font-jakarta text-sm text-[#191c20]">Berat badan berhasil dicatat!</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#e5eeff]">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#006e2f] text-white rounded-lg flex items-center justify-center hover:bg-[#005823] transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                      {user.name || "—"}
                    </h1>
                    <p className="text-[#6d7b6c] font-jakarta">
                      {user.joinDate ? `Bergabung sejak ${user.joinDate}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1 rounded-full w-fit">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-700 font-jakarta">
                      Level {user.level} - {user.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
                  <Streak count={user.streak} variant="compact" />
                </div>
                
              </div>
            </div>
          </div>

          {/* Catat Berat Badan Banner */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-[#191c20] font-lexend">Catat Berat Badan Minggu Ini</p>
              <p className="text-sm text-[#6d7b6c] font-jakarta">
                {latestEntry
                  ? <>Terakhir dicatat: <span className="font-semibold text-[#191c20]">{currentWeight} kg</span> pada {fmtDate(latestEntry.date)}</>
                  : "Belum ada catatan berat badan."}
              </p>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              data-testid="btn-catat-berat"
              className="flex items-center gap-2 px-5 py-3 bg-[#006e2f] text-white rounded-xl hover:bg-[#005823] transition-colors font-semibold font-jakarta whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Berat
            </button>
          </div>

          {/* Stats & Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Weight Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#191c20] font-lexend">Riwayat Berat Badan</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">
                    {chartEntries.length} entri terakhir
                  </p>
                </div>
                <div className="flex gap-2">
                  {["mingguan", "bulanan"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                        chartPeriod === period
                          ? "bg-[#006e2f] text-white"
                          : "bg-[#f8f9ff] text-[#6d7b6c] hover:bg-[#e5eeff]"
                      }`}
                    >
                      {period === "mingguan" ? "Mingguan" : "Bulanan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              {hasChart ? (
                <div className="relative h-48 mb-6">
                  <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#chartGradient)" />
                    <path d={linePath} fill="none" stroke="#006e2f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map(([x, y], i) => (
                      <g key={i}>
                        <circle cx={x} cy={y} r="8" fill="#006e2f" stroke="white" strokeWidth="3" />
                        <circle cx={x} cy={y} r="4" fill="white" />
                      </g>
                    ))}
                  </svg>
                  <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-2 px-1">
                    {chartEntries.map((e, i) => (
                      <span key={i}>{fmtDate(e.date)}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 mb-6 text-center">
                  <p className="text-[#6d7b6c] font-jakarta text-sm">
                    Belum cukup data untuk menampilkan grafik.
                  </p>
                </div>
              )}

              {/* Weight Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border border-[#e5eeff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Berat Awal</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">
                    {firstEntry ? `${firstEntry.weight} kg` : "—"}
                  </p>
                </div>
                <div className="text-center p-4 border border-[#e5eeff] rounded-2xl">
                  <p className="text-xs text-green-600 font-jakarta mb-1">Sekarang</p>
                  <p className="text-xl font-bold text-green-700 font-lexend">
                    {latestEntry ? `${currentWeight} kg` : "—"}
                  </p>
                  {prevEntry && (
                    <p className={`text-xs mt-1 font-jakarta flex items-center justify-center gap-0.5 ${
                      weightDiff < 0 ? "text-green-600" : weightDiff > 0 ? "text-orange-500" : "text-[#6d7b6c]"
                    }`}>
                      {weightDiff < 0 ? <TrendingDown className="w-3 h-3" />
                        : weightDiff > 0 ? <TrendingUp className="w-3 h-3" />
                        : <Minus className="w-3 h-3" />}
                      {weightDiff > 0 ? "+" : ""}{weightDiff} kg
                    </p>
                  )}
                </div>
                <div className="text-center p-4 border border-[#e5eeff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{targetWeight} kg</p>
                </div>
              </div>

              {/* Log Riwayat Terakhir */}
              {hasLog && (
                <div className="mt-6 border-t border-[#e5eeff] pt-4">
                  <p className="text-sm font-semibold text-[#191c20] font-lexend mb-3">Catatan Terakhir</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {[...weightLog].reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#f8f9ff] transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-[#191c20] font-lexend">{entry.weight} kg</p>
                          {entry.note && (
                            <p className="text-xs text-[#6d7b6c] font-jakarta">{entry.note}</p>
                          )}
                        </div>
                        <p className="text-xs text-[#6d7b6c] font-jakarta">{fmtDate(entry.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              {/* Progress ke Target */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
                <div className="mb-4">
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Sisa menuju target</p>
                  <p className="text-xl font-bold text-[#006e2f] font-lexend">
                    {latestEntry ? `${Math.max(0, +(currentWeight - targetWeight).toFixed(1))} kg` : "—"}
                  </p>
                </div>
                <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#006e2f] to-[#22c55e] rounded-full transition-all duration-500"
                    style={{ width: `${weightProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-1">
                  <span>{firstEntry ? `${firstEntry.weight} kg` : "—"}</span>
                  <span>{targetWeight} kg</span>
                </div>
              </div>

              {/* Calories Card */}
              <div className="bg-[#006e2f] rounded-3xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <FireIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-white/80 font-jakarta">Kalori Terbakar</h4>
                <p className="text-2xl font-bold font-lexend mt-1">
                  {caloriesBurnedThisWeek.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-white/70 font-jakarta mt-1">Minggu ini</p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
            <h3 className="text-lg font-bold text-[#191c20] font-lexend mb-4">Pengaturan Akun</h3>
            <div className="space-y-1">

              {/* Informasi Pribadi */}
              <button
                onClick={() => {}}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#f8f9ff] transition-colors text-left"
              >
                <User className="w-5 h-5 text-[#6d7b6c] flex-shrink-0" />
                <span className="flex-1 font-jakarta text-[#191c20]">Informasi Pribadi</span>
                <ChevronRight className="w-4 h-4 text-[#c1c9bf]" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors text-left disabled:opacity-60"
              >
                <LogOut className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="flex-1 font-jakarta text-orange-600">
                  {isLoggingOut ? "Keluar..." : "Keluar"}
                </span>
                <ChevronRight className="w-4 h-4 text-orange-300" />
              </button>

              {/* Hapus Akun */}
              <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-left">
                <Trash2 className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="flex-1 font-jakarta text-red-500">Hapus Akun</span>
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* Weight Input Modal */}
      <WeightInputModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSuccess={handleWeightSuccess}
        currentWeight={currentWeight}
        allowNote={true}
        allowMultiplePerDay={true}
      />
    </div>
  );
}
