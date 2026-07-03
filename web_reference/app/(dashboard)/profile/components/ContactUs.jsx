"use client";
import { motion } from "framer-motion";
import { ChevronLeft, Headphones, MessageCircle, Globe, Facebook, Twitter, Instagram } from "lucide-react";

export default function ContactUsPage({ onBack }) {
  const contactMethods = [
    {
      icon: Headphones,
      title: "Customer Service",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Globe,
      title: "Website",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Facebook,
      title: "Facebook",
      color: "from-blue-600 to-blue-700"
    },
    {
      icon: Twitter,
      title: "Twitter",
      color: "from-sky-500 to-sky-600"
    },
    {
      icon: Instagram,
      title: "Instagram",
      color: "from-pink-500 to-rose-500"
    },
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
            <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            className="px-4 py-2 rounded-lg font-medium bg-muted/30 text-muted-foreground hover:bg-muted/50 transition-all"
          >
            FAQ
          </button>
          <button
            className="px-4 py-2 rounded-lg font-medium bg-accent text-accent-foreground transition-all"
          >
            Contact us
          </button>
        </div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contactMethods.map((method, index) => {
            const IconComponent = method.icon;
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="flex items-center gap-4 p-5 bg-muted/20 rounded-xl border border-border/30 hover:bg-muted/50 hover:border-accent/50 transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <span className="text-lg font-semibold text-foreground">{method.title}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}