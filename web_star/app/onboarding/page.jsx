"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProgressSteps } from "@/components/nakhlah/ProgressSteps";
import { ThemeToggle } from "@/components/nakhlah/ThemeToggle";
import { Mascot } from "@/components/nakhlah/Mascot";
import { ProficiencyStep } from "@/components/nakhlah/onboarding/ProficiencyStep";
import { GoalStep } from "@/components/nakhlah/onboarding/GoalStep";
import { PurposeStep } from "@/components/nakhlah/onboarding/PurposeStep";
import { CountryStep } from "@/components/nakhlah/onboarding/CountryStep";
import { UserSourceStep } from "@/components/nakhlah/onboarding/UserSourceStep";
import { InterestsStep } from "@/components/nakhlah/onboarding/InterestsStep";
import { ProfileInfoStep } from "@/components/nakhlah/onboarding/ProfileInfoStep";
import { AgeStep } from "@/components/nakhlah/onboarding/AgeStep";
import { AccountStep } from "@/components/nakhlah/onboarding/AccountStep";
import { CompletionStep } from "@/components/nakhlah/onboarding/CompletionStep";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/authUtils";
import {
  createUserProfile,
  fetchCurrentUser,
  fetchMyProfile,
  fetchUserOnboardingGlobals,
  refreshAccessToken,
  updateMyProfile,
} from "@/services/api/auth";
import { signIn } from "next-auth/react";
import { toast } from "@/components/nakhlah/Toast";
import { buildApiUrl } from "@/lib/api-config";

const steps = [
  { id: 1, label: "Strength" },
  { id: 2, label: "Goal" },
  { id: 3, label: "Purpose" },
  { id: 4, label: "Country" },
  { id: 5, label: "Source" },
  { id: 6, label: "Interests" },
  { id: 7, label: "Profile" },
  { id: 8, label: "Age" },
  { id: 9, label: "Account" },
  { id: 10, label: "Ready!" },
];

const DEFAULT_PROFILE_IMAGE = "https://github.com/shadcn.png";

const mediaCandidates = [
  "strengthsMedia",
  "strengthMedia",
  "goalMedia",
  "goalPicture",
  "purposeMedia",
  "purposePicture",
  "countryMedia",
  "countryPicture",
  "sourcePicture",
  "sourceMedia",
  "interestPicture",
  "interestMedia",
  "media",
  "image",
  "picture",
  "icon",
  "thumbnail",
  "asset",
];

const getMediaObject = (item, preferredKeys = []) => {
  if (!item || typeof item !== "object") return null;

  const keysToCheck = [...preferredKeys, ...mediaCandidates];
  for (const key of keysToCheck) {
    const value = item?.[key];
    if (!value) continue;
    if (typeof value === "string") return { url: value };
    if (value?.url) return value;
  }

  if (Array.isArray(item?.media)) {
    const mediaEntry = item.media.find(
      (entry) => entry?.url || entry?.media?.url,
    );
    if (mediaEntry?.url) return mediaEntry;
    if (mediaEntry?.media?.url) return mediaEntry.media;
  }

  if (item?.url) {
    return { url: item.url, alt: item.alt };
  }

  return null;
};

