"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import cloudinaryLoader from "@/app/(dashboard)/lesson/utils/cloudinaryLoader";

// Preload an image URL without rendering it
function preloadImage(src) {
  if (typeof window === "undefined" || !src) return;
  const img = new window.Image();
  img.src = src;
}

// Cloudinary asset config: base URL + target responsive width
const ASSET_CONFIG = {
  palmTrees: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284436/palm-tree-collection_wptg2e.png",
    width: 400,
  },
  dallah: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284436/dallah_lt29my.png",
    width: 300,
  },
  coral: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782906703/Gemini_Generated_Image_96a6rt96a6rt96a6-removebg-preview_onecha.png",
    width: 800,
  },
  floatingMosque: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284437/floating-mosque_wkdjk7.png",
    width: 600,
  },
  madainSalihTombs: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284437/Madain-Salih-Tombs_jni765.png",
    width: 400,
  },
  masmakhFortress: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284436/mesmakh-fortress_b44m32.png",
    width: 400,
  },
  desertTent: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782403240/Arabian_Tent_1_xsidcj.png",
    width: 500,
  },
  desertBirds: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782284437/desert-birds_qcpi2s.png",
    width: 500,
  },
  camel: { src: "/animations/Camel.json", width: null },
  alFaisaliahTower: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893620/All-Faisaliah_v1_rbsyaq.png",
    width: 600,
  },
  kingdomCenter: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893622/Centre_Tower_v1_tesii9.png",
    width: 600,
  },
  makkahClock: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893626/Clock_tower_v1_i6akzk.png",
    width: 600,
  },
  burjAssila: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893622/Burj_Assila_v2_sjjdbr.png",
    width: 600,
  },
  university1: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893701/university_1_wg0fic.png",
    width: 500,
  },
  university2: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893700/university_2_emc5ce.png",
    width: 500,
  },
  stadium: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893700/Stadium_v1-removebg-preview_jkmwup.png",
    width: 600,
  },
  museum: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893684/museum_v1-removebg-preview_xbr8uj.png",
    width: 500,
  },
  mosque: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893636/Moshjid_v1_tj5ywk.png",
    width: 500,
  },
  hospital: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893627/hospital_i4hhwe.png",
    width: 500,
  },
  glassGate: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893626/Glass_House_v1-removebg-preview_hb5xlc.png",
    width: 500,
  },
  kacrc: {
    src: "https://res.cloudinary.com/dqdeoobeb/image/upload/v1782893627/KAC-RC_v1-removebg-preview_mfdwvh.png",
    width: 500,
  },
};

// Apply Cloudinary auto-format/quality/width optimizations
function getAssetSrc(key) {
  const config = ASSET_CONFIG[key];
  if (!config) return "";
  if (config.width && config.src.includes("res.cloudinary.com")) {
    return cloudinaryLoader({ src: config.src, width: config.width });
  }
  return config.src;
}

// Extract all image sources from a theme's asset config
function getThemeImageSources(theme) {
  if (!theme?.assets) return [];
  const { assets } = theme;
  const sources = [];
  if (assets.palmTrees) sources.push(getAssetSrc("palmTrees"));
  if (assets.dallah) sources.push(getAssetSrc("dallah"));
  if (assets.coral) sources.push(getAssetSrc("coral"));
  if (assets.floatingMosque) sources.push(getAssetSrc("floatingMosque"));
  if (assets.madainSalihTombs) sources.push(getAssetSrc("madainSalihTombs"));
  if (assets.masmakhFortress) sources.push(getAssetSrc("masmakhFortress"));
  if (assets.desertTent) sources.push(getAssetSrc("desertTent"));
  if (assets.desertBirds) sources.push(getAssetSrc("desertBirds"));
  if (assets.camel) sources.push(getAssetSrc("camel"));
  if (assets.alFaisaliahTower) sources.push(getAssetSrc("alFaisaliahTower"));
  if (assets.kingdomCenter) sources.push(getAssetSrc("kingdomCenter"));
  if (assets.burjAssila) sources.push(getAssetSrc("burjAssila"));
  if (assets.makkahClock) sources.push(getAssetSrc("makkahClock"));
  if (assets.university1) sources.push(getAssetSrc("university1"));
  if (assets.university2) sources.push(getAssetSrc("university2"));
  if (assets.stadium) sources.push(getAssetSrc("stadium"));
  if (assets.museum) sources.push(getAssetSrc("museum"));
  if (assets.mosque) sources.push(getAssetSrc("mosque"));
  if (assets.hospital) sources.push(getAssetSrc("hospital"));
  if (assets.glassGate) sources.push(getAssetSrc("glassGate"));
  if (assets.kacrc) sources.push(getAssetSrc("kacrc"));
  return sources;
}

