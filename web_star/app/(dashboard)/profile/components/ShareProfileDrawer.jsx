"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FaWhatsapp, FaTwitter, FaFacebook, FaEnvelope } from "react-icons/fa";

export default function ShareProfileDrawer({ open, onClose }) {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      icon: FaWhatsapp,
      label: "WhatsApp",
      color: "bg-green-500",
      action: () => {},
    },
    {
      icon: FaEnvelope,
      label: "Email",
      color: "bg-blue-500",
      action: () => {},
    },
    {
      icon: FaTwitter,
      label: "Twitter",
      color: "bg-sky-500",
      action: () => {},
    },
    {
      icon: FaFacebook,
      label: "Facebook",
      color: "bg-blue-600",
      action: () => {},
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://app.com/profile/andrew.ainsley");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  Share Profile
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Share Options */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  Share via
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {shareOptions.map((option, index) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        key={index}
                        onClick={option.action}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Copy Link */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  Profile Link
                </h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 px-4 py-3 bg-muted/30 rounded-xl border border-border text-sm text-muted-foreground truncate">
                    https://app.com/profile/andrew.ainsley
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    className="px-4 bg-gradient-accent hover:bg-gradient-accent/90 text-white transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
