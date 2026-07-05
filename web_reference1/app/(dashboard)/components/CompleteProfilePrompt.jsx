"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mascot } from "@/components/nakhlah/Mascot";
import { Camera, CheckCircle2, X } from "lucide-react";

const MAX_FILE_SIZE = 300 * 1024;

export function CompleteProfilePrompt({ open, isSubmitting, onSubmit, onClose }) {
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [fileError, setFileError] = useState("");
  const [contactError, setContactError] = useState("");

  const canSubmit = useMemo(() => {
    const validContact = contactNumber.trim().startsWith("0") && contactNumber.trim().length > 1;
    return fullName.trim().length > 1 && validContact && !fileError;
  }, [fullName, contactNumber, fileError]);

  if (!open) return null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setProfilePicture(null);
      setFileError("");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setProfilePicture(null);
      setFileError("Profile picture must be below 300KB.");
      return;
    }

    setFileError("");
    setProfilePicture(file);
  };

  const submit = () => {
    if (!canSubmit || isSubmitting) return;
    onSubmit({
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      profilePicture,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose?.();
        }
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-border bg-background/70 p-2">
              <Mascot mood="encouraging" size="xl" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-accent uppercase">Almost there</p>
              <h2 className="text-xl font-bold text-foreground">Complete your profile</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isSubmitting && onClose?.()}
            className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-background"
            aria-label="Close profile prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4 space-y-3">
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-accent rounded-full" />
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span>Unlock your personalized learning path</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" />
              <span>Optional profile photo (max 300KB)</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            disabled={isSubmitting}
          />
          <div className="space-y-1">
            <Input
              value={contactNumber}
              onChange={(e) => {
                setContactNumber(e.target.value);
                if (e.target.value && !e.target.value.startsWith("0")) {
                  setContactError("Contact number must start with 0");
                } else {
                  setContactError("");
                }
              }}
              placeholder="0XXXXXXXXXX"
              disabled={isSubmitting}
              className={contactError ? "border-destructive" : ""}
            />
            {contactError && (
              <p className="text-xs text-destructive">{contactError}</p>
            )}
          </div>
          <div className="space-y-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => !isSubmitting && onClose?.()}
            disabled={isSubmitting}
          >
            Not now
          </Button>
          <Button
            onClick={submit}
            disabled={!canSubmit || isSubmitting}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
