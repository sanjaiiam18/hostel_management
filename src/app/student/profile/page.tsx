"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Building, MapPin, Shield, KeyRound, Check, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const fetchProfile = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await fetch("/api/students/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfileSuccess("Contact & guardian details updated successfully.");
      fetchProfile();
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      setIsSavingPassword(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-3xl shadow-md ring-4 ring-brand-50 shrink-0">
          {userData?.name?.[0]?.toUpperCase()}
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {userData?.name}
            </h1>
            <Badge variant="success">Verified Student</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student ID: <b className="text-slate-700">{userData?.studentId}</b> • Department of{" "}
            {profileData?.department} • {profileData?.academicYear}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {userData?.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> {userData?.phone || "No phone added"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Hostel & Academic Record (Read-Only) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-600" />
                Hostel Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <p className="text-slate-400 uppercase text-[10px] font-semibold">Hostel</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {profileData?.hostelId?.name || "Pending Allocation"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Block</p>
                  <p className="font-semibold text-slate-800">
                    {profileData?.blockId?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Floor</p>
                  <p className="font-semibold text-slate-800">
                    Floor {profileData?.floorId?.floorNumber ?? "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Room Number</p>
                  <p className="font-semibold text-slate-800">
                    {profileData?.roomId?.roomNumber || "N/A"} ({profileData?.roomId?.roomType || "Standard"})
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Bed Allocation</p>
                  <p className="font-semibold text-brand-600">
                    Bed {profileData?.bedId?.bedNumber || "Unassigned"}
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 italic">
                * Note: Room assignments are managed strictly by authorized hostel wardens.
              </p>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                {passwordSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                    {passwordError}
                  </div>
                )}
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  placeholder="Min 6 characters"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                />
                <Button type="submit" size="sm" className="w-full mt-1" isLoading={isSavingPassword}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Editable Permitted Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-4 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" />
                Contact & Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {profileError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9876543210"
                  />
                  <Input
                    label="Blood Group"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    placeholder="e.g. O+, B+, A-"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Permanent Home Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="Complete residential address with postal code"
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Parent / Guardian Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Guardian Name"
                      value={formData.guardianName}
                      onChange={(e) =>
                        setFormData({ ...formData, guardianName: e.target.value })
                      }
                      placeholder="Father / Mother name"
                    />
                    <Input
                      label="Guardian Phone"
                      value={formData.guardianPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, guardianPhone: e.target.value })
                      }
                      placeholder="Emergency contact phone"
                    />
                    <Input
                      label="Relationship"
                      value={formData.guardianRelation}
                      onChange={(e) =>
                        setFormData({ ...formData, guardianRelation: e.target.value })
                      }
                      placeholder="Father, Mother, Local Guardian"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button type="submit" isLoading={isSavingProfile}>
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
