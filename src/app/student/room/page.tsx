"use client";

import React, { useState, useEffect } from "react";
import { Bed, Building2, MapPin, Phone, Users, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentRoomPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, roomsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/rooms"),
        ]);

        if (meRes.ok) {
          const d = await meRes.json();
          setProfileData(d.profile);
        }

        if (roomsRes.ok) {
          const r = await roomsRes.json();
          setAllRooms(r.rooms || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const isAllocated = profileData?.isAllocated;
  const currentRoom = allRooms.find(
    (r) => r._id === profileData?.roomId?._id || r.roomNumber === profileData?.roomId?.roomNumber
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">My Room & Hostel</h1>
        <p className="text-xs text-slate-500 mt-1">
          View your allocated room, bed details, facilities, and campus room availability
        </p>
      </div>

      {/* Main Room Card */}
      {isAllocated ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-brand-200/60 overflow-hidden shadow-md">
              <div className="bg-gradient-to-r from-navy-900 to-brand-900 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-300">
                    Allocated Accommodation
                  </span>
                  <h2 className="text-3xl font-extrabold mt-0.5">
                    Room {profileData?.roomId?.roomNumber}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {profileData?.hostelId?.name} • Block {profileData?.blockId?.name} • Floor {profileData?.floorId?.floorNumber}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Allocated Bed</p>
                  <p className="text-xl font-bold text-brand-300">
                    Bed {profileData?.bedId?.bedNumber}
                  </p>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Room Type</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {profileData?.roomId?.roomType || "Double"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Beds</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {currentRoom?.totalBeds || 2}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Occupied Beds</p>
                    <p className="text-sm font-bold text-brand-600 mt-0.5">
                      {currentRoom?.occupiedBeds || 1}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Status</p>
                    <Badge variant="success" className="mt-1">
                      {currentRoom?.status || "Occupied"}
                    </Badge>
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Room Facilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["High-speed Wi-Fi", "Study Desk & Chair", "Attached Bathroom", "Ceiling Fan", "Steel Wardrobe", "24/7 Power Backup"].map(
                      (fac) => (
                        <span
                          key={fac}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                          {fac}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Room Beds & Roommates */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-600" />
                    Bed Allocations in Room {profileData?.roomId?.roomNumber}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentRoom?.beds?.map((bed: any) => {
                      const isMe = bed.currentStudentId?.studentId === profileData?.studentId;
                      return (
                        <div
                          key={bed._id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between ${
                            isMe
                              ? "bg-brand-50/60 border-brand-300 ring-1 ring-brand-400"
                              : bed.isOccupied
                              ? "bg-slate-50 border-slate-200"
                              : "bg-emerald-50/40 border-emerald-200"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">
                                Bed {bed.bedNumber}
                              </span>
                              {isMe && (
                                <Badge variant="default" className="text-[10px]">
                                  Your Bed
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {bed.isOccupied
                                ? bed.currentStudentId?.name || "Occupied"
                                : "Available Bed"}
                            </p>
                          </div>
                          <Badge variant={bed.isOccupied ? "secondary" : "success"}>
                            {bed.isOccupied ? "Occupied" : "Vacant"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Warden Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Hostel Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Chief Warden</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    {profileData?.hostelId?.wardenName || "Dr. Rajesh Sharma"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Contact Telephone</p>
                  <a
                    href={`tel:${profileData?.hostelId?.wardenContact || "+919876500001"}`}
                    className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:underline mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {profileData?.hostelId?.wardenContact || "+91 98765 00001"}
                  </a>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-400 uppercase text-[10px] font-semibold">Office Hours</p>
                  <p className="text-slate-700 mt-0.5">
                    Monday – Saturday: 9:00 AM – 6:00 PM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Allocation In Progress</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your room has not been allocated yet. Hostel administrative staff will assign your hostel, block, room, and bed shortly. You will receive an immediate in-app notification once completed.
          </p>
        </Card>
      )}

      {/* Hostel Rooms Availability Overview (Section 8) */}
      <div className="pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Hostel Rooms Availability Directory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allRooms.map((room) => (
            <Card key={room._id} className="p-4 hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">
                  Room {room.roomNumber}
                </span>
                <Badge
                  variant={
                    room.status === "Available"
                      ? "success"
                      : room.status === "Partially Occupied"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {room.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {room.hostelId?.name} • {room.roomType}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                <span>Available: <b className="text-emerald-600">{room.availableBeds}</b></span>
                <span>Total: {room.totalBeds} beds</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
