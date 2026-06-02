import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Loader2, User, Weight, Ruler, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Data dummy — nanti diganti dengan fetch ke API berdasarkan id
const DUMMY_USERS = {
  "1": {
    id: "1",
    username: "ghifari123",
    email: "ghifari@email.com",
    level: 5,
    rankTitle: "Petualang",
    experiencePoints: 1250,
    rewardPoints: 340,
    streakCount: 14,
    lastLoginAt: "2026-05-24T08:30:00Z",
    createdAt: "2026-01-10T00:00:00Z",
    healthProfile: {
      gender: "male",
      weightKg: 72.5,
      heightCm: 175,
      goalWeight: 65,
    },
    weightLogs: [
      { id: "w1", weight: 74.0, loggedAt: "2026-05-01" },
      { id: "w2", weight: 73.2, loggedAt: "2026-05-08" },
      { id: "w3", weight: 72.5, loggedAt: "2026-05-15" },
    ],
  },
  "2": {
    id: "2",
    username: "siti_sehat",
    email: "siti@email.com",
    level: 3,
    rankTitle: "Pemula",
    experiencePoints: 450,
    rewardPoints: 120,
    streakCount: 7,
    lastLoginAt: "2026-05-23T14:00:00Z",
    createdAt: "2026-02-15T00:00:00Z",
    healthProfile: {
      gender: "female",
      weightKg: 58.0,
      heightCm: 162,
      goalWeight: 55,
    },
    weightLogs: [
      { id: "w1", weight: 59.5, loggedAt: "2026-05-05" },
      { id: "w2", weight: 58.8, loggedAt: "2026-05-12" },
      { id: "w3", weight: 58.0, loggedAt: "2026-05-19" },
    ],
  },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // TODO: ganti dengan fetch API
  const user = DUMMY_USERS[id];

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <p className="text-gray-500 text-sm">User tidak ditemukan.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: ganti dengan API call
      // await adminApi.deleteUser(id);
      await new Promise((r) => setTimeout(r, 800)); // simulasi
      navigate("/admin/users");
    } finally {
      setIsDeleting(false);
    }
  };

  const bmi =
    user.healthProfile
      ? (user.healthProfile.weightKg / Math.pow(user.healthProfile.heightCm / 100, 2)).toFixed(1)
      : null;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="gap-1 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hapus akun ini?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Ya, Hapus
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Akun
          </Button>
        )}
      </div>

      {/* Header user */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <User className="w-5 h-5 text-[#006e2f]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span className="ml-auto inline-block px-2.5 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
          {user.rankTitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info akun */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Info Akun</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <InfoRow label="Level" value={user.level} />
            <InfoRow label="XP" value={`${user.experiencePoints} poin`} />
            <InfoRow label="Reward Points" value={`${user.rewardPoints} poin`} />
            <InfoRow label="Streak" value={`${user.streakCount} hari`} />
            <InfoRow
              label="Login terakhir"
              value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("id-ID") : "-"}
            />
            <InfoRow
              label="Bergabung"
              value={new Date(user.createdAt).toLocaleDateString("id-ID")}
            />
          </CardContent>
        </Card>

        {/* Profil kesehatan */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Profil Kesehatan</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {user.healthProfile ? (
              <>
                <InfoRow
                  label="Gender"
                  value={user.healthProfile.gender === "male" ? "Laki-laki" : "Perempuan"}
                />
                <InfoRow label="Berat saat ini" value={`${user.healthProfile.weightKg} kg`} />
                <InfoRow label="Tinggi badan" value={`${user.healthProfile.heightCm} cm`} />
                <InfoRow label="Target berat" value={`${user.healthProfile.goalWeight} kg`} />
                <InfoRow label="BMI" value={bmi} />
              </>
            ) : (
              <p className="text-sm text-gray-400 py-2">Belum mengisi profil kesehatan.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Riwayat berat badan */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-gray-700">Riwayat Berat Badan</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {user.weightLogs.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada log berat badan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-medium text-gray-500">Tanggal</th>
                    <th className="text-left py-2 font-medium text-gray-500">Berat (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {user.weightLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">{log.loggedAt}</td>
                      <td className="py-2 font-medium text-gray-800">{log.weight} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
