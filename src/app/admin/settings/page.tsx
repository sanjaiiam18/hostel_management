"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, PhoneCall, Plus, Activity, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [newContact, setNewContact] = useState({
    name: "",
    category: "Security",
    phoneNumber: "",
    location: "Campus Main Gate",
    availability: "24/7 Available",
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch("/api/emergency-contacts"),
        fetch("/api/admin/audit-logs"),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setContacts(cData.contacts || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAuditLogs(aData.logs || []);
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

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });

      if (res.ok) {
        setIsContactModalOpen(false);
        setMessage("Emergency contact added successfully.");
        setTimeout(() => setMessage(""), 3000);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">System Settings & Governance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure institutional hotline contacts, review compliance parameters, and audit history
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Emergency Contacts Management */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Institutional Emergency Contacts Directory
            </CardTitle>
          </div>
          <Button onClick={() => setIsContactModalOpen(true)} size="sm" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {contacts.map((c) => (
              <div key={c._id} className="p-3 rounded-xl border border-slate-200 text-xs bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{c.name}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                    {c.category}
                  </span>
                </div>
                <p className="text-brand-600 font-bold mt-1">{c.phoneNumber}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  {c.location} • {c.availability}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Add Institutional Emergency Number"
        description="Will be immediately visible to all students on their emergency directory page"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <Input
            label="Service / Official Name"
            placeholder="e.g. Chief Security Control Room"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={newContact.category}
                onChange={(e) => setNewContact({ ...newContact, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              >
                <option value="Security">Security</option>
                <option value="Warden">Warden</option>
                <option value="Ambulance">Ambulance</option>
                <option value="Police">Police</option>
                <option value="Fire Service">Fire Service</option>
                <option value="Hostel Office">Hostel Office</option>
                <option value="College Administration">College Administration</option>
              </select>
            </div>

            <Input
              label="Telephone Number"
              placeholder="+91 9876543210"
              value={newContact.phoneNumber}
              onChange={(e) =>
                setNewContact({ ...newContact, phoneNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Office Location"
              value={newContact.location}
              onChange={(e) =>
                setNewContact({ ...newContact, location: e.target.value })
              }
            />
            <Input
              label="Operating Hours"
              value={newContact.availability}
              onChange={(e) =>
                setNewContact({ ...newContact, availability: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsContactModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Emergency Contact</Button>
          </div>
        </form>
      </Modal>

      {/* Comprehensive System Audit Trail Logs */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Administrative Audit Trail Log
            </CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            Immutable tracking for institutional review
          </span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No audit logs captured yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Action Code</th>
                  <th className="px-6 py-3.5">Entity / Resource</th>
                  <th className="px-6 py-3.5">User Responsible</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-mono font-bold text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-600">
                      {log.resource}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {log.userEmail || "System Automation"}
                    </td>
                    <td className="px-6 py-3 text-slate-400">
                      {formatDateTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
