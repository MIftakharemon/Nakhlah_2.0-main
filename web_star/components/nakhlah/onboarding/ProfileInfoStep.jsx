"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mascot } from "../Mascot";
import { Input } from "@/components/ui/input";
import { Camera, CheckCircle2 } from "lucide-react";

const MAX_FILE_SIZE = 300 * 1024;

export function ProfileInfoStep({
  fullName,
  contactNumber,
  profilePicture,
  onChange,
}) {
  const [localName, setLocalName] = useState(fullName || "");
  const [localContact, setLocalContact] = useState(contactNumber || "");
  const [localPicture, setLocalPicture] = useState(profilePicture || null);
  const [fileError, setFileError] = useState("");
  const [contactError, setContactError] = useState("");

  useEffect(() => {
    onChange({
      fullName: localName,
      contactNumber: localContact,
      profilePicture: localPicture,
      fileError,
      contactError,
    });
  }, [
    localName,
    localContact,
    localPicture,
    fileError,
    contactError,
    onChange,
  ]);

  const previewUrl = useMemo(() => {
    if (!localPicture) return "";
    return URL.createObjectURL(localPicture);
  }, [localPicture]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setLocalPicture(null);
      setFileError("");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setLocalPicture(null);
      setFileError("Profile picture must be below 300KB.");
      return;
    }

    setFileError("");
    setLocalPicture(file);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-center gap-8 justify-center"
      >
        <Mascot mood="happy" size="md" className="" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            Tell us about you
          </h1>
          <p className="text-muted-foreground">
            Add your profile details before we continue
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        <div className="bg-card border border-border p-4 rounded-2xl">
          <label className="block text-sm text-muted-foreground mb-1">
            Full name
          </label>
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="rounded-xl"
            placeholder="Your full name"
          />
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <label className="block text-sm text-muted-foreground mb-1">
            Contact number
          </label>
          <Input
            value={localContact}
            onChange={(e) => {
              const value = e.target.value;
              setLocalContact(value);
              if (value && !value.startsWith("0")) {
                setContactError("Contact number must start with 0");
              } else {
                setContactError("");
              }
            }}
            className="rounded-xl"
            placeholder="0XXXXXXXXXX"
          />
          {contactError ? (
            <p className="text-xs text-destructive mt-1">{contactError}</p>
          ) : null}
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <label className="block text-sm text-muted-foreground mb-2">
            Profile picture (optional)
          </label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border hover:border-accent cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-semibold">Choose image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {localPicture ? (
              <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                {localPicture.name}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Max size: 300KB
              </span>
            )}
          </div>

          {previewUrl ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-14 h-14 rounded-xl object-cover border border-border"
              />
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to upload
              </span>
            </div>
          ) : null}

          {fileError ? (
            <p className="text-xs text-destructive mt-2">{fileError}</p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
