import { motion } from "framer-motion";
import { ChevronLeft, Camera, Calendar, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { updateMyProfile } from "@/services/api/auth";
import { toast } from "@/components/nakhlah/Toast";

export default function EditProfilePage({
  onBack,
  currentUser,
  profileData,
  onProfileUpdated,
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    country: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      fullName: profileData?.fullName || prev.fullName,
      phoneNumber: profileData?.contactNumber || "",
      email: currentUser?.email || profileData?.user?.email || prev.email,
      country: profileData?.onboardInfo?.country || "",
    }));
  }, [currentUser, profileData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!isSessionValid(session)) {
      toast.error("Session not found. Please login again.");
      return;
    }

    const token = getSessionToken(session);
    if (!token) {
      toast.error("Access token missing. Please login again.");
      return;
    }

    setIsSubmitting(true);
    const result = await updateMyProfile(
      {
        fullName: formData.fullName,
        contactNumber: formData.phoneNumber,
        onboardInfo: {
          ...(profileData?.onboardInfo || {}),
          country: formData.country,
        },
      },
      null,
      token,
    );
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Failed to update profile");
      return;
    }

    if (onProfileUpdated) {
      onProfileUpdated(result.profile);
    }

    toast.success("Profile updated successfully");
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Personal Info
            </h1>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
              AA
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all">
              <Camera className="w-4 h-4" />
            </button>
            {/* <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-palm-green border-2 border-card flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div> */}
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Country
            </label>
            <div className="relative">
              <select
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="w-full bg-gradient-accent hover:bg-gradient-accent/90 text-accent-foreground py-6 text-lg font-semibold"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