const normalizeOnboardingData = (data) => {
  if (!data || typeof data !== "object") return data;

  const normalizedLanguageStrengthList = (
    data?.languageStrength?.strengthsList || []
  ).map((entry) => ({
    ...entry,
    strengthsMedia: getMediaObject(entry, ["strengthsMedia", "strengthMedia"]),
  }));

  const normalizedGoalList = (
    data?.Goal?.goalList ||
    data?.goal?.goalList ||
    []
  ).map((entry) => ({
    ...entry,
    goalMedia: getMediaObject(entry, ["goalMedia", "goalPicture"]),
  }));

  const normalizedPurposeList = (data?.purpose?.purposeList || []).map(
    (entry) => ({
      ...entry,
      purposeMedia: getMediaObject(entry, ["purposeMedia", "purposePicture"]),
    }),
  );

  const normalizedCountryList = (
    data?.Country?.countryList ||
    data?.country?.countryList ||
    []
  ).map((entry) => ({
    ...entry,
    countryMedia: getMediaObject(entry, ["countryMedia", "countryPicture"]),
  }));

  const normalizedSourceList = (data?.userSource?.sourceList || []).map(
    (entry) => ({
      ...entry,
      sourcePicture: getMediaObject(entry, ["sourcePicture", "sourceMedia"]),
    }),
  );

  const normalizedInterestList = (data?.interests?.interestList || []).map(
    (entry) => ({
      ...entry,
      interestPicture: getMediaObject(entry, [
        "interestPicture",
        "interestMedia",
      ]),
    }),
  );

  return {
    ...data,
    languageStrength: {
      ...(data?.languageStrength || {}),
      strengthsList: normalizedLanguageStrengthList,
    },
    Goal: {
      ...(data?.Goal || data?.goal || {}),
      goalList: normalizedGoalList,
    },
    purpose: {
      ...(data?.purpose || {}),
      purposeList: normalizedPurposeList,
    },
    Country: {
      ...(data?.Country || data?.country || {}),
      countryList: normalizedCountryList,
    },
    userSource: {
      ...(data?.userSource || {}),
      sourceList: normalizedSourceList,
    },
    interests: {
      ...(data?.interests || {}),
      interestList: normalizedInterestList,
    },
  };
};

