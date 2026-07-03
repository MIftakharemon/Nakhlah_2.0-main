"use client";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export default function NotificationSettingsPage({ onBack }) {
  const [notifications, setNotifications] = useState({
    notification: true,
    payment: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    { key: "notification", label: "Notification" },
    { key: "payment", label: "Payment" },
  ];

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
            <h1 className="text-2xl font-bold text-foreground">Notification</h1>
          </div>
        </div>

        {/* Notification List */}
        <div className="space-y-1">
          {notificationItems.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-all rounded-lg"
            >
              <span className="text-foreground font-medium">{item.label}</span>
              <button
                onClick={() => toggleNotification(item.key)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notifications[item.key] ? "bg-accent" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    notifications[item.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
