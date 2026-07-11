import HeaderSection from "./components/HeaderSection";
import StatisticsGrid from "./components/StatisticsGrid";
import XPChart from "./components/XPChart";
import AchievementsList from "./components/AchievementsList";
import MotivationCard from "./components/MotivationCard";
import QuickStats from "./components/QuickStats";
import ShareProfile from "./components/ShareProfile";
import SubscriptionCard from "./components/SubscriptionCard";
import RefillLivesCard from "./components/RefillLivesCard";

export default function ProfilePage({
  onNavigate,
  currentUser,
  profileData,
  achievementsData,
  isLoading,
}) {
  const dynamicStats = [
    {
      label: "Followers",
      value: "1,536",
      onClick: () => onNavigate("followers"),
    },
    {
      label: "Following",
      value: "195",
      onClick: () => onNavigate("following"),
    },
    {
      label: "Activity Injaz",
      value: `${profileData?.gamificationStock?.injazStock ?? 0}`,
    },
  ];

  const stats = [
    {
      label: "Followers",
      value: "1,536",
      onClick: () => onNavigate("followers"),
    },
    {
      label: "Following",
      value: "195",
      onClick: () => onNavigate("following"),
    },
    { label: "Activity Injaz", value: "15,274" },
  ];

  const resolvedStats = profileData ? dynamicStats : stats;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <HeaderSection
            stats={resolvedStats}
            onNavigateSettings={() => onNavigate("settings")}
            onNavigateEdit={() => onNavigate("edit-profile")}
            onShare={() => onNavigate("share-profile")}
            currentUser={currentUser}
            profileData={profileData}
            isLoading={isLoading}
          />
          <StatisticsGrid
            profileData={profileData}
            achievementsData={achievementsData}
          />
          <XPChart />
          <AchievementsList
            onViewAll={() => onNavigate("all-achievements")}
            achievements={achievementsData}
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar - Only on Desktop */}
        <div className="hidden lg:block space-y-8">
          <MotivationCard />
          <QuickStats profileData={profileData} />
          <ShareProfile onShare={() => onNavigate("share-profile")} />
          <SubscriptionCard />
          <RefillLivesCard />
        </div>
      </div>

      {/* Mobile Sidebar - appears below main content */}
      <div className="lg:hidden space-y-6 mt-4 pb-6">
        <QuickStats profileData={profileData} />
        <ShareProfile onShare={() => onNavigate("share-profile")} />
        <SubscriptionCard />
        <RefillLivesCard />
      </div>
    </div>
  );
}
