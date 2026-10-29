import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'audio/voice_service.dart';
import 'content/content_repository.dart';
import 'core/router.dart';
import 'core/services.dart';
import 'core/theme.dart';
import 'progress/progress_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

  final voice = VoiceService();
  final results = await Future.wait([
    ContentRepository.load(rootBundle),
    ProgressRepository.load(),
    voice.init(),
  ]);
  final services = AppServices(
    content: results[0] as ContentRepository,
    progress: results[1] as ProgressRepository,
    voice: voice,
  );

  runApp(ProviderScope(
    overrides: [servicesProvider.overrideWithValue(services)],
    child: const DinoLearnApp(),
  ));
}

class DinoLearnApp extends StatefulWidget {
  const DinoLearnApp({super.key});

  @override
  State<DinoLearnApp> createState() => _DinoLearnAppState();
}

class _DinoLearnAppState extends State<DinoLearnApp> {
  final _router = buildRouter();

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'DinoLearn',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      routerConfig: _router,
    );
  }
}
