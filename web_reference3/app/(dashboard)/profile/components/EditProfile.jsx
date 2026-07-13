import { motion } from "framer-motion";
import {
  Camera,
  ChevronLeft,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Target,
  BookOpen,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import {
  fetchUserOnboardingGlobals,
  updateMyProfile,
} from "@/services/api/auth";
import { toast } from "@/components/nakhlah/Toast";
import { buildApiUrl } from "@/lib/api-config";
import { useProfileStore } from "@/stores/useProfileStore";

const MAX_FILE_SIZE = 300 * 1024;

export default function EditProfilePage({
  onBack,
  currentUser,
  profileData,
  onProfileUpdated,
}) {
  const [localChanges, setLocalChanges] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [contactError, setContactError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [onboardingOptions, setOnboardingOptions] = useState(null);
  const { data: session } = useSession();
  const previousPreviewUrl = useRef("");

  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      const result = await fetchUserOnboardingGlobals();
      if (result.success) {
        setOnboardingOptions(result.data);
      }
      setIsLoadingOptions(false);
    };
    loadOptions();
  }, []);

  const initialFormData = useMemo(() => {
    if (!profileData || !onboardingOptions) {
      return {
        fullName: "",
        contactNumber: "",
        country: "",
        age: "",
        purpose: "",
        goalTime: 10,
        userSource: "",
        languageStrength: "",
      };
    }

    const { countryList = [] } = onboardingOptions?.Country || {};
    const { ageList = [] } = onboardingOptions?.age || {};
    const { purposeList = [] } = onboardingOptions?.purpose || {};
    const { goalList = [] } = onboardingOptions?.Goal || {};
    const { sourceList = [] } = onboardingOptions?.userSource || {};
    const { strengthsList = [] } = onboardingOptions?.languageStrength || {};

    const onboardInfo = profileData?.onboardInfo || {};
    const savedUserSource = String(onboardInfo.userSource || "").toLowerCase();
    const sourceMatch = sourceList.find(
      (s) => String(s.sourceName || "").toLowerCase() === savedUserSource,
    );

    const savedGoal = Number(onboardInfo.goalTime) || 10;
    const goalMatch = goalList.find((g) => Number(g.goalTime) === savedGoal);

    return {
      fullName: profileData?.fullName || "",
      contactNumber: profileData?.contactNumber || "",
      country: onboardInfo.country || "",
      age: onboardInfo.age || "",
      purpose: onboardInfo.purpose || "",
      goalTime: goalMatch ? Number(goalMatch.goalTime) : savedGoal,
      userSource: sourceMatch ? sourceMatch.sourceName : savedUserSource,
      languageStrength: onboardInfo.languageStrength || "",
    };
  }, [currentUser, profileData, onboardingOptions]);

  const formData = useMemo(
    () => ({ ...initialFormData, ...localChanges }),
    [initialFormData, localChanges],
  );

  useEffect(() => {
    return () => {
      if (previousPreviewUrl.current) {
        URL.revokeObjectURL(previousPreviewUrl.current);
      }
    };
  }, []);

  const handleChange = (field, value) => {
    setLocalChanges((prev) => ({ ...prev, [field]: value }));
    if (field === "contactNumber") {
      setContactError("");
    }
  };

  const getProfileImageUrl = () => {
    if (picturePreview) return picturePreview;
    const url =
      profileData?.profilePicture?.url || currentUser?.socialMediaPictureUrl;
    return url ? buildApiUrl(url) : "";
  };

  const getInitials = () => {
    const source = formData.fullName?.trim() || formData.email || "User";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setProfilePicture(null);
      setPicturePreview("");
      if (previousPreviewUrl.current) {
        URL.revokeObjectURL(previousPreviewUrl.current);
        previousPreviewUrl.current = "";
      }
      setFileError("");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setProfilePicture(null);
      setPicturePreview("");
      if (previousPreviewUrl.current) {
        URL.revokeObjectURL(previousPreviewUrl.current);
        previousPreviewUrl.current = "";
      }
      setFileError("Profile picture must be below 300KB.");
      return;
    }
    if (previousPreviewUrl.current) {
      URL.revokeObjectURL(previousPreviewUrl.current);
    }
    const url = URL.createObjectURL(file);
    previousPreviewUrl.current = url;
    setFileError("");
    setPicturePreview(url);
    setProfilePicture(file);
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

    if (
      !formData.fullName.trim() ||
      !formData.contactNumber.trim() ||
      contactError ||
      fileError
    ) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    const sourceName = formData.userSource;
    const result = await updateMyProfile(
      {
        fullName: formData.fullName.trim(),
        contactNumber: formData.contactNumber.trim(),
        onboardInfo: {
          age: formData.age,
          country: formData.country,
          purpose: formData.purpose,
          goalTime: formData.goalTime,
          userSource: sourceName ? sourceName.toLowerCase() : "",
          languageStrength: formData.languageStrength,
        },
      },
      profilePicture,
      token,
    );
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Failed to update profile");
      return;
    }

    const refreshResult = await useProfileStore
      .getState()
      .fetchMyProfile(
        token,
        true,
        session?.user?.id || currentUser?.id || "guest",
      );

    if (onProfileUpdated) {
      onProfileUpdated(refreshResult?.profile || result.profile);
    }

    toast.success("Profile updated successfully");
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
              {getProfileImageUrl() ? (
                <img
                  src={getProfileImageUrl()}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials()
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg hover:bg-accent/90 transition-all cursor-pointer">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
        {profilePicture && (
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ready to upload
            </span>
            <span className="block text-xs text-muted-foreground truncate mt-1">
              {profilePicture.name}
            </span>
          </div>
        )}
        {fileError && (
          <p className="text-center text-xs text-destructive mb-4">
            {fileError}
          </p>
        )}

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
              value={formData.contactNumber}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground"
            />
            {contactError && (
              <p className="text-xs text-destructive mt-1">{contactError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Country
            </label>
            <div className="relative">
              <select
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value="">Select country</option>
                {(onboardingOptions?.Country?.countryList || []).map(
                  (option) => (
                    <option key={option.id} value={option.countryName}>
                      {option.countryName}
                    </option>
                  ),
                )}
              </select>
              <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Age Range
            </label>
            <div className="relative">
              <select
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value="">Select age</option>
                {(onboardingOptions?.age?.ageList || []).map((option) => (
                  <option key={option.id} value={option.ageTitle}>
                    {option.ageTitle}
                  </option>
                ))}
              </select>
              <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Language Strength
            </label>
            <div className="relative">
              <select
                value={formData.languageStrength}
                onChange={(e) =>
                  handleChange("languageStrength", e.target.value)
                }
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value="">Select language strength</option>
                {(onboardingOptions?.languageStrength?.strengthsList || []).map(
                  (option) => (
                    <option key={option.id} value={option.strengthsTitle}>
                      {option.strengthsTitle}
                    </option>
                  ),
                )}
              </select>
              <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Daily Study Target
            </label>
            <div className="relative">
              <select
                value={formData.goalTime}
                onChange={(e) =>
                  handleChange("goalTime", Number(e.target.value))
                }
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value={0}>Select daily goal</option>
                {(onboardingOptions?.Goal?.goalList || []).map((option) => (
                  <option key={option.id} value={Number(option.goalTime)}>
                    {option.goalTime} minutes
                  </option>
                ))}
              </select>
              <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Purpose
            </label>
            <div className="relative">
              <select
                value={formData.purpose}
                onChange={(e) => handleChange("purpose", e.target.value)}
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value="">Select purpose</option>
                {(onboardingOptions?.purpose?.purposeList || []).map(
                  (option) => (
                    <option key={option.id} value={option.purposeTitle}>
                      {option.purposeTitle}
                    </option>
                  ),
                )}
              </select>
              <Target className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              How did you learn about Nakhlah
            </label>
            <div className="relative">
              <select
                value={formData.userSource}
                onChange={(e) => handleChange("userSource", e.target.value)}
                disabled={isLoadingOptions}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent text-foreground appearance-none"
              >
                <option value="">Select source</option>
                {(onboardingOptions?.userSource?.sourceList || []).map(
                  (option) => (
                    <option key={option.id} value={option.sourceName}>
                      {option.sourceName}
                    </option>
                  ),
                )}
              </select>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <Button
            onClick={handleUpdate}
            disabled={
              isSubmitting ||
              isLoadingOptions ||
              !formData.fullName.trim() ||
              !formData.contactNumber.trim() ||
              !!contactError ||
              !!fileError
            }
            className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white py-6 text-lg font-semibold"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
