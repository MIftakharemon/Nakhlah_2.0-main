import { motion } from "framer-motion";

export const Mascot = ({
  mood = "happy",
  size = "md",
  className = "",
  message,
}) => {
  const sizeMap = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 100,
    xxl: 128,
    xxxl: 160,
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  const getAccessory = () => {
    switch (mood) {
      case "cool":
        return (
          <motion.g
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Sunglasses */}
            <rect x="22" y="32" width="16" height="8" rx="2" fill="#1a1a2e" />
            <rect x="42" y="32" width="16" height="8" rx="2" fill="#1a1a2e" />
            <rect x="38" y="34" width="4" height="3" fill="#1a1a2e" />
          </motion.g>
        );
      case "excited":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {/* Sparkles around */}
            <motion.path
              d="M15 20 L18 17 L21 20 L18 23 Z"
              fill="#FFD700"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
              d="M60 15 L63 12 L66 15 L63 18 Z"
              fill="#FFD700"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
          </motion.g>
        );
      case "proud":
        return (
          <motion.g
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {/* Crown */}
            <path
              d="M25 12 L30 22 L35 14 L40 22 L45 14 L50 22 L55 12 L55 26 L25 26 Z"
              fill="#FFD700"
            />
            <circle cx="30" cy="18" r="2" fill="#E11D48" />
            <circle cx="40" cy="15" r="2" fill="#3B82F6" />
            <circle cx="50" cy="18" r="2" fill="#10B981" />
          </motion.g>
        );
      case "sleeping":
        return (
          <motion.g
            animate={{ y: [-2, -8], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          >
            <text x="58" y="35" fill="#6B7280" fontSize="12" fontWeight="bold">
              Z
            </text>
            <text x="65" y="28" fill="#6B7280" fontSize="10" fontWeight="bold">
              z
            </text>
            <text x="70" y="22" fill="#6B7280" fontSize="8" fontWeight="bold">
              z
            </text>
          </motion.g>
        );
      case "surprised":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <text x="55" y="25" fill="#FFD700" fontSize="16" fontWeight="bold">
              !
            </text>
          </motion.g>
        );
      case "thinking":
        return (
          <motion.text
            x="55"
            y="28"
            fill="#6B7280"
            fontSize="14"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ?
          </motion.text>
        );

      case "celebrating":
        return (
          <motion.circle
            cx="40"
            cy="18"
            r="6"
            fill="#FFD700"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        );

      case "encouraging":
        return (
          <motion.text
            x="58"
            y="30"
            fontSize="12"
            fill="#FDA4AF"
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            🔥
          </motion.text>
        );

      default:
        return null;
    }
  };

  const getEyes = () => {
    if (mood === "cool") return null;

    if (mood === "sleeping") {
      return (
        <>
          <motion.path
            d="M24 55 Q30 50 36 55"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <motion.path
            d="M44 55 Q50 50 56 55"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    }

    if (mood === "sad") {
      return (
        <>
          <motion.ellipse cx="30" cy="55" rx="6" ry="7" fill="white" />
          <motion.ellipse cx="50" cy="55" rx="6" ry="7" fill="white" />
          <motion.circle cx="31" cy="58" r="3.5" fill="#1a1a2e" />
          <motion.circle cx="51" cy="58" r="3.5" fill="#1a1a2e" />
          <circle cx="32" cy="56" r="1.5" fill="white" />
          <circle cx="52" cy="56" r="1.5" fill="white" />
          {/* Sad eyebrows */}
          <path
            d="M24 48 Q30 52 36 50"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M44 50 Q50 52 56 48"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tear */}
          <motion.ellipse
            cx="36"
            cy="65"
            rx="2"
            ry="3"
            fill="#60A5FA"
            animate={{ y: [0, 10], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </>
      );
    }

    if (mood === "surprised") {
      return (
        <>
          <motion.ellipse
            cx="30"
            cy="55"
            rx="8"
            ry="9"
            fill="white"
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          <motion.ellipse
            cx="50"
            cy="55"
            rx="8"
            ry="9"
            fill="white"
            animate={{ scaleY: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          />
          <motion.circle cx="31" cy="56" r="4" fill="#1a1a2e" />
          <motion.circle cx="51" cy="56" r="4" fill="#1a1a2e" />
          <circle cx="32" cy="54" r="1.5" fill="white" />
          <circle cx="52" cy="54" r="1.5" fill="white" />
        </>
      );
    }

    if (mood === "focused") {
      return (
        <>
          {/* Narrow eyes */}
          <motion.ellipse cx="30" cy="56" rx="6" ry="4" fill="white" />
          <motion.ellipse cx="50" cy="56" rx="6" ry="4" fill="white" />

          {/* Pupils – very still */}
          <circle cx="31" cy="56" r="2.5" fill="#1a1a2e" />
          <circle cx="51" cy="56" r="2.5" fill="#1a1a2e" />

          {/* Focused eyebrows */}
          <path
            d="M24 50 Q30 48 36 50"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M44 50 Q50 48 56 50"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    }

    if (mood === "encouraging") {
      return (
        <>
          <motion.ellipse cx="30" cy="55" rx="6" ry="7" fill="white" />
          <motion.ellipse cx="50" cy="55" rx="6" ry="7" fill="white" />

          <motion.circle
            cx="31"
            cy="56"
            r="3"
            fill="#1a1a2e"
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <motion.circle
            cx="51"
            cy="56"
            r="3"
            fill="#1a1a2e"
            animate={{ y: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />

          {/* Soft eyebrows */}
          <path
            d="M24 50 Q30 46 36 50"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M44 50 Q50 46 56 50"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      );
    }

    return (
      <>
        <motion.ellipse
          cx="30"
          cy="55"
          rx="6"
          ry="7"
          fill="white"
          initial={{ scaleY: 0.1 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.1 }}
        />
        <motion.ellipse
          cx="50"
          cy="55"
          rx="6"
          ry="7"
          fill="white"
          initial={{ scaleY: 0.1 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.15 }}
        />
        <motion.circle
          cx="31"
          cy="56"
          r="3.5"
          fill="#1a1a2e"
          animate={{ y: mood === "thinking" ? [-1, 1, -1] : 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <motion.circle
          cx="51"
          cy="56"
          r="3.5"
          fill="#1a1a2e"
          animate={{ y: mood === "thinking" ? [-1, 1, -1] : 0 }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        {/* Eye shine */}
        <circle cx="32" cy="54" r="1.5" fill="white" />
        <circle cx="52" cy="54" r="1.5" fill="white" />
      </>
    );
  };

  const getMouth = () => {
    switch (mood) {
      case "happy":
        return (
          <motion.path
            d="M32 70 Q40 78 48 70"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3 }}
          />
        );
      case "excited":
        return (
          <motion.ellipse
            cx="40"
            cy="72"
            rx="8"
            ry="6"
            fill="#1a1a2e"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          />
        );
      case "cool":
        return (
          <motion.path
            d="M34 72 L46 72"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
        );
      case "thinking":
        return (
          <motion.path
            d="M35 72 Q40 68 45 72"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "sad":
        return (
          <motion.path
            d="M32 75 Q40 68 48 75"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "surprised":
        return (
          <motion.ellipse
            cx="40"
            cy="73"
            rx="5"
            ry="7"
            fill="#1a1a2e"
            animate={{ scaleY: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        );
      case "sleeping":
        return (
          <motion.path
            d="M36 72 Q40 74 44 72"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "proud":
        return (
          <motion.path
            d="M30 70 Q40 80 50 70"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "encouraging":
        return (
          <motion.path
            d="M30 70 Q40 76 50 70"
            stroke="#1a1a2e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        );

      case "focused":
        return (
          <motion.path
            d="M34 72 L46 72"
            stroke="#1a1a2e"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );

      default:
        return null;
    }
  };

  const getBlush = () => {
    if (mood === "excited" || mood === "happy" || mood === "proud") {
      return (
        <>
          <ellipse cx="20" cy="65" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
          <ellipse cx="60" cy="65" rx="5" ry="3" fill="#FDA4AF" opacity="0.6" />
        </>
      );
    }
    return null;
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.div
        className="mascot-float"
        style={{ width: dimensions, height: dimensions * 1.3 }}
        animate={{
          rotate: mood === "excited" ? [-3, 3, -3] : 0,
          scale: mood === "focused" ? [1, 1.015, 1] : 1,
        }}
        transition={{
          repeat: Infinity,
          duration: mood === "focused" ? 2.5 : 0.5,
        }}
      >
        <svg
          viewBox="0 0 80 104"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Drop shadow */}
          <ellipse cx="40" cy="98" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />

          {/* Body - Water drop shape */}
          <motion.path
            d="M40 8 C55 28 68 45 68 62 C68 78 55 90 40 90 C25 90 12 78 12 62 C12 45 25 28 40 8Z"
            fill="url(#mascotGradient)"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          {/* Highlight */}
          <ellipse
            cx="28"
            cy="45"
            rx="8"
            ry="12"
            fill="rgba(255,255,255,0.3)"
          />

          {/* Party hat for excited mood */}
          {mood === "excited" && (
            <motion.g
              initial={{ y: -10, rotate: -15, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <path d="M40 0 L50 25 L30 25 Z" fill="#7C3AED" />
              <circle cx="40" cy="0" r="4" fill="#FFD700" />
              <rect x="33" y="12" width="3" height="3" rx="1" fill="#FFD700" />
              <rect x="44" y="16" width="3" height="3" rx="1" fill="#10B981" />
            </motion.g>
          )}

          {/* Eyes */}
          {getEyes()}

          {getAccessory()}

          {/* Blush */}
          {getBlush()}

          {/* Mouth */}
          {getMouth()}

          {/* Arms */}
          <motion.ellipse
            cx="8"
            cy="65"
            rx="6"
            ry="10"
            fill="url(#mascotGradient)"
            animate={{ rotate: mood === "excited" ? [0, 15, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{ transformOrigin: "14px 65px" }}
          />
          <motion.ellipse
            cx="72"
            cy="65"
            rx="6"
            ry="10"
            fill="url(#mascotGradient)"
            animate={{ rotate: mood === "excited" ? [0, -15, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            style={{ transformOrigin: "66px 65px" }}
          />

          <defs>
            <linearGradient
              id="mascotGradient"
              x1="40"
              y1="8"
              x2="40"
              y2="90"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="hsl(263, 70%, 70%)" />
              <stop offset="100%" stopColor="hsl(263, 70%, 58%)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-3 relative"
        >
          <div className="bg-card border-2 border-border rounded-2xl px-4 py-2 shadow-md max-w-[200px]">
            <p className="text-sm font-semibold text-foreground text-center">
              {message}
            </p>
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-l-2 border-t-2 border-border rotate-45" />
        </motion.div>
      )}
    </div>
  );
};
