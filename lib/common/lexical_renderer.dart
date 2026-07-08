import 'package:flutter/material.dart';

/// Renders Lexical editor JSON AST to Flutter widgets.
///
/// Supported node types: root, paragraph, text, list, listitem,
/// linebreak, horizontalrule
///
/// Text format flags (bitmask):
/// 1 = bold, 2 = italic, 4 = strikethrough, 8 = underline, 16 = code
class LexicalRenderer extends StatelessWidget {
  const LexicalRenderer({super.key, required this.data, this.style});
  final dynamic data;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    if (data is! Map || data['root'] == null) {
      final text = data?.toString() ?? '';
      return Text(text, style: style);
    }
    return _buildBlock(data['root'], style);
  }

  // ── Block-level nodes → Widget ──

  static Widget _buildBlock(dynamic node, TextStyle? baseStyle) {
    if (node == null) return const SizedBox.shrink();

    final type = node['type']?.toString() ?? '';

    switch (type) {
      case 'root':
        final children = node['children'] as List? ?? [];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: children
              .map((c) => _buildBlock(c, baseStyle))
              .where((w) => w != const SizedBox.shrink())
              .toList(),
        );

      case 'paragraph':
        final children = node['children'] as List? ?? [];
        final format = node['format']?.toString() ?? '';
        TextAlign align = TextAlign.start;
        if (format == 'center') align = TextAlign.center;
        if (format == 'right') align = TextAlign.right;
        if (format == 'justify') align = TextAlign.justify;

        if (children.isEmpty) {
          return const SizedBox(height: 12);
        }
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: RichText(
            text: TextSpan(
              children: _buildInlineNodes(children, baseStyle),
              style: (baseStyle ?? const TextStyle()).copyWith(height: 1.6),
            ),
            textAlign: align,
          ),
        );


      case 'horizontalrule':
        return const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Divider(),
        );

      case 'list':
        return _buildList(node, baseStyle);

      case 'text':
      case 'linebreak':
      case 'listitem':
      default:
        // Inline / unknown → treat as a paragraph with inline content
        final children = node['children'] as List? ?? [];
        if (type == 'text') {
          return RichText(
            text: TextSpan(
              children: _buildInlineNodes([node], baseStyle),
              style: (baseStyle ?? const TextStyle()).copyWith(height: 1.6),
            ),
          );
        }
        if (children.isNotEmpty) {
          return RichText(
            text: TextSpan(
              children: _buildInlineNodes(children, baseStyle),
              style: (baseStyle ?? const TextStyle()).copyWith(height: 1.6),
            ),
          );
        }
        return const SizedBox.shrink();
    }
  }

  static Widget _buildList(dynamic node, TextStyle? baseStyle) {
    final children = node['children'] as List? ?? [];
    final listType = node['listType']?.toString() ?? 'bullet';
    final isNumber = listType == 'number';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children.asMap().entries.map((entry) {
          final i = entry.key;
          final child = entry.value;
          final itemChildren =
              (child is Map ? child['children'] as List? : null) ?? [];
          final prefix = isNumber ? '${i + 1}. ' : '\u2022 ';
          return Padding(
            padding: const EdgeInsets.only(bottom: 4, left: 16),
            child: RichText(
              text: TextSpan(
                children: [
                  TextSpan(text: prefix, style: baseStyle),
                  ..._buildInlineNodes(itemChildren, baseStyle),
                ],
                style:
                    (baseStyle ?? const TextStyle()).copyWith(height: 1.6),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // ── Inline nodes → InlineSpan ──

  static List<InlineSpan> _buildInlineNodes(
      List<dynamic> children, TextStyle? baseStyle) {
    final spans = <InlineSpan>[];
    for (final c in children) {
      final type = c is Map ? c['type']?.toString() ?? '' : '';

      switch (type) {
        case 'text':
          spans.add(_buildTextSpan(c, baseStyle));
          break;
        case 'linebreak':
          spans.add(const TextSpan(text: '\n'));
          break;
        case 'listitem':
          final itemChildren = c['children'] as List? ?? [];
          spans.addAll(_buildInlineNodes(itemChildren, baseStyle));
          break;
        default:
          if (c is Map && c['text'] != null) {
            spans.add(_buildTextSpan(c, baseStyle));
          }
          break;
      }
    }
    return spans;
  }

  static TextSpan _buildTextSpan(dynamic node, TextStyle? baseStyle) {
    final text = node['text']?.toString() ?? '';
    final format = node['format'] ?? 0;
    final flags = format is int ? format : 0;
    TextStyle s = baseStyle ?? const TextStyle();
    if (flags & 1 != 0) s = s.copyWith(fontWeight: FontWeight.bold);
    if (flags & 2 != 0) s = s.copyWith(fontStyle: FontStyle.italic);
    if (flags & 4 != 0) s = s.copyWith(decoration: TextDecoration.lineThrough);
    if (flags & 8 != 0) s = s.copyWith(decoration: TextDecoration.underline);
    if (flags & 16 != 0) {
      s = s.copyWith(
        fontFamily: 'monospace',
        fontSize: (s.fontSize ?? 14) - 1,
        background: Paint()..color = const Color(0xFFF5F5F5),
      );
    }
    return TextSpan(text: text, style: s);
  }
}
