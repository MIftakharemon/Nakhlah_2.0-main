"use client";
import { motion } from "framer-motion";
import { Edit, Share2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!API_URL) return url;
  return `${API_URL}${url}`;
};

const getInitials = (fullName, email) => {
  const source = fullName || email || "User";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
};

const formatJoinedDate = (dateInput) => {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function HeaderSection({
  stats,
  onNavigateSettings,
  onNavigateEdit,
  onShare,
  currentUser,
  profileData,
  isLoading,
}) {
  const fullName = profileData?.fullName || "No Name Set";
  const email =
    currentUser?.email || profileData?.user?.email || "No Email Set";
  const joined = formatJoinedDate(
    currentUser?.createdAt || profileData?.createdAt,
  );
  const avatarUrl = getMediaUrl(
    profileData?.profilePicture?.url || currentUser?.socialMediaPictureUrl,
  );
  const initials = getInitials(fullName, email);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary via-accent to-palm-green">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/80 to-accent/80 overflow-hidden flex items-center justify-center text-3xl lg:text-4xl font-bold text-primary-foreground">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>
            {/* <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-base lg:text-lg shadow-xl border-4 border-background lg:border-card">
              {profileData?.learnerStreak?.currentStreak ?? 0}
            </div> */}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              {isLoading ? "Loading..." : fullName}
            </h1>
            <p className="text-muted-foreground mb-4">{email}</p>
            <p className="text-sm text-muted-foreground">
              {joined ? `Joined on ${joined}` : ""}
            </p>

            {/* Action Buttons - Only on Desktop */}
            <div className="hidden lg:flex flex-wrap gap-3 mt-6">
              <Button
                onClick={onNavigateEdit}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                onClick={onShare}
                variant="outline"
                className="border-border hover:bg-muted"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={onNavigateSettings}
                variant="outline"
                size="icon"
                className="border-border hover:bg-muted"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="flex justify-center gap-6 lg:gap-12 w-full lg:w-auto">
            {stats.map((stat, index) => (
              <button
                key={index}
                onClick={stat.onClick}
                className={`text-center ${stat.onClick ? 'hover:scale-105 transition-transform cursor-pointer' : 'cursor-default'}`}
              >
                <div className="text-xl lg:text-2xl font-bold text-accent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </button>
            ))}
          </div> */}
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex lg:hidden gap-3 mt-6">
          <Button
            onClick={onNavigateEdit}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={onShare}
            variant="outline"
            className="flex-1 border-border hover:bg-muted"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={onNavigateSettings}
            variant="outline"
            size="icon"
            className="border-border hover:bg-muted"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