// 8 rotating themes - each level gets one theme in rotation
// Journey: Desert → Oasis → Coastal → Sandy Civic → Desert Modern → Golden Dusk → Urban Twilight → Midnight City
// All assets positioned around center (50%) to align with zigzag path
const THEMES = [
  {
    id: "desert-dunes",
    name: "Desert Dunes",
    bgFrom: "#FF8C42",
    bgVia: "#F5A623",
    bgTo: "#E8853E",
    assets: {
      sun: { color: "from-amber-400 to-orange-500", size: "lg" },
      camel: { position: "center-right", size: "xl" },
      desertTent: { position: "center-area", size: "xl" },
      palmTrees: { position: "center-area-right", count: 2, size: "xl" },
      desertBirds: { position: "far-right", size: "xl" },
      dune1: { color: "#A65D29", opacity: 0.6 },
      dune2: { color: "#8B4D20", opacity: 0.8 },
    },
  },
  {
    id: "desert-oasis",
    name: "Desert Oasis",
    bgFrom: "#E8853E",
    bgVia: "#D47835",
    bgTo: "#C46830",
    assets: {
      sun: { color: "from-amber-300 to-orange-400", size: "md" },
      dallah: { position: "far-left" },
      madainSalihTombs: { position: "upper-area", size: "2xl" },
      palmTrees: { position: "middle-area", count: 3, size: "xl" },
      masmakhFortress: { position: "left-lower", size: "xl" },
      dune1: { color: "#9C5525", opacity: 0.5 },
    },
  },
  {
    id: "coastal-breeze",
    name: "Coastal Breeze",
    bgFrom: "#4A90A4",
    bgVia: "#3D7A8C",
    bgTo: "#2D5A6B",
    assets: {
      sun: { color: "from-amber-200 to-orange-300", size: "sm" },
      wave1: { color: "rgba(255,255,255,0.2)" },
      floatingMosque: { position: "far-left", inWaves: true },
      desertBirds: { position: "upper-area", size: "xl" },
      palmTrees: { position: "middle-area", count: 1, size: "xl" },
    },
  },
  {
    id: "sandy-civic",
    name: "Sandy Civic",
    bgFrom: "#F2C94C",
    bgVia: "#E8A838",
    bgTo: "#D4872A",
    assets: {
      sun: { color: "from-yellow-300 to-orange-400", size: "lg" },
      mosque: { position: "upper-left", size: "2xl" },
      kacrc: { position: "mid-right", size: "2xl" },
      palmTrees: { position: "beside-mosque", size: "lg" },
      desertBirds: { position: "upper-sky", size: "md" },
      dune1: { color: "#C97B1E", opacity: 0.35 },
    },
  },
  {
    id: "desert-modern",
    name: "Desert Modern",
    bgFrom: "#E76F51",
    bgVia: "#D45A3A",
    bgTo: "#B84428",
    assets: {
      sun: { color: "from-orange-300 to-red-400", size: "md" },
      glassGate: { position: "upper-left", size: "2xl" },
      stadium: { position: "mid-right", size: "2xl" },
      desertBirds: { position: "above-stadium", size: "sm" },
      dune2: { color: "#8B3420", opacity: 0.6 },
    },
  },
  {
    id: "golden-dusk",
    name: "Golden Dusk",
    bgFrom: "#FF7E5F",
    bgVia: "#E85D4A",
    bgTo: "#8B2F3A",
    assets: {
      sun: { color: "from-rose-300 to-orange-500", size: "sm" },
      hospital: { position: "upper-left", size: "2xl" },
      university1: { position: "mid-right", size: "2xl" },
      palmTrees: { position: "beside-university", size: "lg" },
      dune3: { color: "#5C1A2A", opacity: 0.8 },
    },
  },
  {
    id: "urban-twilight",
    name: "Urban Twilight",
    bgFrom: "#2D5A6B",
    bgVia: "#1A3A4A",
    bgTo: "#0D2832",
    assets: {
      sun: { color: "from-orange-300 to-pink-400", size: "sm" },
      alFaisaliahTower: { position: "upper-left", size: "2xl" },
      kingdomCenter: { position: "mid-left", size: "2xl" },
      makkahClock: { position: "upper-area", size: "2xl" },
      moon: { color: "#E8DCC0", size: "md", crescent: true },
    },
  },
  {
    id: "midnight-city",
    name: "Midnight City",
    bgFrom: "#0D2832",
    bgVia: "#051A20",
    bgTo: "#020D12",
    assets: {
      stars: { count: 50 },
      alFaisaliahTower: { position: "upper-mid-left", size: "2xl" },
      burjAssila: { position: "upper-mid-right", size: "2xl" },
      makkahClock: { position: "upper-mid-area", size: "2xl" },
      moon: { color: "from-slate-100 to-slate-300", size: "lg" },
    },
  },
];

