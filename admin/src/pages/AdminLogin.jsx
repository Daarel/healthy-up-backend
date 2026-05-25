import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // TODO: ganti dengan real API call
      // const res = await adminApi.login(email, password);
      // localStorage.setItem("admin_token", res.data.token);

      // Simulasi sementara
      if (email === "admin@healthyup.com" && password === "admin123") {
        localStorage.setItem("admin_token", "dummy_admin_token");
        navigate("/admin/users");
      } else {
        setError("Email atau password salah.");
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-[#005823] font-lexend leading-none">
          HealthyUp
        </span>
        <span className="text-sm font-bold text-gray-400 font-lexend leading-none mt-0.5">
          Admin
        </span>
      </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@healthyup.com"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-[#006e2f] hover:bg-[#005823]">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
