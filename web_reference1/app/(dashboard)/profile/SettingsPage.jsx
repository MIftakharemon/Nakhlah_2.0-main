"use client";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  HelpCircle,
  Info,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage({ onBack, onNavigate }) {
  const router = useRouter();

  const settingsItems = [
    {
      label: "Personal Info",
      icon: User,
      color:
        "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400",
      action: "edit-profile",
    },
    {
      label: "Notification",
      icon: Bell,
      color: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400",
      action: "notification",
    },
    {
      label: "Payment",
      icon: CreditCard,
      color:
        "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400",
      action: "payment",
    },
    {
      label: "Help Center",
      icon: HelpCircle,
      color: "bg-teal-100 text-teal-500 dark:bg-teal-900/30 dark:text-teal-400",
      action: "help-center",
    },
    {
      label: "About Nakhlah",
      icon: Info,
      color:
        "bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400",
      action: "about-nakhlah",
    },
  ];

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center rounded-full hover:bg-muted h-10 w-10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-transparent lg:bg-card rounded-none lg:rounded-2xl shadow-none lg:shadow-lg border-0 lg:border lg:border-border p-0 lg:p-6"
      >
        <div className="space-y-1">
          {settingsItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 dark:hover:bg-muted/50 transition-all group rounded-xl cursor-pointer"
                onClick={() => {
                  if (!item.toggle && item.action) {
                    onNavigate(item.action);
                  }
                }}
              >
                {/* Left side */}
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center transition-colors`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">
                    {item.label}
                  </span>
                </div>

                {/* Right side - toggle or chevron */}
                {!item.toggle && (
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-all rounded-xl group"
          >
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center transition-colors">
              <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <span className="font-medium text-red-500 dark:text-red-400">
              Logout
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
