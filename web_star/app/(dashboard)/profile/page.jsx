"use client";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationSettingsPage from "./components/NotificationSettings";
import AccessibilitySettingsPage from "./components/AccessibilitySettings";
import SecuritySettingsPage from "./components/SecuritySettings";
import FindFriendsPage from "./components/FindFriends";
import HelpCenterPage from "./components/HelpCenter";
import ContactUsPage from "./components/ContactUs";
import AllAchievementsPage from "./components/AllAchievements";
import TermsAndConditionsPage from "./components/TermsAndConditions";
import PrivacyPolicyPage from "./components/PrivacyPolicy";
import LearningTipsGuidesPage from "./components/LearningTipsGuides";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import EditProfilePage from "./components/EditProfile";
import FollowersPage from "./components/Followers";
import FollowingPage from "./components/Following";
import ShareProfileDrawer from "./components/ShareProfileDrawer";
import GeneralSettingsPage from "./components/GeneralSettings";
import AboutNakhlahPage from "./components/AboutNakhlah";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSessionToken, isSessionValid } from "@/lib/authUtils";
import { getUserKey } from "@/lib/userKey";
import { useDailyQuestStore } from "@/stores/useDailyQuestStore";
import {
  fetchCurrentUser,
  fetchMyProfile,
  fetchQuestionnaireAchievements,
} from "@/services/api";

const VALID_VIEWS = new Set([
  "profile",
  "settings",
  "edit-profile",
  "followers",
  "following",
  "all-achievements",
  "notification",
  "accessibility",
  "security",
  "find-friends",
  "help-center",
  "contact-us",
  "general",
  "about-nakhlah",
  "terms-and-conditions",
  "privacy-policy",
  "learning-tips",
  "payment",
]);

function ProfileAndSettingsContent() {
  const [activeView, setActiveView] = useState("profile");
  const [showShareDrawer, setShowShareDrawer] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [achievementsData, setAchievementsData] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimQuestIfAvailable = useDailyQuestStore(
    (store) => store.claimQuestIfAvailable,
  );

  useEffect(() => {
    const requestedView = searchParams.get("view");
    if (requestedView && VALID_VIEWS.has(requestedView)) {
      setActiveView(requestedView);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadProfile = async () => {
      if (status === "loading") return;
      if (status === "unauthenticated" || !isSessionValid(session)) {
        setIsProfileLoading(false);
        return;
      }

      const token = getSessionToken(session);
      setIsProfileLoading(true);

      const [meResult, profileResult, achievementsResult] = await Promise.all([
        fetchCurrentUser(token),
        fetchMyProfile(token),
        fetchQuestionnaireAchievements(token),
      ]);

      if (meResult.success) {
        setCurrentUser(meResult.user || null);
      }

      if (profileResult.success) {
        setProfileData(profileResult.profile || null);
      }

      if (achievementsResult.success) {
        setAchievementsData(achievementsResult.achievements || []);
      }

      setIsProfileLoading(false);
    };

    loadProfile();
  }, [session, status]);

  const handleProfileUpdated = (updatedProfile) => {
    if (updatedProfile) {
      setProfileData(updatedProfile);
    }
  };

  const handleNavigate = (view) => {
    if (view === "share-profile") {
      setShowShareDrawer(true);
      const token = getSessionToken(session);
      if (token && isSessionValid(session)) {
        void claimQuestIfAvailable({
          token,
          userKey: getUserKey(session),
          questKey: "shareTheApp",
        });
      }
    } else if (view === "payment") {
      setActiveView("profile");
      router.push("/store");
    } else {
      setActiveView(view);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case "profile":
        return (
          <ProfilePage
            onNavigate={handleNavigate}
            currentUser={currentUser}
            profileData={profileData}
            achievementsData={achievementsData}
            isLoading={isProfileLoading}
          />
        );
      case "settings":
        return (
          <SettingsPage
            onBack={() => setActiveView("profile")}
            onNavigate={handleNavigate}
          />
        );
      case "edit-profile":
        return (
          <EditProfilePage
            onBack={() => setActiveView("profile")}
            currentUser={currentUser}
            profileData={profileData}
            onProfileUpdated={handleProfileUpdated}
          />
        );
      case "followers":
        return <FollowersPage onBack={() => setActiveView("profile")} />;
      case "following":
        return <FollowingPage onBack={() => setActiveView("profile")} />;
      case "all-achievements":
        return (
          <AllAchievementsPage
            onBack={() => setActiveView("profile")}
            achievements={achievementsData}
            isLoading={isProfileLoading}
          />
        );
      case "notification":
        return (
          <NotificationSettingsPage onBack={() => setActiveView("settings")} />
        );
      case "accessibility":
        return (
          <AccessibilitySettingsPage onBack={() => setActiveView("settings")} />
        );
      case "security":
        return (
          <SecuritySettingsPage onBack={() => setActiveView("settings")} />
        );
      case "find-friends":
        return <FindFriendsPage onBack={() => setActiveView("settings")} />;
      case "help-center":
        return (
          <HelpCenterPage
            onBack={() => setActiveView("settings")}
            onNavigateContact={() => setActiveView("contact-us")}
            onNavigateLearningTips={() => setActiveView("learning-tips")}
          />
        );
      case "contact-us":
        return <ContactUsPage onBack={() => setActiveView("help-center")} />;
      case "general":
        return <GeneralSettingsPage onBack={() => setActiveView("settings")} />;
      case "about-nakhlah":
        return (
          <AboutNakhlahPage
            onBack={() => setActiveView("settings")}
            onNavigate={handleNavigate}
          />
        );
      case "terms-and-conditions":
        return (
          <TermsAndConditionsPage
            onBack={() => setActiveView("about-nakhlah")}
          />
        );
      case "privacy-policy":
        return (
          <PrivacyPolicyPage onBack={() => setActiveView("about-nakhlah")} />
        );
      case "learning-tips":
        return (
          <LearningTipsGuidesPage onBack={() => setActiveView("help-center")} />
        );
      default:
        return (
          <ProfilePage
            onNavigate={handleNavigate}
            currentUser={currentUser}
            profileData={profileData}
            achievementsData={achievementsData}
            isLoading={isProfileLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 sm:px-5 lg:px-0"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      <ShareProfileDrawer
        open={showShareDrawer}
        onClose={() => setShowShareDrawer(false)}
      />
    </div>
  );
}

export default function ProfileAndSettings() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-background overflow-hidden" />}
    >
      <ProfileAndSettingsContent />
    </Suspense>
  );
}
