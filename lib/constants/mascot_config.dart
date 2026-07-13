import '../common/nakhlah_mascot.dart';

/// Describes the position and appearance of a single mascot on the
/// home-view zigzag journey path.
///
/// [horizontal] – fraction of available width (0.0 = left edge, 1.0 = right).
///                When set, this **replaces** the automatic zigzag placement.
/// [vertical]   – pixel offset from the computed row centre (positive = down).
class MascotSlot {
  const MascotSlot({
    this.horizontal,
    this.vertical = 0.0,
    this.type,
    this.size,
    this.animate,
  });

  /// Horizontal position as a fraction of the section width.
  /// 0.0 = far-left, 0.5 = centre, 1.0 = far-right.
  /// When `null`, the automatic sine-wave algorithm picks the side
  /// opposite the coins (empty space).
  final double? horizontal;

  /// Vertical pixel shift on top of the auto-computed row position.
  /// Positive values push the mascot down; negative pulls it up.
  final double vertical;

  /// Override the mascot emotion for this slot.  When `null` the
  /// cycling [MascotConfig.mascotSequence] is used instead.
  final MascotType? type;

  /// Override the mascot size (width & height) for this slot.
  final double? size;

  /// Override the animation toggle for this slot.
  final bool? animate;
}

/// Centralised mascot configuration for the home-view zigzag path.
///
/// **Per-mascot controls** live in [slots].  Each entry is keyed by
/// **section index** (0 = topmost section).  Any field left `null`
/// falls back to the global default at the bottom of this class.
///
/// To move the first mascot to the far-left and the third to the
/// far-right, just edit the map:
/// ```dart
/// static const slots = {
///   0: MascotSlot(horizontal: 0.10),
///   2: MascotSlot(horizontal: 0.90),
/// };
/// ```
class MascotConfig {
  const MascotConfig._();

  // ── Per-mascot position overrides ──────────────────────────────────
  /// Keyed by section index (0 = topmost).
  ///
  /// Fields left `null` inherit from the automatic zigzag algorithm
  /// (mascot placed in the empty space opposite the coins).
  static const Map<int, MascotSlot> slots = {};

  // ── Global defaults (used when a slot field is null) ──────────────

  /// Default mascot size (width & height in px).
  static const double defaultSize = 100;

  /// Default vertical pixel offset applied to **every** mascot.
  /// Positive = down, negative = up.
  /// This is additive — slot values stack on top of this.
  static const double defaultVertical = 0.0;

  /// Default animation toggle.
  static const bool defaultAnimate = true;

  /// Frequency of the zigzag sine wave that places lesson nodes.
  static const double pathFrequency = 0.8;

  /// Row height (px) for each lesson node row.
  static const double lessonRowHeight = 112.0;

  /// The ordered list of mascot emotions that cycle across sections.
  /// Section 0 → index 0, section 1 → index 1, etc.  Wraps around.
  static const List<MascotType> mascotSequence = [
    MascotType.focused,
    MascotType.encouraging,
    MascotType.happy,
    MascotType.thinking,
    MascotType.excited,
    MascotType.proud,
    MascotType.celebrating,
  ];

  // ── Resolvers (used by home_view.dart) ───────────────────────────

  /// Vertical pixel offset for [sectionIndex].
  /// Adds [defaultVertical] + any per-slot vertical shift.
  static double verticalFor(int sectionIndex) =>
      defaultVertical + (slots[sectionIndex]?.vertical ?? 0.0);

  /// Mascot type for [sectionIndex].  Slot override wins, then the
  /// cycling [mascotSequence].
  static MascotType typeFor(int sectionIndex) =>
      slots[sectionIndex]?.type ??
      mascotSequence[sectionIndex % mascotSequence.length];

  /// Mascot size for [sectionIndex].
  static double sizeFor(int sectionIndex) =>
      slots[sectionIndex]?.size ?? defaultSize;

  /// Animation toggle for [sectionIndex].
  static bool animateFor(int sectionIndex) =>
      slots[sectionIndex]?.animate ?? defaultAnimate;
}