export default function Onboarding() {
  const router = useRouter();
  const [isSocialSignup, setIsSocialSignup] = useState(false);
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [proficiencyLevel, setProficiencyLevel] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [purpose, setPurpose] = useState("");
  const [country, setCountry] = useState("");
  const [userSource, setUserSource] = useState("");
  const [interests, setInterests] = useState([]);
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileFileError, setProfileFileError] = useState("");
  const [profileContactError, setProfileContactError] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [onboardingData, setOnboardingData] = useState(null);
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const getMediaUrl = (url) => {
    if (!url) return "";
    return buildApiUrl(url);
  };

  const getActiveAccessToken = async () => {
    const session = await fetch("/api/auth/session")
      .then((res) => res.json())
      .catch(() => null);

    if (session?.accessToken) {
      return session.accessToken;
    }

    if (!session?.user?.id) {
      return null;
    }

    const refreshResult = await refreshAccessToken(session?.accessToken);
    const meResult = await fetchCurrentUser(
      refreshResult?.token || session?.accessToken,
    );

    if (meResult.success && meResult.token) {
      return meResult.token;
    }

    if (refreshResult.success && refreshResult.token) {
      return refreshResult.token;
    }

    return null;
  };

  const loadOnboardingData = async () => {
    setIsLoadingOnboarding(true);
    setLoadingError("");

    let result = await fetchUserOnboardingGlobals();

    if (!result.success) {
      const token = await getActiveAccessToken();
      if (token) {
        result = await fetchUserOnboardingGlobals(token);
      }
    }

    if (!result.success || !result.data) {
      setLoadingError(result.error || "Failed to load onboarding data");
      setIsLoadingOnboarding(false);
      return;
    }

    setOnboardingData(normalizeOnboardingData(result.data));
    setIsLoadingOnboarding(false);
  };

  useEffect(() => {
    loadOnboardingData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    setIsSocialSignup(query.get("social") === "1");
  }, []);

  useEffect(() => {
    if (!isSocialSignup) {
      setIsAuthResolved(true);
      return;
    }

    let cancelled = false;

    const resolveSocialAccess = async () => {
      const token = await getActiveAccessToken();
      if (!token || cancelled) {
        if (!cancelled) setIsAuthResolved(true);
        return;
      }

      const profileResult = await fetchMyProfile(token);
      if (cancelled) return;

      if (profileResult.success && profileResult.profile) {
        router.replace("/");
        return;
      }

      setIsAuthResolved(true);
    };

    resolveSocialAccess();

    return () => {
      cancelled = true;
    };
  }, [isSocialSignup, router]);

  const selectedValues = useMemo(() => {
    const strength = onboardingData?.languageStrength?.strengthsList?.find(
      (item) => item.id === proficiencyLevel,
    );
    const selectedPurpose = onboardingData?.purpose?.purposeList?.find(
      (item) => item.id === purpose,
    );
    const selectedCountry = onboardingData?.Country?.countryList?.find(
      (item) => item.id === country,
    );
    const selectedSource = onboardingData?.userSource?.sourceList?.find(
      (item) => item.id === userSource,
    );
    const selectedAge = onboardingData?.age?.ageList?.find(
      (item) => item.id === age,
    );
    const selectedInterests = onboardingData?.interests?.interestList?.filter(
      (item) => interests.includes(item.id),
    );

    return {
      strength,
      selectedPurpose,
      selectedCountry,
      selectedSource,
      selectedAge,
      selectedInterests,
    };
  }, [
    onboardingData,
    proficiencyLevel,
    purpose,
    country,
    userSource,
    interests,
    age,
  ]);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return proficiencyLevel !== "";
      case 2:
        return dailyGoal !== "";
      case 3:
        return purpose !== "";
      case 4:
        return country !== "";
      case 5:
        return userSource !== "";
      case 6:
        return interests.length > 0;
      case 7:
        return (
          fullName.trim().length > 1 &&
          contactNumber.trim().startsWith("0") &&
          contactNumber.trim().length > 1 &&
          !profileFileError &&
          !profileContactError
        );
      case 8:
        return age !== "";
      case 9:
        return isSocialSignup
          ? true
          : email.trim().includes("@") && password.trim().length >= 6;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (isSocialSignup && currentStep === 8) {
      setCurrentStep(10);
      return;
    }

    if (currentStep === 9) {
      await handleRegistration();
      return;
    }

    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const toggleInterest = (interestId) => {
    setInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId],
    );
  };

  const handleRegistration = async () => {
    if (isSocialSignup) {
      setCurrentStep(10);
      return;
    }

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setIsRegistering(true);

    try {
      const result = await registerUser(email, password);

      if (!result.success) {
        toast.error(result.error || "Registration failed");
        setIsRegistering(false);
        return;
      }

      toast.success("Registration successful!");

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(
          "Registration successful but auto-login failed. Please login manually.",
        );
        setIsRegistering(false);
        return;
      }

      setCurrentStep(10);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleComplete = async () => {
    const token = await getActiveAccessToken();

    if (!token) {
      toast.error("Session not found. Please try logging in again.");
      return;
    }

    const languageStrength = selectedValues.strength?.strengthsTitle || "";

    const profileData = {
      onboardInfo: {
        age: selectedValues.selectedAge?.ageTitle || age.toString(),
        country: selectedValues.selectedCountry?.countryName || "",
        purpose: "",
        goalTime: parseInt(dailyGoal) || 10,
        userSource: (
          selectedValues.selectedSource?.sourceName || ""
        ).toLowerCase(),
        languageStrength,
      },
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      profilePictureUrl: DEFAULT_PROFILE_IMAGE,
    };

    const profileResult = await createUserProfile(profileData, token);

    if (!profileResult.success) {
      toast.error(profileResult.error || "Failed to create profile");
      return;
    }

    if (profilePicture) {
      const pictureResult = await updateMyProfile({}, profilePicture, token);
      if (!pictureResult.success) {
        toast.error(
          pictureResult.error || "Profile created but image upload failed",
        );
      }
    }

    localStorage.setItem(
      "nakhlah_onboarding",
      JSON.stringify({
        proficiencyLevel,
        dailyGoal,
        purpose,
        country,
        userSource,
        interests,
        fullName,
        contactNumber,
        age,
        email,
        completed: true,
      }),
    );
    localStorage.removeItem("nakhlah_profile_prompt_pending");

    // toast.success("Profile created successfully!");
    router.push("/");
    router.refresh();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProficiencyStep
            title={onboardingData?.languageStrength?.strengthsTitleTop}
            levels={onboardingData?.languageStrength?.strengthsList || []}
            selectedLevel={proficiencyLevel}
            onSelect={setProficiencyLevel}
            getMediaUrl={getMediaUrl}
          />
        );
      case 2:
        return (
          <GoalStep
            title={onboardingData?.Goal?.goalTimeTopTitle}
            goals={onboardingData?.Goal?.goalList || []}
            selectedGoal={dailyGoal}
            onSelect={setDailyGoal}
            getMediaUrl={getMediaUrl}
          />
        );
      case 3:
        return (
          <PurposeStep
            title={onboardingData?.purpose?.purposeTitleTop}
            purposes={onboardingData?.purpose?.purposeList || []}
            selectedPurpose={purpose}
            onSelect={setPurpose}
            getMediaUrl={getMediaUrl}
          />
        );
      case 4:
        return (
          <CountryStep
            title={onboardingData?.Country?.countryNameTop}
            countries={onboardingData?.Country?.countryList || []}
            selectedCountry={country}
            onSelect={setCountry}
            getMediaUrl={getMediaUrl}
          />
        );
      case 5:
        return (
          <UserSourceStep
            title={onboardingData?.userSource?.sourceNameTop}
            sources={onboardingData?.userSource?.sourceList || []}
            userSource={userSource}
            onSelect={({ userSource: source }) => {
              if (source !== undefined) setUserSource(source);
            }}
            getMediaUrl={getMediaUrl}
          />
        );
      case 6:
        return (
          <InterestsStep
            title={onboardingData?.interests?.interestTitleTop}
            interests={onboardingData?.interests?.interestList || []}
            selectedInterests={interests}
            onToggle={toggleInterest}
            getMediaUrl={getMediaUrl}
          />
        );
      case 7:
        return (
          <ProfileInfoStep
            fullName={fullName}
            contactNumber={contactNumber}
            profilePicture={profilePicture}
            onChange={(fields) => {
              if (fields.fullName !== undefined) setFullName(fields.fullName);
              if (fields.contactNumber !== undefined)
                setContactNumber(fields.contactNumber);
              if (fields.profilePicture !== undefined)
                setProfilePicture(fields.profilePicture);
              if (fields.fileError !== undefined)
                setProfileFileError(fields.fileError);
              if (fields.contactError !== undefined)
                setProfileContactError(fields.contactError);
            }}
          />
        );
      case 8:
        return (
          <AgeStep
            title={onboardingData?.age?.ageTitleTop || "How old are you?"}
            ages={onboardingData?.age?.ageList || []}
            selectedAge={age}
            onSelect={setAge}
          />
        );
      case 9:
        if (isSocialSignup) return null;
        return (
          <AccountStep
            email={email}
            password={password}
            onChange={(fields) => {
              if (fields.email !== undefined) setEmail(fields.email);
              if (fields.password !== undefined) setPassword(fields.password);
            }}
          />
        );
      case 10:
        return (
          <CompletionStep
            language={"arabic"}
            dailyGoal={dailyGoal}
            quizScore={0}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  if (!isAuthResolved || isLoadingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3 max-w-sm">
          <Mascot mood="happy" size="xxl" className="w-28 h-28 mx-auto" />
          <p className="text-muted-foreground font-medium">
            Preparing your learning path...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🌴</div>
            <span className="text-xl font-bold text-foreground">Nakhlah</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className=" container mx-auto px-4 py-6">
        <div className="max-w-[520px] mx-auto">
          <ProgressSteps steps={steps} currentStep={currentStep} />
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-6 flex items-start justify-center">
        {isLoadingOnboarding ? (
          <div className="w-full max-w-xl mx-auto text-center text-muted-foreground">
            Loading onboarding options...
          </div>
        ) : loadingError ? (
          <div className="w-full max-w-xl mx-auto text-center space-y-4">
            <p className="text-destructive">{loadingError}</p>
            <Button variant="outline" onClick={loadOnboardingData}>
              Retry
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.28 }}
              className="w-full"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="container px-1 py-4 flex items-center justify-between max-w-xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || isRegistering}
            className={cn("gap-2", currentStep === 1 && "invisible")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={
                isLoadingOnboarding ||
                !!loadingError ||
                !canProceed() ||
                isRegistering
              }
              className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
            >
              {isRegistering ? "Creating Account..." : "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
            >
              Start Learning
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
