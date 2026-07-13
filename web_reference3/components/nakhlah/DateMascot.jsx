import { motion } from "framer-motion";
import { useId } from "react";

const petalRingPath = (
  cx,
  cy,
  rx,
  ry,
  petals,
  innerRatio,
  rotationOffset = 0,
) => {
  const step = (Math.PI * 2) / petals;
  const start = -Math.PI / 2 + rotationOffset;
  let d = "";
  for (let i = 0; i <= petals; i++) {
    const angle = start + i * step;
    const x = cx + Math.cos(angle) * rx * innerRatio;
    const y = cy + Math.sin(angle) * ry * innerRatio;
    if (i === 0) {
      d += `M${x.toFixed(2)},${y.toFixed(2)} `;
    } else {
      const prevAngle = start + (i - 1) * step;
      const midAngle = (prevAngle + angle) / 2;
      const tx = cx + Math.cos(midAngle) * rx;
      const ty = cy + Math.sin(midAngle) * ry;
      d += `Q${tx.toFixed(2)},${ty.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)} `;
    }
  }
  return d + "Z";
};

const radialTicks = (
  cx,
  cy,
  rxIn,
  ryIn,
  rxOut,
  ryOut,
  count,
  rotationOffset = 0,
) => {
  const step = (Math.PI * 2) / count;
  const start = -Math.PI / 2 + rotationOffset;
  let d = "";
  for (let i = 0; i < count; i++) {
    const angle = start + i * step;
    const x1 = cx + Math.cos(angle) * rxIn;
    const y1 = cy + Math.sin(angle) * ryIn;
    const x2 = cx + Math.cos(angle) * rxOut;
    const y2 = cy + Math.sin(angle) * ryOut;
    d += `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} `;
  }
  return d.trim();
};

