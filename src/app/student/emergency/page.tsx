"use client";

import React, { useState, useEffect } from "react";
import { PhoneCall, ShieldAlert, Phone, MapPin, Clock, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentEmergencyPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emergency-contacts")
      .then((res) => res.json())
      .then((data) => setContacts(data.contacts || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Emergency Contacts Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Instant campus assistance hotlines and medical/security emergency phone numbers
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold">In case of extreme immediate danger or medical distress:</p>
          <p className="text-rose-800 mt-0.5">
            Contact campus security or call the ambulance service immediately. Click any phone number below to initiate a phone call directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact._id} className="p-5 hover:shadow-md transition-shadow border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="danger" className="text-[10px] mb-2">
                  {contact.category}
                </Badge>
                <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-100/60 text-rose-600">
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

            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href={`tel:${contact.phoneNumber}`}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                Call {contact.phoneNumber}
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