// Assign theme to each level based on rotation
const getLevelTheme = (levelIndex) => THEMES[levelIndex % THEMES.length];

export function UnitBasedBackground({ children, levels = [], className = "" }) {
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  // Get current theme based on active level
  const currentTheme = useMemo(() => {
    return getLevelTheme(activeLevelIndex);
  }, [activeLevelIndex]);

  // Use IntersectionObserver to track which level is currently in viewport
  useEffect(() => {
    if (typeof window === "undefined" || !levels.length) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const levelId = entry.target.getAttribute("data-level-id");
          const levelIndex = levels.findIndex(
            (l) => l.id.toString() === levelId,
          );
          if (levelIndex !== -1) {
            setActiveLevelIndex(levelIndex);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    // Observe all level elements
    const levelElements = document.querySelectorAll("[data-level-id]");
    levelElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [levels]);

  // Smooth background transition when theme changes
  useEffect(() => {
    if (!bgRef.current) return;

    gsap.to(bgRef.current, {
      background: `linear-gradient(to bottom, ${currentTheme.bgFrom} 0%, ${currentTheme.bgVia} 50%, ${currentTheme.bgTo} 100%)`,
      duration: 1.2,
      ease: "power2.inOut",
    });
  }, [currentTheme]);

  // Prefetch current + adjacent scene images so they load before entering viewport
  useEffect(() => {
    if (typeof window === "undefined" || !levels.length) return;

    const prefetch = () => {
      getThemeImageSources(currentTheme).forEach(preloadImage);

      const nextIndex = (activeLevelIndex + 1) % levels.length;
      const prevIndex = (activeLevelIndex - 1 + levels.length) % levels.length;
      getThemeImageSources(getLevelTheme(nextIndex)).forEach(preloadImage);
      getThemeImageSources(getLevelTheme(prevIndex)).forEach(preloadImage);
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(prefetch, { timeout: 2000 });
    } else {
      prefetch();
    }
  }, [activeLevelIndex, currentTheme, levels.length]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Animated background layer with smooth transition */}
      <div
        ref={bgRef}
        className="fixed inset-0 -z-20 w-full h-full"
        style={{
          background: `linear-gradient(to bottom, ${currentTheme.bgFrom} 0%, ${currentTheme.bgVia} 50%, ${currentTheme.bgTo} 100%)`,
        }}
      />

      {/* Per-level assets with AnimatePresence for smooth transitions */}
      <AnimatePresence mode="wait">
        <UnitAssets key={currentTheme.id} theme={currentTheme} />
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Render assets for each unit
function UnitAssets({ theme }) {
  const { assets } = theme;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden"
    >
      {/* Sun/Moon */}
      {assets.sun && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`absolute top-16 right-16 w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br ${assets.sun.color} shadow-2xl`}
          style={{ filter: "blur(1px)" }}
        />
      )}

      {assets.moon && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`absolute top-16 right-16 w-20 h-20 md:w-24 md:h-24 ${
            assets.moon.crescent
              ? "bg-transparent"
              : `rounded-full bg-gradient-to-br ${assets.moon.color} shadow-xl`
          }`}
          style={
            assets.moon.crescent
              ? {
                  filter: "drop-shadow(0 0 6px rgba(232, 220, 192, 0.4))",
                }
              : undefined
          }
        >
          {assets.moon.crescent && (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50 10 A40 40 0 1 1 50 90 A30 30 0 1 0 50 10 Z"
                fill={assets.moon.color}
              />
            </svg>
          )}
        </motion.div>
      )}

      {/* Dunes - Full width */}
      {assets.dune1 && (
        <svg
          className="absolute bottom-0 left-0 w-full h-[30vh] md:h-[25vh]"
          viewBox="0 0 1920 160"
          preserveAspectRatio="none"
        >
          <path
            fill={assets.dune1.color}
            opacity={assets.dune1.opacity}
            d="M-100,160 L-100,80 C200,20 500,120 800,60 C1100,0 1400,100 1700,40 C1900,10 2020,80 2100,100 L2100,160 Z"
          />
        </svg>
      )}

      {assets.dune2 && (
        <svg
          className="absolute bottom-0 left-0 w-full h-[25vh] md:h-[20vh]"
          viewBox="0 0 1920 128"
          preserveAspectRatio="none"
        >
          <path
            fill={assets.dune2.color}
            opacity={assets.dune2.opacity}
            d="M-100,128 L-100,64 C300,20 600,90 900,50 C1200,10 1500,80 1800,30 C1950,10 2020,60 2100,40 L2100,128 Z"
          />
        </svg>
      )}

      {assets.dune3 && (
        <svg
          className="absolute bottom-0 left-0 w-full h-[30vh] md:h-[25vh]"
          viewBox="0 0 1920 144"
          preserveAspectRatio="none"
        >
          <path
            fill={assets.dune3.color}
            opacity={assets.dune3.opacity}
            d="M-100,144 L-100,90 C150,60 400,110 650,75 C900,40 1050,100 1300,70 C1550,40 1750,95 1920,60 L2100,80 L2100,144 Z"
          />
        </svg>
      )}

      {/* Waves - Static, full width */}
      {assets.wave1 && (
        <svg
          className="absolute bottom-0 left-0 w-full h-56"
          viewBox="0 0 1920 192"
          preserveAspectRatio="none"
        >
          <path
            fill={assets.wave1.color}
            d="M-100,192 L-100,96 C300,48 600,144 900,96 C1200,48 1500,144 1800,96 C1950,72 2020,120 2100,96 L2100,192 Z"
          />
        </svg>
      )}

      {/* Scene 1: Palm Trees - Center area right of tent, NORMAL size */}
      {assets.palmTrees &&
        assets.palmTrees.position === "center-area-right" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[80%] md:left-[65%] -translate-x-1/2 bottom-16 w-40 md:w-48 lg:w-56 h-auto"
          >
            <img
              src={getAssetSrc("palmTrees")}
              alt="Palm Trees"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

      {/* Scene 2: Palm Trees - Middle area, NORMAL size */}
      {assets.palmTrees &&
        assets.palmTrees.position === "middle-area" &&
        theme.id === "desert-oasis" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[75%] md:left-[68%] -translate-x-1/2 bottom-20 w-44 md:w-52 lg:w-60 h-auto"
          >
            <img
              src={getAssetSrc("palmTrees")}
              alt="Palm Trees"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

      {/* Scene 3: Palm Trees - Middle area, HIGHER on mobile */}
      {assets.palmTrees &&
        assets.palmTrees.position === "middle-area" &&
        theme.id === "coastal-breeze" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[75%] md:left-[68%] -translate-x-1/2 bottom-52 md:bottom-20 w-44 md:w-52 lg:w-60 h-auto"
          >
            <img
              src={getAssetSrc("palmTrees")}
              alt="Palm Trees"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

      {/* Desert Birds - position-based */}
      {assets.desertBirds && assets.desertBirds.position === "far-right" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[15%] left-[20%] w-56 md:w-64 lg:w-72"
        >
          <img
            src={getAssetSrc("desertBirds")}
            alt="Desert Birds"
            className="w-full h-auto drop-shadow-md"
          />
        </motion.div>
      )}

      {/* Desert Birds - upper sky (Sandy Civic) */}
      {assets.desertBirds && assets.desertBirds.position === "upper-sky" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[6%] md:top-[4%] right-[15%] md:right-[20%] w-32 md:w-40 lg:w-48"
        >
          <img
            src={getAssetSrc("desertBirds")}
            alt="Desert Birds"
            className="w-full h-auto drop-shadow-md"
          />
        </motion.div>
      )}

      {/* Desert Birds - above stadium (Desert Modern) */}
      {assets.desertBirds &&
        assets.desertBirds.position === "above-stadium" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[5%] md:top-[4%] right-[5%] md:left-[10%] lg:left-[15%] w-36 md:w-44 lg:w-56"
          >
            <img
              src={getAssetSrc("desertBirds")}
              alt="Desert Birds"
              className="w-full h-auto drop-shadow-md"
            />
          </motion.div>
        )}

      {/* Palm Trees - beside mosque (Sandy Civic), side-by-side at ground */}
      {assets.palmTrees && assets.palmTrees.position === "beside-mosque" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-[8%] md:bottom-[14%] lg:bottom-[10%] left-[28%] md:left-[30%] w-24 md:w-32 lg:w-36 h-auto"
        >
          <img
            src={getAssetSrc("palmTrees")}
            alt="Palm Trees"
            className="w-full h-auto object-contain drop-shadow-lg"
          />
        </motion.div>
      )}

      {/* Palm Trees - beside university (Golden Dusk), side-by-side at ground */}
      {assets.palmTrees &&
        assets.palmTrees.position === "beside-university" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-[10%] md:bottom-[14%] lg:bottom-[10%] left-[10%] md:left-[70%] w-24 md:w-32 lg:w-36 h-auto"
          >
            <img
              src={getAssetSrc("palmTrees")}
              alt="Palm Trees"
              className="w-full h-auto object-contain drop-shadow-lg"
            />
          </motion.div>
        )}

      {/* Scene 1: Desert Tent - Center area, LARGE size */}
      {assets.desertTent && assets.desertTent.position === "center-area" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute left-[28%] -translate-x-1/2 bottom-12 md:bottom-10 w-64 md:w-80 xl:w-96"
        >
          <img
            src={getAssetSrc("desertTent")}
            alt="Desert Tent"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </motion.div>
      )}

      {/* Dallah - Scene 2: far left */}
      {assets.dallah && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`absolute left-[85%] md:left-[72%] -translate-x-1/2 bottom-24 w-20 md:w-24 lg:w-28`}
        >
          <img
            src={getAssetSrc("dallah")}
            alt="Arabic Coffee Pot"
            className="w-full h-auto object-contain drop-shadow-xl"
          />
        </motion.div>
      )}

      {/* Scene 3: Birds - Upper area */}
      {assets.desertBirds && assets.desertBirds.position === "upper-area" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-[30%] -translate-x-1/2 top-[10%] md:top-[2%] w-56 md:w-64 lg:w-72"
        >
          <img
            src={getAssetSrc("desertBirds")}
            alt="Desert Birds"
            className="w-full h-auto object-contain drop-shadow-lg"
          />
        </motion.div>
      )}

      {/* Scene 4: Urban Twilight - VERY LARGE buildings */}
      {/* {assets.alFaisaliahTower &&
        assets.alFaisaliahTower.position === "upper-left" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-[50%] left-[20%] w-72 lg:w-[22rem]"
          >
            <img
              src={getAssetSrc("alFaisaliahTower")}
              alt="Al Faisaliah Tower"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )} */}

      {assets.kingdomCenter && assets.kingdomCenter.position === "mid-left" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[45%] md:top-[45%] lg:top-[40%] left-[10%] md:left-[15%] w-36 md:w-44 lg:w-48"
        >
          <img
            src={getAssetSrc("kingdomCenter")}
            alt="Kingdom Center"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {assets.makkahClock && assets.makkahClock.position === "upper-area" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[15%] md:top-[8%] left-[60%] sm:left-[65%] md:left-[55%] w-44 md:w-56 lg:w-72"
        >
          <img
            src={getAssetSrc("makkahClock")}
            alt="Makkah Royal Clock Tower"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 5: Midnight City - VERY LARGE buildings */}
      {assets.alFaisaliahTower &&
        assets.alFaisaliahTower.position === "upper-mid-left" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[5%] md:top-[5%] left-[10%] md:left-[18%] w-36 md:w-44 lg:w-48"
          >
            <img
              src={getAssetSrc("alFaisaliahTower")}
              alt="Al Faisaliah Tower"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}

      {assets.burjAssila &&
        assets.burjAssila.position === "upper-mid-right" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[50%] md:top-[45%] left-[50%] md:left-[60%] w-56 md:w-64 lg:w-72"
          >
            <img
              src={getAssetSrc("burjAssila")}
              alt="Burj Assila"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}

      {/* {assets.makkahClock &&
        assets.makkahClock.position === "upper-mid-area" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[22%] left-[50%] w-88 lg:w-[30rem]"
          >
            <img
              src={getAssetSrc("makkahClock")}
              alt="Makkah Royal Clock Tower"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )} */}

      {/* Scene 3: Floating Mosque - Left side, VERY LARGE */}
      {assets.floatingMosque && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-8 md:bottom-0 left-[25%] -translate-x-1/2 w-72 md:w-80 lg:w-[26rem]"
        >
          <img
            src={getAssetSrc("floatingMosque")}
            alt="Floating Mosque"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 2: Tombs - Upper area, VERY LARGE */}
      {assets.madainSalihTombs &&
        assets.madainSalihTombs.position === "upper-area" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute left-[30%] -translate-x-1/2 top-[20%] md:top-[5%] w-40 md:w-52 lg:w-64"
          >
            <img
              src={getAssetSrc("madainSalihTombs")}
              alt="Madain Salih Tombs"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}

      {/* Scene 2: Masmakh Fortress - Left area, VERY LARGE */}
      {assets.masmakhFortress &&
        assets.masmakhFortress.position === "left-lower" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-[12%] md:bottom-[8%] lg:bottom-[5%] left-[20%] md:left-[25%] -translate-x-1/2 bottom-16 w-40 md:w-52 lg:w-64"
          >
            <img
              src={getAssetSrc("masmakhFortress")}
              alt="Masmakh Fortress"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>
        )}

      {/* Scene 4: Sandy Civic - Mosque upper-left */}
      {assets.mosque && assets.mosque.position === "upper-left" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-[8%] md:bottom-[15%] lg:bottom-[10%] left-[8%] md:left-[15%] w-48 md:w-56 lg:w-64"
        >
          <img
            src={getAssetSrc("mosque")}
            alt="Mosque"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 4: Sandy Civic - KAC-RC mid-right */}
      {assets.kacrc && assets.kacrc.position === "mid-right" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[20%] md:top-[25%] left-[50%] md:left-[60%] w-56 md:w-64 lg:w-72"
        >
          <img
            src={getAssetSrc("kacrc")}
            alt="KAC-RC"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 5: Desert Modern - Glass Gate upper-left */}
      {assets.glassGate && assets.glassGate.position === "upper-left" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[20%] md:top-[15%] left-[5%] md:left-[60%] w-44 md:w-52 lg:w-64"
        >
          <img
            src={getAssetSrc("glassGate")}
            alt="Glass Gate Complex"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 5: Desert Modern - Stadium mid-right */}
      {assets.stadium && assets.stadium.position === "mid-right" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-[10%] md:bottom-[20%] lg:bottom-[15%] right-[5%] md:left-[10%] lg:left-[15%] w-56 md:w-64 lg:w-72"
        >
          <img
            src={getAssetSrc("stadium")}
            alt="Stadium"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 6: Golden Dusk - Hospital upper-left */}
      {assets.hospital && assets.hospital.position === "upper-left" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[18%] md:top-[15%] lg:top-[10%] left-[8%] md:left-[12%] w-48 md:w-60 lg:w-72"
        >
          <img
            src={getAssetSrc("hospital")}
            alt="Hospital"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Scene 6: Golden Dusk - University mid-right */}
      {assets.university1 && assets.university1.position === "mid-right" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-[10%] md:bottom-[15%] lg:bottom-[8%] left-[40%] md:left-[55%] w-60 md:w-72 lg:w-80"
        >
          <img
            src={getAssetSrc("university1")}
            alt="University"
            className="w-full h-auto object-contain drop-shadow-2xl"
          />
        </motion.div>
      )}

      {/* Stars */}
      {assets.stars && (
        <div className="absolute inset-0">
          {Array.from({ length: assets.stars.count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Camel Lottie - Center-right, NORMAL size */}
      {assets.camel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-12 left-[85%] md:left-[73%] -translate-x-1/2 w-48 md:w-56 lg:w-60 h-48 md:h-56 lg:h-60 opacity-90"
        >
          <DotLottieReact
            src="/animations/Camel.json"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
