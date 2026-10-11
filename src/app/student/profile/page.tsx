"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  Copy,
  Save,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileBannerSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function StudentProfilePage() {
  const { success, error: toastError } = useToast();

  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "security">("details");
  const [copiedId, setCopiedId] = useState(false);

  // Profile Edit State
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bloodGroup: "",
    guardianName: "",
    guardianPhone: "",
    guardianRelation: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/students/profile");
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user);
        setProfileData(data.profile);
        setFormData({
          phone: data.user.phone || "",
          address: data.profile?.address || "",
          bloodGroup: data.profile?.bloodGroup || "",
          guardianName: data.profile?.guardianName || "",
          guardianPhone: data.profile?.guardianPhone || "",
          guardianRelation: data.profile?.guardianRelation || "",
        });
      }
    } catch (e) {
      console.error(e);
      toastError("Load Error", "Unable to load student profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    success("Copied", `Student ID ${id} copied.`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/students/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      success("Profile Updated", "Contact and emergency guardian records saved.");
      fetchProfile();
    } catch (err: any) {
      toastError("Update Failed", err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError("Mismatch", "New passwords do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toastError("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      success("Password Changed", "Your portal password has been updated securely.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toastError("Password Error", err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Student Profile & Residential Dossier
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal contact information, emergency guardian details, and account security
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchProfile} className="gap-1.5 h-8 text-xs font-semibold self-end sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Dossier
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <ProfileBannerSkeleton />
          <CardSkeleton lines={6} />
        </div>
      ) : (
        <>
          {/* Identity Header Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 border border-navy-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl border-2 border-white/20 shadow-lg">
                {userData?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {userData?.name}
                  </h2>
                  <Badge variant="success">Active Student</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <button
                    onClick={() => handleCopyId(userData?.studentId)}
                    className="inline-flex items-center gap-1 font-mono font-bold bg-white/10 px-2 py-0.5 rounded hover:bg-white/20 transition active:scale-95"
                  >
                    <span>{userData?.studentId}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                  <span>&bull;</span>
                  <span>{userData?.email}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {profileData?.department || "Academic Dept"} &bull; {profileData?.academicYear || "Year 3"} &bull; Blood Group: <b>{profileData?.bloodGroup || "O+"}</b>
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs text-slate-300 space-y-1 min-w-[200px]">
              <span className="text-[10px] uppercase font-bold text-brand-300">Room Allocation</span>
              <p className="font-bold text-white text-sm">
                {profileData?.hostelId?.name || "Hostel"}
              </p>
              <p className="text-[11px] text-slate-300">
                Block {profileData?.blockId?.name || "A"} &bull; Room {profileData?.roomId?.roomNumber || "N/A"} &bull; Bed {profileData?.bedId?.bedNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "details"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Contact &amp; Guardian Info
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === "security"
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Account Security &amp; Password
            </button>
          </div>

          {activeTab === "details" ? (
            <Card className="shadow-xs">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Update Permitted Personal Information
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Hostel wardens and security desk use these contact numbers for verification.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Personal Phone Number</label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 11001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                      <select
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Residential Address</label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
                      Emergency Parent / Guardian Record
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Name</label>
                        <Input
                          value={formData.guardianName}
                          onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                          placeholder="Parent / Guardian Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
                        <Input
                          value={formData.guardianRelation}
                          onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                          placeholder="Father / Mother / Guardian"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Phone</label>
                        <Input
                          value={formData.guardianPhone}
                          onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                          placeholder="+91 98220 12345"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingProfile}
                      className="gap-1.5 font-bold"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xs max-w-lg">
              <CardHeader className="p-5 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Change Account Password
                </CardTitle>
                <p className="text-[11px] text-slate-500">
                  Protect your hostel portal account with a secure password.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingPassword}
                      className="font-bold"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