export const FreshDateMascot = ({
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
  const uid = useId().replace(/:/g, "");

  const getBodyAnimation = () => {
    switch (mood) {
      case "happy":
        return {
          animate: { y: [0, -3, 0] },
          transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        };
      case "excited":
      case "celebrating":
        return {
          animate: { scale: [1, 1.04, 1] },
          transition: { repeat: Infinity, duration: 0.6, ease: "easeInOut" },
        };
      case "sleeping":
        return {
          animate: { scale: [1, 1.02, 1] },
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        };
      case "sad":
        return {
          animate: { y: [0, 1.5, 0] },
          transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
        };
      case "thinking":
      case "focused":
        return {
          animate: { rotate: [0, 1, -1, 0] },
          transition: { repeat: Infinity, duration: 4, ease: "easeInOut" },
        };
      case "encouraging":
        return {
          animate: { y: [0, -2.5, 0] },
          transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
        };
      default:
        return {
          animate: { y: [0, -2, 0] },
          transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
        };
    }
  };

  const getEyebrows = () => {
    switch (mood) {
      case "happy":
      case "excited":
      case "celebrating":
        return (
          <>
            <path
              d="M19 32 Q24 29 29 31"
              stroke="#3E2412"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 31 Q40 29 45 32"
              stroke="#3E2412"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "thinking":
        return (
          <>
            <path
              d="M19 33 Q24 30 29 32"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 30 Q40 27 45 30"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "sad":
        return (
          <>
            <path
              d="M19 32 Q24 35 29 34"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 34 Q40 35 45 32"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "surprised":
        return (
          <>
            <motion.path
              d="M19 30 Q24 27 29 29"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              initial={{ y: 3 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <motion.path
              d="M35 29 Q40 27 45 30"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              initial={{ y: 3 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
          </>
        );
      case "focused":
        return (
          <>
            <path
              d="M19 34 L29 32.5"
              stroke="#3E2412"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M35 32.5 L45 34"
              stroke="#3E2412"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );
      case "proud":
      case "encouraging":
        return (
          <>
            <path
              d="M19 32 Q24 29.5 29 31"
              stroke="#3E2412"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 31 Q40 29.5 45 32"
              stroke="#3E2412"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "confident":
        return (
          <>
            <path
              d="M19 31 Q24 28 29 30"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 34 Q40 33.5 45 34.5"
              stroke="#3E2412"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      default:
        return null;
    }
  };

  const getEyes = () => {
    switch (mood) {
      case "happy":
      case "celebrating":
        return (
          <>
            <path
              d="M19 43 Q24 37.5 29 43"
              stroke="#3E2412"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 43 Q40 37.5 45 43"
              stroke="#3E2412"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "confident":
        return (
          <>
            <ellipse cx="24" cy="42" rx="5" ry="6" fill="white" />
            <ellipse cx="40" cy="42.8" rx="5" ry="5.2" fill="white" />
            <circle cx="25" cy="42.5" r="2.8" fill="#3E2412" />
            <circle cx="41" cy="43" r="2.8" fill="#3E2412" />
            <circle cx="26" cy="41" r="1.2" fill="white" />
            <circle cx="42" cy="41.5" r="1.2" fill="white" />
          </>
        );
      case "sleeping":
        return (
          <>
            <path
              d="M19 42 Q24 46 29 42"
              stroke="#3E2412"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M35 42 Q40 46 45 42"
              stroke="#3E2412"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M21 45 L22 47"
              stroke="#3E2412"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M27 45 L26 47"
              stroke="#3E2412"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M37 45 L38 47"
              stroke="#3E2412"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <path
              d="M43 45 L42 47"
              stroke="#3E2412"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </>
        );
      case "cool":
        return null;
      case "excited":
      case "celebrating":
        return (
          <>
            <motion.ellipse
              cx="24"
              cy="42"
              rx="5.5"
              ry="6.5"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.ellipse
              cx="40"
              cy="42"
              rx="5.5"
              ry="6.5"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.circle
              cx="25"
              cy="43"
              r="3"
              fill="#3E2412"
              animate={{ y: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <motion.circle
              cx="41"
              cy="43"
              r="3"
              fill="#3E2412"
              animate={{ y: [0, -1, 0] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
            />
            <circle cx="26" cy="41" r="1.3" fill="white" />
            <circle cx="42" cy="41" r="1.3" fill="white" />
          </>
        );
      case "surprised":
        return (
          <>
            <motion.circle
              cx="24"
              cy="42"
              r="6.5"
              fill="white"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <motion.circle
              cx="40"
              cy="42"
              r="6.5"
              fill="white"
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <circle cx="24" cy="42" r="3.2" fill="#3E2412" />
            <circle cx="40" cy="42" r="3.2" fill="#3E2412" />
            <circle cx="25.2" cy="40.5" r="1.2" fill="white" />
            <circle cx="41.2" cy="40.5" r="1.2" fill="white" />
          </>
        );
      case "thinking":
        return (
          <>
            <ellipse cx="24" cy="42" rx="5" ry="6" fill="white" />
            <ellipse cx="40" cy="42" rx="5" ry="6" fill="white" />
            <motion.circle
              cx="25.5"
              cy="40"
              r="2.6"
              fill="#3E2412"
              animate={{ x: [0, 1.5, 0, -1.5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
            />
            <motion.circle
              cx="41.5"
              cy="40"
              r="2.6"
              fill="#3E2412"
              animate={{ x: [0, 1.5, 0, -1.5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4,
              }}
            />
          </>
        );
      case "sad":
        return (
          <>
            <ellipse cx="24" cy="43" rx="4.8" ry="5.5" fill="white" />
            <ellipse cx="40" cy="43" rx="4.8" ry="5.5" fill="white" />
            <circle cx="24" cy="44.5" r="2.6" fill="#3E2412" />
            <circle cx="40" cy="44.5" r="2.6" fill="#3E2412" />
            <circle cx="25" cy="43.5" r="1" fill="white" />
            <circle cx="41" cy="43.5" r="1" fill="white" />
            <motion.path
              d="M18 47 Q17 50 18 52 Q19 53.5 20 52 Q21 50 20 47.5 Q19 46 18 47Z"
              fill="#7DD3FC"
              animate={{ y: [0, 6], opacity: [0.9, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeIn" }}
            />
          </>
        );
      case "focused":
        return (
          <>
            <ellipse cx="24" cy="42" rx="5" ry="4.5" fill="white" />
            <ellipse cx="40" cy="42" rx="5" ry="4.5" fill="white" />
            <circle cx="25" cy="42" r="2.7" fill="#3E2412" />
            <circle cx="41" cy="42" r="2.7" fill="#3E2412" />
            <circle cx="26" cy="41" r="1" fill="white" />
            <circle cx="42" cy="41" r="1" fill="white" />
          </>
        );
      case "proud":
      case "encouraging":
        return (
          <>
            <motion.ellipse
              cx="24"
              cy="42"
              rx="5"
              ry="6"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.ellipse
              cx="40"
              cy="42"
              rx="5"
              ry="6"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.circle
              cx="25"
              cy="42.5"
              r="2.8"
              fill="#3E2412"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.circle
              cx="41"
              cy="42.5"
              r="2.8"
              fill="#3E2412"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <circle cx="26" cy="41" r="1.2" fill="white" />
            <circle cx="42" cy="41" r="1.2" fill="white" />
          </>
        );
      default:
        return (
          <>
            <motion.ellipse
              cx="24"
              cy="42"
              rx="5"
              ry="6"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.ellipse
              cx="40"
              cy="42"
              rx="5"
              ry="6"
              fill="white"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.circle
              cx="25"
              cy="43"
              r="2.8"
              fill="#3E2412"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <motion.circle
              cx="41"
              cy="43"
              r="2.8"
              fill="#3E2412"
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{
                repeat: Infinity,
                duration: 4,
                times: [0, 0.42, 0.45, 0.48, 1],
              }}
            />
            <circle cx="26" cy="41" r="1.2" fill="white" />
            <circle cx="42" cy="41" r="1.2" fill="white" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case "excited":
      case "celebrating":
        return (
          <>
            <motion.path
              d="M24 57 Q32 58 40 57 Q40 67 32 67 Q24 67 24 57Z"
              fill="#3E2412"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            />
            <path
              d="M26 57.5 Q32 58.5 38 57.5 L38 60 Q32 61 26 60Z"
              fill="white"
            />
            <ellipse cx="32" cy="64.5" rx="3.5" ry="2" fill="#FF8A80" />
          </>
        );
      case "cool":
        return (
          <path
            d="M26 60 Q33 63.5 39 58.5"
            stroke="#3E2412"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "proud":
        return (
          <>
            <path
              d="M25 58 Q32 64 39 58"
              stroke="#3E2412"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M27.5 59.4 Q32 62.5 36.5 59.4 L36 60.8 Q32 63 28 60.8Z"
              fill="white"
            />
          </>
        );
      case "thinking":
        return (
          <path
            d="M27 61 Q30 59.5 34 61.5"
            stroke="#3E2412"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "confident":
        return (
          <path
            d="M27 61.5 Q32 63 36 59.5"
            stroke="#3E2412"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "sad":
        return (
          <path
            d="M26 63 Q32 58 38 63"
            stroke="#3E2412"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        );
      case "surprised":
        return (
          <motion.ellipse
            cx="32"
            cy="61"
            rx="4"
            ry="5"
            fill="#3E2412"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
        );
      case "sleeping":
        return (
          <motion.ellipse
            cx="32"
            cy="61"
            rx="2.5"
            ry="3"
            fill="#3E2412"
            animate={{ scaleY: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          />
        );
      case "focused":
        return (
          <path
            d="M27 61 L37 61"
            stroke="#3E2412"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        );
      case "encouraging":
        return (
          <>
            <path d="M24 57 Q32 66 40 57 Q32 60 24 57Z" fill="#3E2412" />
            <path
              d="M26.5 58 Q32 60 37.5 58 L37 60 Q32 62 27 60Z"
              fill="white"
            />
          </>
        );
      default:
        return (
          <>
            <motion.path
              d="M25 58 Q32 65 39 58"
              stroke="#3E2412"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: [
                  "M25 60 Q32 61 39 60",
                  "M25 58 Q32 65 39 58",
                  "M25 58 Q32 65 39 58",
                ],
              }}
              transition={{ duration: 0.8, times: [0, 0.4, 1] }}
            />
            <path
              d="M28 60.2 Q32 63 36 60.2 L35.5 61.6 Q32 64 28.5 61.6Z"
              fill="white"
            />
          </>
        );
    }
  };

  const getBlush = () => {
    if (mood === "sad" || mood === "focused") return null;
    const opacity = mood === "sleeping" ? 0.35 : 0.55;
    return (
      <>
        <ellipse
          cx="14"
          cy="50"
          rx="4"
          ry="2.3"
          fill="#F9A8D4"
          opacity={opacity}
        />
        <ellipse
          cx="50"
          cy="50"
          rx="4"
          ry="2.3"
          fill="#F9A8D4"
          opacity={opacity}
        />
      </>
    );
  };

  const getAccessory = () => {
    switch (mood) {
      case "cool":
        return (
          <motion.g
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <rect x="16" y="37" width="15" height="10" rx="4" fill="#1a1a2e" />
            <rect x="33" y="37" width="15" height="10" rx="4" fill="#1a1a2e" />
            <rect x="29" y="40" width="6" height="2.5" fill="#1a1a2e" />
            <line
              x1="16"
              y1="41"
              x2="9"
              y2="39"
              stroke="#1a1a2e"
              strokeWidth="2.2"
            />
            <line
              x1="48"
              y1="41"
              x2="55"
              y2="39"
              stroke="#1a1a2e"
              strokeWidth="2.2"
            />
            <rect
              x="18.5"
              y="39"
              width="5"
              height="2"
              rx="1"
              fill="rgba(255,255,255,0.25)"
            />
            <rect
              x="35.5"
              y="39"
              width="4"
              height="1.5"
              rx="0.75"
              fill="rgba(255,255,255,0.15)"
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
            <path
              d="M14 22 L19 10 L24 18 L29 8 L32 16 L35 8 L40 18 L45 10 L50 22 L50 28 L14 28 Z"
              fill="#FFD700"
            />
            <rect x="14" y="26" width="36" height="4" rx="1.5" fill="#DAA520" />
            <circle cx="21" cy="16" r="2" fill="#E11D48" />
            <circle cx="32" cy="11" r="2.2" fill="#3B82F6" />
            <circle cx="43" cy="16" r="2" fill="#10B981" />
            <motion.ellipse
              cx="32"
              cy="7"
              rx="4"
              ry="1.5"
              fill="rgba(255,255,255,0.35)"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.g>
        );
      case "excited":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <path
              d="M39 16.5 L49 21.5 L51 3.5 Z"
              fill="#34D399"
              stroke="#059669"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            <path d="M41.5 13.5 L50 17.8" stroke="#FBBF24" strokeWidth="2" />
            <path d="M44.8 8.6 L50.6 11.5" stroke="#FBBF24" strokeWidth="1.6" />
            <circle cx="51.2" cy="3" r="1.7" fill="#F97316" />
            <motion.path
              d="M8 26 L11 23 L14 26 L11 29 Z"
              fill="#FFD700"
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path
              d="M52 22 L55 19 L58 22 L55 25 Z"
              fill="#FF6B6B"
              animate={{ rotate: -360, scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
            />
            <motion.circle
              cx="10"
              cy="58"
              r="1.5"
              fill="#34D399"
              animate={{ y: [0, -4, 0], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
            <motion.circle
              cx="56"
              cy="62"
              r="1.5"
              fill="#818CF8"
              animate={{ y: [0, -5, 0], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2.1 }}
            />
          </motion.g>
        );
      case "celebrating":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <g>
              <path
                d="M39 16.5 L49 21.5 L51 3.5 Z"
                fill="#34D399"
                stroke="#059669"
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
              <path d="M41.5 13.5 L50 17.8" stroke="#FBBF24" strokeWidth="2" />
              <path
                d="M44.8 8.6 L50.6 11.5"
                stroke="#FBBF24"
                strokeWidth="1.6"
              />
              <circle cx="51.2" cy="3" r="1.7" fill="#F97316" />
            </g>
            <motion.rect
              x="8"
              y="20"
              width="3"
              height="3"
              rx="0.5"
              fill="#F472B6"
              animate={{ y: [0, 60], rotate: 360, opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.rect
              x="54"
              y="16"
              width="3"
              height="3"
              rx="0.5"
              fill="#60A5FA"
              animate={{ y: [0, 65], rotate: -360, opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, delay: 0.3 }}
            />
            <motion.circle
              cx="14"
              cy="14"
              r="1.6"
              fill="#FBBF24"
              animate={{ y: [0, 55], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.6 }}
            />
            <motion.circle
              cx="50"
              cy="10"
              r="1.6"
              fill="#34D399"
              animate={{ y: [0, 60], opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.9 }}
            />
            <motion.path
              d="M6 40 L7.5 37 L9 40 L7.5 43 Z"
              fill="#FFD700"
              animate={{ scale: [0.8, 1.3, 0.8], rotate: 180 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.path
              d="M55 44 L56.5 41 L58 44 L56.5 47 Z"
              fill="#F472B6"
              animate={{ scale: [0.8, 1.3, 0.8], rotate: -180 }}
              transition={{ repeat: Infinity, duration: 1.7 }}
            />
          </motion.g>
        );
      case "thinking":
        return (
          <motion.g
            animate={{ y: [0, -2, 0], opacity: [0.65, 1, 0.65] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <text
              x="50"
              y="24"
              fill="#8B5A2B"
              fontSize="14"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
            >
              ?
            </text>
          </motion.g>
        );
      case "sad":
        return (
          <motion.path
            d="M46.5 44.5 C47.9 46.9 47.9 48.6 46.5 49.4 C45.1 48.6 45.1 46.9 46.5 44.5 Z"
            fill="#7EC8F7"
            stroke="#5BA8DC"
            strokeWidth="0.4"
            animate={{ y: [0, 3.5], opacity: [0.95, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeIn" }}
          />
        );
      case "happy":
        return (
          <motion.g
            stroke="#F5B940"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          >
            <path d="M6 20 L3.5 16.5" />
            <path d="M10 16.5 L8.8 12.5" />
            <path d="M3.5 26 L0.8 24.5" />
            <path d="M58 20 L60.5 16.5" />
            <path d="M54 16.5 L55.2 12.5" />
            <path d="M60.5 26 L63.2 24.5" />
          </motion.g>
        );
      case "sleeping":
        return (
          <motion.g
            animate={{ y: [-2, -8], opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          >
            <text x="48" y="30" fill="#B0AFAF" fontSize="10" fontWeight="bold">
              Z
            </text>
            <text x="54" y="22" fill="#C8C7C7" fontSize="7" fontWeight="bold">
              z
            </text>
            <text x="58" y="16" fill="#DEDDDD" fontSize="5" fontWeight="bold">
              z
            </text>
          </motion.g>
        );
      case "focused":
        return (
          <motion.g
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <circle
              cx="24"
              cy="42"
              r="7"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="1.8"
            />
            <circle
              cx="40"
              cy="42"
              r="7"
              fill="none"
              stroke="#1a1a2e"
              strokeWidth="1.8"
            />
            <path d="M31 42 L33 42" stroke="#1a1a2e" strokeWidth="1.8" />
            <line
              x1="17"
              y1="42"
              x2="10"
              y2="40"
              stroke="#1a1a2e"
              strokeWidth="1.8"
            />
            <line
              x1="47"
              y1="42"
              x2="54"
              y2="40"
              stroke="#1a1a2e"
              strokeWidth="1.8"
            />
            <ellipse
              cx="22"
              cy="40"
              rx="2.5"
              ry="1.5"
              fill="rgba(255,255,255,0.2)"
            />
            <ellipse
              cx="38"
              cy="40"
              rx="2.5"
              ry="1.5"
              fill="rgba(255,255,255,0.15)"
            />
          </motion.g>
        );
      case "confident":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.path
              d="M8 24 L9.8 20.5 L11.6 24 L9.8 27.5 Z"
              fill="#FFD700"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.path
              d="M54 32 L55.5 29 L57 32 L55.5 35 Z"
              fill="#FBBF24"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }}
            />
            <motion.circle
              cx="12"
              cy="34"
              r="1.2"
              fill="#FFD700"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            />
          </motion.g>
        );
      case "encouraging":
        return (
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.path
              d="M9 30 L10.5 26.5 L12 30 L10.5 33.5 Z"
              fill="#FBBF24"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
            <motion.path
              d="M52 26 L53.5 22.5 L55 26 L53.5 29.5 Z"
              fill="#FBBF24"
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: 0.4 }}
            />
          </motion.g>
        );
      default:
        return null;
    }
  };

  const LIMB_FILL = "#E8B25A";
  const LIMB_STROKE = "#8A4E1C";

  const capsule = (bx, by, deg, len, r) => {
    const t = (deg * Math.PI) / 180;
    const dx = Math.cos(t);
    const dy = Math.sin(t);
    const nx = -dy * r;
    const ny = dx * r;
    const tx = bx + dx * len;
    const ty = by + dy * len;
    const p = (v) => v.toFixed(2);
    return (
      `M${p(bx + nx)} ${p(by + ny)} ` +
      `L${p(tx + nx)} ${p(ty + ny)} ` +
      `A${r} ${r} 0 0 0 ${p(tx - nx)} ${p(ty - ny)} ` +
      `L${p(bx - nx)} ${p(by - ny)} ` +
      `A${r} ${r} 0 0 0 ${p(bx + nx)} ${p(by + ny)} Z`
    );
  };

  const WAVE_PIECES = [
    "M-1.99 -1.35 Q-1.4 6.39 -5.6 11.8 A2 2 0 0 0 -2.4 14.2 Q2.4 7.61 1.99 -1.65 Z",
    "M-3.8 -3.2 a3.8 3.6 0 1 0 7.6 0 a3.8 3.6 0 1 0 -7.6 0 Z",
    capsule(-3.2, -1.8, -152, 3.8, 1.15),
    capsule(-2.7, -5, -107, 4.3, 1.05),
    capsule(-0.9, -5.7, -95, 5, 1.1),
    capsule(0.9, -5.6, -83, 4.5, 1.05),
    capsule(2.6, -4.9, -70, 3.4, 0.9),
  ];

  const mergedLimb = (pieces) => (
    <>
      {pieces.map((d, i) => (
        <path
          key={`o-${i}`}
          d={d}
          fill={LIMB_FILL}
          stroke={LIMB_STROKE}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      ))}
      {pieces.map((d, i) => (
        <path key={`f-${i}`} d={d} fill={LIMB_FILL} />
      ))}
    </>
  );

  const waveLimb = (x, y, flip = false, rotate = 0) => (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${
        flip ? -1 : 1
      } 1)`}
    >
      {mergedLimb(WAVE_PIECES)}
    </g>
  );

  const getArms = () => {
    const bothWaving = (
      <>
        {waveLimb(5.5, 36.5, true)}
        {waveLimb(58.5, 36.5)}
      </>
    );

    const drooping = (
      <>
        {waveLimb(6, 62, false, 180)}
        {waveLimb(58, 62, true, 180)}
      </>
    );

    switch (mood) {
      case "happy":
      case "encouraging":
      case "excited":
        return bothWaving;
      case "sad":
        return drooping;
      case "thinking":
        return (
          <image
            href="/thinking-hand-2.svg"
            x="20"
            y="58"
            width="20"
            height="22.4"
            preserveAspectRatio="xMidYMid meet"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        animate={{ y: [0, -5, 0], rotate: [0, 1.2, -1.2, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <motion.div {...getBodyAnimation()}>
          <svg
            viewBox="0 0 64 92"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: dimensions, height: dimensions * 1.3 }}
          >
            <ellipse cx="32" cy="88" rx="19" ry="3" fill="rgba(0,0,0,0.1)" />

            <motion.path
              d="M6 42
               C6 27 17 16 32 16
               C47 16 58 27 58 42
               C58.5 46 58.5 51 58 56
               C57 66 52 75 44 79
               C40 81 36 81.5 32 81.5
               C28 81.5 24 81 20 79
               C12 75 7 66 6 56
               C5.5 51 5.5 46 6 42Z"
              fill={`url(#${uid}freshDateBottom)`}
              stroke={`url(#${uid}freshDateOutline)`}
              strokeWidth="1.6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />

            <path
              d="M6 42
               C6 27 17 16 32 16
               C47 16 58 27 58 42
               C58.3 48 58.3 55 58 60
               C50 63 42 65 32 65
               C22 65 14 63 6 60
               C5.7 55 5.7 48 6 42Z"
              fill={`url(#${uid}freshDateTop)`}
            />
            <path
              d="M6 60 Q14 64 22 63 Q28 62 32 64 Q38 66 44 63 Q52 61 58 60"
              stroke="#B4762E"
              strokeWidth="1.2"
              fill="none"
              opacity="0.35"
            />

            <ellipse
              cx="24"
              cy="36"
              rx="9"
              ry="6"
              fill="rgba(255,255,255,0.22)"
            />
            <ellipse
              cx="42"
              cy="32"
              rx="4"
              ry="3"
              fill="rgba(255,255,255,0.15)"
            />

            <path
              d="M16 68 Q20 73 18 78"
              stroke="#7A4415"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
            <path
              d="M46 68 Q44 72 46 76"
              stroke="#7A4415"
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M27 76 Q32 79 37 76"
              stroke="#7A4415"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
              opacity="0.3"
            />

            <g>
              <path
                d="M16 22
                   C19 17.5 25 15 32 15
                   C39 15 45 17.5 48 22
                   Q46 25.6 44 24.2 Q42 27.4 40 25.8 Q38 28.7 36 26.8
                   Q34 29.4 32 27.1 Q30 29.4 28 26.8 Q26 28.7 24 25.8
                   Q22 27.4 20 24.2 Q18 25.6 16 22 Z"
                fill={`url(#${uid}calyxTop)`}
                stroke="#8F5F23"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              <path
                d="M46.5 21.4
                   Q46 23.9 44 22.5 Q42 25.7 40 24.1 Q38 27 36 25.1
                   Q34 27.7 32 25.4 Q30 27.7 28 25.1 Q26 27 24 24.1
                   Q22 25.7 20 22.5 Q18 23.9 17.5 21.4"
                stroke="#B07F35"
                strokeWidth="0.45"
                opacity="0.7"
                fill="none"
                strokeLinecap="round"
              />

              <ellipse
                cx="32.4"
                cy="17.4"
                rx="2"
                ry="0.75"
                fill="#8A5F16"
                opacity="0.3"
              />

              <path
                d="M30.6 17.6
                   C30.7 14 31.3 10.6 32.4 7.9
                   L35.3 8.5
                   C34.7 11.2 34.3 14.4 34.2 17.6
                   Z"
                fill={`url(#${uid}stemGradient)`}
                stroke="#8A5E14"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
              <path
                d="M31.5 16.8 C31.6 13.6 32 10.8 32.9 8.6"
                stroke="rgba(255,246,210,0.6)"
                strokeWidth="0.5"
                fill="none"
                strokeLinecap="round"
              />
              <ellipse
                cx="33.85"
                cy="8.2"
                rx="1.55"
                ry="0.6"
                transform="rotate(12 33.85 8.2)"
                fill="#F6DE9C"
                stroke="#8A5E14"
                strokeWidth="0.45"
              />
              <ellipse
                cx="31.4"
                cy="17"
                rx="0.55"
                ry="0.4"
                fill="#6E4A12"
                opacity="0.65"
              />
            </g>

            <g transform="translate(0 1.6)">{getEyebrows()}</g>
            {getEyes()}
            {getAccessory()}
            {getBlush()}
            <g transform="translate(0 -1.6)">{getMouth()}</g>
            {getArms()}

            <defs>
              <linearGradient
                id={`${uid}freshDateBottom`}
                x1="32"
                y1="19"
                x2="32"
                y2="92"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#B4762E" />
                <stop offset="45%" stopColor="#A9642A" />
                <stop offset="100%" stopColor="#8A4E1C" />
              </linearGradient>
              <linearGradient
                id={`${uid}freshDateTop`}
                x1="32"
                y1="19"
                x2="32"
                y2="69"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#F2C878" />
                <stop offset="60%" stopColor="#EBB860" />
                <stop offset="100%" stopColor="#DFA84E" />
              </linearGradient>
              <linearGradient
                id={`${uid}freshDateOutline`}
                x1="32"
                y1="19"
                x2="32"
                y2="92"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#C99A4A" />
                <stop offset="100%" stopColor="#6E3D14" />
              </linearGradient>
              <linearGradient
                id={`${uid}freshDateArm`}
                x1="0"
                y1="45"
                x2="0"
                y2="59"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#DFA84E" />
                <stop offset="100%" stopColor="#A9642A" />
              </linearGradient>
              <linearGradient
                id={`${uid}calyxTop`}
                x1="32"
                y1="15"
                x2="32"
                y2="29"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#F2C979" />
                <stop offset="55%" stopColor="#E7B45C" />
                <stop offset="100%" stopColor="#D9A047" />
              </linearGradient>
              <linearGradient
                id={`${uid}stemGradient`}
                x1="30.6"
                y1="12"
                x2="35.3"
                y2="12"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#F4CE5A" />
                <stop offset="55%" stopColor="#E4B840" />
                <stop offset="100%" stopColor="#C08E22" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
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
