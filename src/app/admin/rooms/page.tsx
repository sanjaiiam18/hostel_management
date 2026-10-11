"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus, Bed, Users, ShieldAlert, ArrowRightLeft, UserMinus, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [unallocatedStudents, setUnallocatedStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Create Room Modal State
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    roomNumber: "",
    hostelId: "",
    blockId: "",
    floorId: "",
    roomType: "Double",
    totalBeds: 2,
    facilities: "Attached Bathroom, Study Desk, Wardrobe",
  });
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  // Allocate Bed Modal State
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [allocationRemarks, setAllocationRemarks] = useState("");
  const [isAllocating, setIsAllocating] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roomsRes, hostelsRes, studentsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/hostels"),
        fetch("/api/students?isAllocated=false"),
      ]);

      if (roomsRes.ok) {
        const rData = await roomsRes.json();
        setRooms(rData.rooms || []);
      }
      if (hostelsRes.ok) {
        const hData = await hostelsRes.json();
        setHostels(hData.hostels || []);
        if (hData.hostels?.[0]) {
          const firstH = hData.hostels[0];
          setNewRoomData((prev) => ({
            ...prev,
            hostelId: firstH._id,
            blockId: firstH.blocks?.[0]?._id || "",
            floorId: firstH.floors?.[0]?._id || "",
          }));
        }
      }
      if (studentsRes.ok) {
        const sData = await studentsRes.json();
        setUnallocatedStudents(sData.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingRoom(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newRoomData,
          totalBeds: Number(newRoomData.totalBeds),
          facilities: newRoomData.facilities.split(",").map((f) => f.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create room");

      setIsCreateRoomOpen(false);
      setNotificationMsg(`Room ${newRoomData.roomNumber} created successfully with beds.`);
      setTimeout(() => setNotificationMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const openAllocateModal = (room: any, bed: any) => {
    setSelectedRoom(room);
    setSelectedBed(bed);
    setSelectedStudentId(unallocatedStudents[0]?._id || "");
    setAllocationRemarks("");
    setIsAllocateOpen(true);
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRoom || !selectedBed) return;

    setIsAllocating(true);
    try {
      const res = await fetch("/api/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          hostelId: selectedRoom.hostelId?._id || selectedRoom.hostelId,
          blockId: selectedRoom.blockId?._id || selectedRoom.blockId,
          floorId: selectedRoom.floorId?._id || selectedRoom.floorId,
          roomId: selectedRoom._id,
          bedId: selectedBed._id,
          remarks: allocationRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Allocation failed");

      setIsAllocateOpen(false);
      setNotificationMsg(`Bed ${selectedBed.bedNumber} allocated successfully.`);
      setTimeout(() => setNotificationMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAllocating(false);
    }
  };

  const handleVacate = async (studentId: string, bedNumber: string) => {
    if (!confirm(`Are you sure you want to vacate Bed ${bedNumber}?`)) return;

    try {
      const res = await fetch("/api/allocations/vacate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, remarks: "Vacated by administrator" }),
      });

      if (res.ok) {
        setNotificationMsg(`Student checked out and bed vacated.`);
        setTimeout(() => setNotificationMsg(""), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Hostel & Room Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure rooms, automated bed registries, and assign or transfer student accommodation
          </p>
        </div>
        <Button onClick={() => setIsCreateRoomOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add New Room
        </Button>
      </div>

      {notificationMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        title="Add New Hostel Room"
        description="Creates the room record and automatically generates individual beds"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Hostel
            </label>
            <select
              value={newRoomData.hostelId}
              onChange={(e) => {
                const hid = e.target.value;
                const h = hostels.find((item) => item._id === hid);
                setNewRoomData({
                  ...newRoomData,
                  hostelId: hid,
                  blockId: h?.blocks?.[0]?._id || "",
                  floorId: h?.floors?.[0]?._id || "",
                });
              }}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              required
            >
              {hostels.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Room Number"
              placeholder="e.g. 101, 204"
              value={newRoomData.roomNumber}
              onChange={(e) =>
                setNewRoomData({ ...newRoomData, roomNumber: e.target.value })
              }
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Room Type
              </label>
              <select
                value={newRoomData.roomType}
                onChange={(e) =>
                  setNewRoomData({ ...newRoomData, roomType: e.target.value as any })
                }
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              >
                <option value="Single">Single Occupancy</option>
                <option value="Double">Double Occupancy</option>
                <option value="Triple">Triple Occupancy</option>
                <option value="Quad">Quad Occupancy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Total Number of Beds
            </label>
            <Input
              type="number"
              min={1}
              max={8}
              value={newRoomData.totalBeds}
              onChange={(e) =>
                setNewRoomData({ ...newRoomData, totalBeds: Number(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Facilities (comma-separated)
            </label>
            <Input
              value={newRoomData.facilities}
              onChange={(e) =>
                setNewRoomData({ ...newRoomData, facilities: e.target.value })
              }
              placeholder="Attached Bathroom, Wi-Fi, Balcony"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateRoomOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreatingRoom}>
              Create Room & Beds
            </Button>
          </div>
        </form>
      </Modal>

      {/* Allocate Bed Modal */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => setIsAllocateOpen(false)}
        title={`Allocate Bed ${selectedBed?.bedNumber} in Room ${selectedRoom?.roomNumber}`}
        description="Select an unallocated student to assign to this vacant bed"
      >
        <form onSubmit={handleAllocateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Student ({unallocatedStudents.length} unallocated)
            </label>
            {unallocatedStudents.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                All registered students currently have active room allocations!
              </p>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                required
              >
                {unallocatedStudents.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.studentId}) - {s.profile?.department || "Student"}
                  </option>
                ))}
              </select>
            )}
          </div>

          <Input
            label="Administrative Remarks (Optional)"
            placeholder="e.g. Term 1 Regular Allocation"
            value={allocationRemarks}
            onChange={(e) => setAllocationRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAllocateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isAllocating}
              disabled={unallocatedStudents.length === 0}
            >
              Confirm Bed Allocation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rooms and Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Card key={room._id} className="overflow-hidden border-slate-200/90 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">
                  {room.hostelId?.name} • Block {room.blockId?.name}
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-0.5">
                  Room {room.roomNumber}
                </CardTitle>
              </div>
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
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                <span>{room.roomType} Room</span>
                <span>
                  Occupied: <b>{room.occupiedBeds}</b> / {room.totalBeds} Beds
                </span>
              </div>

              {/* Individual Bed Rows */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Beds in this Room
                </p>
                {room.beds?.map((bed: any) => (
                  <div
                    key={bed._id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      bed.isOccupied
                        ? "bg-slate-50 border-slate-200"
                        : "bg-emerald-50/40 border-emerald-200/80"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800">Bed {bed.bedNumber}</span>
                      <p className="text-[11px] text-slate-500">
                        {bed.isOccupied
                          ? bed.currentStudentId?.name || "Occupied"
                          : "Vacant Bed"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {bed.isOccupied ? (
                        <button
                          onClick={() =>
                            handleVacate(
                              bed.currentStudentId?._id || bed.currentStudentId,
                              bed.bedNumber
                            )
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Vacate Student"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => openAllocateModal(room, bed)}
                          className="px-2 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[11px] transition shadow-xs"
                        >
                          Allocate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
