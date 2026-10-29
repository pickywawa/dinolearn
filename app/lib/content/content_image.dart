import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:http/http.dart' as http;

import 'content_repository.dart';

/// Cache disque dédié aux contenus téléchargés (spécifications §9.1).
class ContentCache {
  static final manager = CacheManager(Config(
    'dinolearn_content',
    stalePeriod: const Duration(days: 60),
    maxNrOfCacheObjects: 3000,
  ));

  static final _memory = <String, Future<Uint8List>>{};

  static Future<Uint8List> bytes(String url) => _memory.putIfAbsent(url, () async {
        try {
          if (kIsWeb) {
            // Sur le web, le cache HTTP du navigateur prend le relais.
            final response = await http.get(Uri.parse(url));
            if (response.statusCode != 200) throw Exception('HTTP ${response.statusCode}');
            return response.bodyBytes;
          }
          final file = await manager.getSingleFile(url);
          return await file.readAsBytes();
        } catch (_) {
          _memory.remove(url);
          rethrow;
        }
      });

  /// Désactivé dans les tests (pas de réseau ni de système de fichiers).
  static bool prefetchEnabled = true;

  /// Précharge les images de la série suivante en arrière-plan.
  static Future<void> prefetch(Iterable<String> keys) async {
    if (!prefetchEnabled) return;
    await Future.wait([
      for (final key in keys) bytes(ContentConfig.imageUrl(key)).catchError((_) => Uint8List(0)),
    ]);
  }
}

/// Image de contenu distante (non embarquée), mise en cache.
class ContentImage extends StatefulWidget {
  const ContentImage(this.imageKey, {super.key, this.size});

  final String imageKey;
  final double? size;

  @override
  State<ContentImage> createState() => _ContentImageState();
}

class _ContentImageState extends State<ContentImage> {
  late Future<Uint8List> _bytes;

  @override
  void initState() {
    super.initState();
    _bytes = ContentCache.bytes(ContentConfig.imageUrl(widget.imageKey));
  }

  @override
  void didUpdateWidget(ContentImage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.imageKey != widget.imageKey) {
      _bytes = ContentCache.bytes(ContentConfig.imageUrl(widget.imageKey));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.square(
      dimension: widget.size,
      child: FutureBuilder<Uint8List>(
        future: _bytes,
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return SvgPicture.memory(snapshot.data!, fit: BoxFit.contain);
          }
          if (snapshot.hasError) {
            return _Fallback(widget.imageKey);
          }
          return const Center(
            child: CircularProgressIndicator(strokeWidth: 3, color: Color(0x5571B84A)),
          );
        },
      ),
    );
  }
}

/// Si l'image n'est pas disponible (hors-ligne), on affiche l'emoji système.
class _Fallback extends StatelessWidget {
  const _Fallback(this.imageKey);

  final String imageKey;

  @override
  Widget build(BuildContext context) {
    final text = String.fromCharCodes(
        imageKey.split('-').map((hex) => int.parse(hex, radix: 16)));
    return FittedBox(child: Text(text, style: const TextStyle(fontSize: 64)));
  }
}

/// Icône d'interface embarquée (`assets/ui/`).
class UiIcon extends StatelessWidget {
  const UiIcon(this.code, {super.key, this.size = 48});

  final String code;
  final double size;

  @override
  Widget build(BuildContext context) =>
      SvgPicture.asset('assets/ui/$code.svg', width: size, height: size);
}
