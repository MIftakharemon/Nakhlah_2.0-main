export const LessonIcon = ({ lesson }) => {
    const { isCompleted, isCurrent, icon, title } = lesson;
    const iconColor = isCompleted ? "text-yellow-400" : isCurrent ? "text-blue-500" : "text-gray-400";

    return (
        <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${iconColor}`}>
                {icon}
            </div>
            <p className="mt-2 text-sm font-semibold text-center">{title}</p>
        </div>
    );
};