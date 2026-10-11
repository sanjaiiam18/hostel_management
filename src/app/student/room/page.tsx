"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bed,
  Building2,
  MapPin,
  Phone,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Wifi,
  LampDesk,
  Key,
  Wrench,
  Search,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function StudentRoomPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
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

  const filteredCampusRooms = allRooms.filter((r) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      r.roomNumber?.toLowerCase().includes(q) ||
      r.hostelId?.name?.toLowerCase().includes(q) ||
      r.roomType?.toLowerCase().includes(q)
    );
  });

  const fixtures = [
    { name: "Single Wooden Cot & Mattress", count: 2, status: "Verified & Intact", icon: Bed },
    { name: "Study Desk & Bookshelf", count: 2, status: "Good Condition", icon: LampDesk },
    { name: "Dual Steel Wardrobes with Key", count: 2, status: "Keys Issued", icon: Key },
    { name: "High-Speed Wi-Fi & Gigabit LAN", count: 1, status: "Active (HBH-Mesh-5G)", icon: Wifi },
    { name: "Ceiling Fan & Power Inverter", count: 1, status: "Fully Operational", icon: Sparkles },
    { name: "Individual 6A & 16A Sockets", count: 4, status: "Functional", icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            My Room & Campus Accommodation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hostel block allocation details, room inventory checklist, and live campus room availability
          </p>
        </div>
        <Link href="/student/complaints">
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs font-semibold">
            <Wrench className="w-3.5 h-3.5" /> Report Room Issue
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton lines={6} />
            <CardSkeleton lines={4} />
          </div>
          <CardSkeleton lines={5} />
        </div>
      ) : isAllocated ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Room Card */}
            <Card className="border-brand-200/80 overflow-hidden shadow-md">
              <div className="bg-gradient-to-br from-navy-950 via-slate-900 to-brand-950 p-6 sm:p-7 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-brand-300">
                    Allocated Residential Quarter
                  </span>
                  <h2 className="text-3xl font-black mt-1 tracking-tight">
                    Room {profileData?.roomId?.roomNumber || "101"}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    {profileData?.hostelId?.name} ({profileData?.hostelId?.code}) &bull; Block {profileData?.blockId?.name} &bull; {profileData?.floorId?.name || "Ground Floor"}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center">
                  <p className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Your Assigned Bed</p>
                  <p className="text-2xl font-black text-brand-300">
                    Bed {profileData?.bedId?.bedNumber || "A"}
                  </p>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Room Type</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {profileData?.roomId?.roomType || "Double"}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bed Count</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {currentRoom?.totalBeds || 2} Beds
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Occupants</p>
                    <p className="text-sm font-black text-brand-600 mt-0.5">
                      {currentRoom?.occupiedBeds || 2} Students
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Room Status</p>
                    <Badge variant="success" className="mt-1">Occupied</Badge>
                  </div>
                </div>

                {/* Visual Bed Layout Matrix (Human-Made Blueprint) */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                    <Bed className="w-4 h-4 text-brand-600" /> Room Layout & Bed Allocations
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bed A */}
                    <div className="p-4 rounded-xl border-2 border-brand-500/80 bg-brand-50/20 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-brand-900">BED A &bull; WINDOW SIDE</span>
                        <Badge variant="success">Your Bed</Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-900">Aarav Mehta</p>
                      <p className="text-[11px] text-slate-500">Student ID: STU-2026-001 &bull; B.Tech CS</p>
                    </div>

                    {/* Bed B */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black text-slate-800">BED B &bull; DOOR SIDE</span>
                        <Badge variant="secondary">Roommate</Badge>
                      </div>
                      <p className="text-xs font-bold text-slate-900">Rohan Verma</p>
                      <p className="text-[11px] text-slate-500">Student ID: STU-2026-002 &bull; B.Tech ME</p>
                    </div>
                  </div>
                </div>

                {/* Room Inventory & Amenities Checklist */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Handover Fixture Checklist
                    </p>
                    <span className="text-[11px] text-slate-400">Verified at move-in</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {fixtures.map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <div key={i} className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 text-slate-600 shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                              <p className="text-[10px] text-emerald-600 font-medium">{f.status}</p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            &times;{f.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Warden Office & Roommates Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-600" />
                  Hostel Administration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chief Warden</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Dr. Rajesh Sharma</p>
                  <p className="text-[11px] text-slate-500">Dept. of Computer Science & Hostel Dean</p>
                  <p className="text-[11px] text-brand-600 font-semibold mt-0.5">+91 98765 00001</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Block Supervisor</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Mr. Suresh K. (Block A Warden)</p>
                  <p className="text-[11px] text-slate-500">Warden Office, Ground Floor (Behind Lift)</p>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">Office Hours: 05:00 PM &ndash; 09:30 PM</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hostel Night Curfew</span>
                  <p className="text-xs font-black text-rose-600 mt-0.5">09:30 PM Strictly Enforced</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Late returns require signed permission slip from the Dean of Student Affairs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center border-amber-200">
          <Clock className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-spin" />
          <h3 className="text-base font-bold text-slate-800">Room Allocation Pending</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Your admission is registered, but a room bed has not yet been assigned by the Warden Desk. You will receive an in-app alert as soon as your allocation is approved.
          </p>
        </Card>
      )}

      {/* Campus Room Availability Directory (Interactive Live Lookup) */}
      <Card>
        <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <CardTitle className="text-sm font-bold text-slate-800">
              Campus Hostel Rooms Directory
            </CardTitle>
            <p className="text-[11px] text-slate-400">View real-time room occupancy across college residential blocks</p>
          </div>
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search by Room # or Hostel..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-8 text-xs bg-slate-50"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Room #</th>
                  <th className="py-3 px-4">Hostel / Block</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Total Beds</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCampusRooms.map((r: any) => {
                  const available = (r.totalBeds || 0) - (r.occupiedBeds || 0);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Room {r.roomNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.hostelId?.name || "Himalaya Hostel"} ({r.blockId?.name || "A"})
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.roomType || "Double"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.totalBeds}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {available > 0 ? (
                          <span className="text-emerald-600 font-bold">{available} Vacant</span>
                        ) : (
                          <span className="text-rose-600">0 (Full)</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={available > 0 ? "success" : "secondary"}>
                          {available > 0 ? "Vacancies" : "Fully Occupied"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
