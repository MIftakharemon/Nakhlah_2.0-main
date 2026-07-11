import { motion } from "framer-motion";
import { ChevronLeft, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FollowersPage({ onBack }) {
  const followers = [
    { 
      name: "Georgette Strobel", 
      username: "@georgette", 
      avatar: "GS", 
      following: false,
      color: "from-accent to-accent"
    },
    { 
      name: "Maraldo Wriganton", 
      username: "@maraldo", 
      avatar: "MW", 
      following: true,
      color: "from-accent to-accent"
    },
    { 
      name: "Freida Varnes", 
      username: "@freida", 
      avatar: "FV", 
      following: false,
      color: "from-accent to-accent"
    },
    { 
      name: "Edgar Torrey", 
      username: "@edgar", 
      avatar: "ET", 
      following: true,
      color: "from-accent to-accent"
    },
    { 
      name: "Annabel Rohan", 
      username: "@annabel", 
      avatar: "AR", 
      following: true,
      color: "from-accent to-accent"
    },
    { 
      name: "Merrill Kervin", 
      username: "@merrill", 
      avatar: "MK", 
      following: false,
      color: "from-accent to-accent"
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
            <h1 className="text-2xl font-bold text-foreground">Followers</h1>
            <p className="text-sm text-muted-foreground">1,536 followers</p>
          </div>
        </div>

        {/* Followers List */}
        <div className="space-y-3">
          {followers.map((follower, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/30 hover:bg-muted/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${follower.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {follower.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{follower.name}</div>
                  <div className="text-sm text-muted-foreground">{follower.username}</div>
                </div>
              </div>
              <Button
                size="sm"
                className={follower.following 
                  ? "bg-muted hover:bg-muted/80 text-foreground border border-border" 
                  : "bg-gradient-accent hover:bg-gradient-accent/90 text-accent-foreground"
                }
              >
                {follower.following ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}