import React, { useState, useEffect } from "react";
import { Lock } from "@/components/icons/Lock";
import { Star } from "@/components/icons/Star";
import { LessonSelectionPopup } from "./LessonSelectionPopup";

// Shared state to ensure only one popup is open at a time
let activePopupId = null;
const popupListeners = new Set();

function setActivePopup(id) {
  activePopupId = id;
  popupListeners.forEach((listener) => listener(id));
}

export function Circle({
  isCompleted,
  isCurrent,
  isLocked,
  icon,
  type,
  size = "md",
  nodeId,
}) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const listener = (activeId) => {
      if (activeId !== nodeId) {
        setShowPopup(false);
      }
    };
    popupListeners.add(listener);
    return () => popupListeners.delete(listener);
  }, [nodeId]);

  const isSpecialType =
    type === "trophy" || type === "crown" || type === "checkpoint";
  const isTrophy = type === "trophy";

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const trophyIconSizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const iconSizeClass = isTrophy 
    ? (trophyIconSizeClasses[size] || trophyIconSizeClasses.md)
    : (iconSizeClasses[size] || iconSizeClasses.md);

  const getIcon = () => {
    if (isLocked) {
      if (isTrophy && icon) {
        return React.cloneElement(icon, {
          variant: "silver",
          className: `${icon.props.className || ""} ${iconSizeClass}`,
        });
      }
      return <Lock size="lg" variant="silver" />;
    }

    if (
      (isCurrent || isCompleted) &&
      !isTrophy &&
      type !== "checkpoint" &&
      type !== "crown"
    ) {
      return <Star size="lg" />;
    }

    if (icon) {
      return React.cloneElement(icon, {
        className: `${icon.props.className || ""} ${iconSizeClass}`,
      });
    }

    return null;
  };

  const getCircleStyles = () => {
    if (isTrophy) {
      return "";
    }
    if (isLocked) {
      return "bg-[hsl(var(--node-locked))] border-[hsl(var(--node-locked-border))] pathway-node-shadow-locked";
    }
    if (isCurrent) {
      return "bg-accent border-accent shadow-lg pathway-node-shadow-locked";
    }
    return "bg-[hsl(var(--node-yellow))] border-[hsl(var(--node-yellow-border))] pathway-node-shadow";
  };

  const handleClick = () => {
    if ((isCompleted || isCurrent) && !isLocked) {
      setActivePopup(nodeId);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setActivePopup(null);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`${!isTrophy ? `rounded-full border-4 ${sizeClass}` : ""} flex items-center justify-center ${getCircleStyles()} transition-transform ${
          (isCompleted || isCurrent) && !isLocked
            ? "cursor-pointer hover:scale-110"
            : isLocked
              ? "cursor-not-allowed"
              : "cursor-pointer hover:scale-105"
        }`}
      >
        <div className="flex items-center justify-center">{getIcon()}</div>
      </div>

      {/* Lesson Selection Popup */}
      {showPopup && (
        <LessonSelectionPopup
          taskId={nodeId}
          isCompleted={isCompleted}
          isCurrent={isCurrent}
          isLocked={isLocked}
          isTaskGiftBox={isTrophy}
          onClose={handleClosePopup}
          open={showPopup}
        />
      )}
    </>
  );
}
