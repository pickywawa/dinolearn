import 'package:go_router/go_router.dart';

import '../content/models.dart';
import '../games/series_controller.dart';
import '../screens/category_screen.dart';
import '../screens/game_screen.dart';
import '../screens/home_screen.dart';
import '../screens/pantry_screen.dart';
import '../screens/parents_screen.dart';
import '../screens/series_end_screen.dart';

GoRouter buildRouter() => GoRouter(
      routes: [
        GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
        GoRoute(
          path: '/category/:id',
          builder: (context, state) =>
              CategoryScreen(category: Category.fromId(state.pathParameters['id']!)),
        ),
        GoRoute(
          path: '/play/:gameId',
          builder: (context, state) => GameScreen(
            key: state.pageKey,
            gameId: state.pathParameters['gameId']!,
            mode: PlayMode.values.byName(state.uri.queryParameters['mode'] ?? 'targeted'),
          ),
        ),
        GoRoute(
          path: '/end',
          redirect: (context, state) => state.extra is SeriesResult ? null : '/',
          builder: (context, state) => SeriesEndScreen(result: state.extra! as SeriesResult),
        ),
        GoRoute(path: '/pantry', builder: (context, state) => const PantryScreen()),
        GoRoute(path: '/parents', builder: (context, state) => const ParentsScreen()),
      ],
    );
