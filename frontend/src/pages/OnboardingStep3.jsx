import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const REGISTER_KEY = "healthyup:register";

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/2")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 3 dari 3</span>
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
            Hasil BMI Anda
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Berdasarkan data yang Anda masukkan, berikut adalah hasil perhitungan BMI Anda
          </p>

          {/* BMI Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-6">
            <div className="text-center mb-6">
              <p className="text-[#6d7b6c] font-jakarta mb-2">BMI Score</p>
              {/* TODO: tampilkan BMI dari response POST /api/auth/register */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-10 bg-[#e5eeff] rounded-xl animate-pulse" />
                <div className="w-28 h-6 bg-[#e5eeff] rounded-full animate-pulse" />
              </div>
            </div>

            {/* BMI Gauge */}
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="absolute left-0 top-0 h-full w-[18%] bg-blue-400"></div>
              <div className="absolute left-[18%] top-0 h-full w-[25%] bg-green-500"></div>
              <div className="absolute left-[43%] top-0 h-full w-[17%] bg-yellow-400"></div>
              <div className="absolute left-[60%] top-0 h-full w-[40%] bg-red-500"></div>
            </div>

            {/* BMI Legend */}
            <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta">
              <span>Kurus</span>
              <span>Normal</span>
              <span>Berlebihan</span>
              <span>Obesitas</span>
            </div>

            <p className="text-xs text-center text-[#6d7b6c] font-jakarta mt-4">
              Hasil BMI lengkap akan tersedia setelah akun dibuat.
            </p>
          </div>

         

          {registerError && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-jakarta mb-4">
              {registerError}
            </div>
          )}

          <button
            onClick={async () => {
              setRegisterError("");
              setIsRegistering(true);
              try {
                const raw = sessionStorage.getItem(REGISTER_KEY);
                if (!raw) {
                  navigate("/onboarding/1");
                  return;
                }
                const { username, email, password, weight } = JSON.parse(raw);
                const res = await authApi.register(username, email, password);
                setUser(res.data.user);
                // Simpan berat onboarding ke localStorage agar tersedia di Dashboard
                if (weight) {
                  try {
                    const existing = JSON.parse(localStorage.getItem("healthyup:weightLog")) ?? {};
                    localStorage.setItem("healthyup:weightLog", JSON.stringify({
                      ...existing,
                      currentWeight: weight,
                      previousWeight: weight,
                    }));
                  } catch {}
                }
                sessionStorage.removeItem(REGISTER_KEY);
                navigate("/dashboard");
              } catch (err) {
                setRegisterError(err.message || "Gagal membuat akun. Coba lagi.");
              } finally {
                setIsRegistering(false);
              }
            }}
            disabled={isRegistering}
            className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Membuat akun...
              </>
            ) : (
              <>
                Mulai Perjalanan
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6 bg-[#e5eeff]">
        <div className="h-full rounded-3xl overflow-hidden relative">
          <img
            src="/public/onboarding/3.jpg"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}