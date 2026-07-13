import { ComboBox } from "./ComboBox";

const languages = [
  { value: "arabic", label: "Arabic", description: "العربية", icon: "🇸🇦" },
  {
    value: "english",
    label: "English",
    description: "Learn from Arabic",
    icon: "🇬🇧",
  },
  { value: "french", label: "French", description: "Français", icon: "🇫🇷" },
  { value: "spanish", label: "Spanish", description: "Español", icon: "🇪🇸" },
  { value: "german", label: "German", description: "Deutsch", icon: "🇩🇪" },
  { value: "urdu", label: "Urdu", description: "اردو", icon: "🇵🇰" },
];


export function LanguageSelector({
  value,
  onChange,
  label,
  className,
}) {
  const options = languages.map((lang) => ({
    value: lang.value,
    label: lang.label,
    description: lang.description,
    icon: <span className="text-xl">{lang.icon}</span>,
  }));

  return (
    <div className={className}>
      {/* {label && (
        <label className="mb-2 block text-sm font-semibold text-foreground">
          {label}
        </label>
      )} */}
      <ComboBox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Select a language"
        searchPlaceholder="Search languages..."
      />
    </div>
  );
}
