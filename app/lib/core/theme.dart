import 'package:flutter/material.dart';

import '../content/models.dart';

class DinoColors {
  static const sky = Color(0xFFBFE6FF);
  static const skyLow = Color(0xFFE8F7FF);
  static const grass = Color(0xFF9AD66B);
  static const grassDark = Color(0xFF6DB143);
  static const sand = Color(0xFFFFE3A3);
  static const playGreen = Color(0xFF43B649);
  static const sun = Color(0xFFFFD23F);

  /// Code couleur constant par catégorie (spécifications §4.3).
  static Color category(Category c) => switch (c) {
        Category.foreignLanguage => const Color(0xFF3D8BFD),
        Category.nativeLanguage => const Color(0xFFE5484D),
        Category.logic => const Color(0xFF8E4EC6),
        Category.world => const Color(0xFF30A46C),
      };
}

/// Emblème de chaque île (icône embarquée).
String categoryIcon(Category c) => switch (c) {
      Category.foreignLanguage => '1f1ec-1f1e7',
      Category.nativeLanguage => '1f524',
      Category.logic => '1f9e9',
      Category.world => '1f30d',
    };

ThemeData buildTheme() => ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: DinoColors.playGreen),
      scaffoldBackgroundColor: DinoColors.sky,
      fontFamily: 'Roboto',
    );
