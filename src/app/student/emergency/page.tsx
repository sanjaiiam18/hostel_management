"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, ShieldAlert, Phone, MapPin, Clock, Copy, Check, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function StudentEmergencyPage() {
  const { success } = useToast();
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const fetchContacts = () => {
    setIsLoading(true);
    fetch("/api/emergency-contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data.contacts || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCopy = (phone: string, name: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    success("Number Copied", `${name} (${phone}) copied to clipboard.`);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            24/7 Campus Emergency Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct priority hotlines for chief warden, campus security, ambulance, and health dispensary
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchContacts} className="gap-1.5 h-8 text-xs font-semibold self-end sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-red-50 to-white border border-rose-200 text-rose-950 flex items-start gap-3 shadow-xs">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold">Immediate Medical Emergency or Safety Concern:</p>
          <p className="text-rose-800 mt-0.5">
            Campus security vehicles and college ambulances are on standby 24/7. Tap any phone number below to dial directly or copy the digits.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} lines={3} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <Card key={contact._id} className="p-5 hover:shadow-md transition-shadow border-slate-200/80 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="danger" className="text-[10px] mb-2 font-bold">
                    {contact.category}
                  </Badge>
                  <h3 className="text-base font-black text-slate-900">{contact.name}</h3>
                </div>
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                  <PhoneCall className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {contact.location && (
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {contact.location}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {contact.availability || "24/7 Available"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <a
                  href={`tel:${contact.phoneNumber}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Call {contact.phoneNumber}
                </a>
                <button
                  onClick={() => handleCopy(contact.phoneNumber, contact.name)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition active:scale-95"
                  title="Copy Phone Number"
                >
                  {copiedPhone === contact.phoneNumber ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
