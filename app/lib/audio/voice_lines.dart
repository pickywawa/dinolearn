import 'dart:math';

/// Répliques du dino en français (spécifications §17.2).
///
/// Prototype : textes lus par la synthèse vocale du système. En V1, chaque
/// variante devient un fichier audio enregistré (clé `groupe.index`).
const frenchLines = <String, List<String>>{
  'welcome': [
    'Coucou ! Tu m\'as manqué !',
    'Te revoilà ! On joue ensemble ?',
    'Youpi, te voilà !',
    'Bonjour ! J\'avais hâte de te voir !',
    'Ah, te voilà ! On s\'amuse ?',
  ],
  'home_choose': [
    'Choisis une île !',
    'Où est-ce qu\'on va aujourd\'hui ?',
    'Touche une île pour jouer !',
    'Alors, quelle île on visite ?',
  ],
  'island.foreign_language': ['L\'île de l\'anglais !'],
  'island.native_language': ['L\'île du français !'],
  'island.logic': ['L\'île de la logique !'],
  'island.world': ['L\'île du monde !'],
  'island.soon': [
    'Cette île est encore en construction ! Essaie l\'île de l\'anglais !',
    'Chut, on construit encore cette île ! Va voir l\'île de l\'anglais !',
  ],
  'category_choose': [
    'Touche un jeu !',
    'À quoi on joue ?',
    'Choisis un jeu !',
  ],
  'game.listen_tap.intro': [
    'Écoute bien le mot anglais, et touche la bonne image !',
    'Je vais dire un mot en anglais. Trouve la bonne image !',
  ],
  'game.listen_tap.title': ['Écoute et touche !'],
  'game.soon': ['Ce jeu arrive bientôt !'],
  'surprise': ['Surprise ! On joue à ça !', 'Le dé a choisi ! C\'est parti !'],
  'correct': [
    'Bravo !',
    'Exactement !',
    'Trop fort !',
    'Tu as l\'œil !',
    'Super, c\'est ça !',
    'Bien joué !',
    'Ouiii !',
    'Génial !',
  ],
  'wrong': [
    'Presque ! Essaie encore.',
    'Hmm, regarde bien…',
    'Pas celui-là, mais tu vas trouver !',
    'Oups ! Encore un essai !',
    'Ce n\'est pas grave, cherche encore !',
  ],
  'hint': [
    'Je t\'aide : c\'est celui qui brille !',
    'Regarde, celui qui brille !',
  ],
  'streak': ['Et de trois ! Tu es en feu !', 'Trois d\'affilée ! Incroyable !'],
  'idle': [
    'Tu es toujours là ?',
    'Je t\'attends…',
    'Écoute encore !',
  ],
  'review_mode': ['Tu connais déjà tout ici ! On révise tes champions ?'],
  'series_perfect': [
    'Waouh, tout juste ! Tu es une vraie star !',
    'Sans faute ! Je danse de joie !',
    'Parfait ! Bravo l\'artiste !',
  ],
  'series_great': [
    'Incroyable ! Presque tout juste !',
    'Quel talent !',
  ],
  'series_good': [
    'Très bien joué ! Tu progresses vite !',
    'Bravo, tu en as trouvé plein !',
    'Bien joué ! Tu progresses !',
  ],
  'series_ok': [
    'Bien joué ! On continue à s\'entraîner ensemble ?',
    'C\'est bien ! Chaque partie te fait progresser !',
  ],
  'series_encourage': [
    'C\'était difficile, hein ? Moi aussi j\'apprends ! On réessaie ?',
    'Chaque fois, ton cerveau devient plus fort !',
    'Ce n\'est pas grave ! On apprend en jouant !',
  ],
  'reward': [
    'Regarde tout ce que tu as gagné !',
    'Miam, ça a l\'air bon !',
    'Oh ! Des bonnes choses à manger !',
  ],
  'continue_ask': ['On en refait une ?', 'Encore une partie ?'],
  'feed_ask': [
    'J\'ai un petit creux… tu me donnes à manger ?',
    'Donne-moi à manger ! Touche un fruit !',
  ],
  'feed_empty': [
    'Le panier est vide ! Joue pour gagner à manger !',
  ],
  'eating': ['Miam miam !', 'Croc ! Délicieux !', 'Encore, s\'il te plaît !', 'Hmmm, c\'est bon !'],
  'full': ['J\'ai le ventre tout plein ! On garde le reste pour demain ?'],
  'level_up': [
    'Oh ! Je grandis ! Merci de bien t\'occuper de moi !',
    'Regarde, je suis plus grand !',
  ],
  'tickle': ['Hihi, ça chatouille !', 'Hahaha ! Arrête !', 'Hihihi !'],
  'parents': ['C\'est le coin des grands !'],
};

/// Choisit une variante en évitant de répéter les dernières (spécifications §3.4).
class VoiceLinePicker {
  VoiceLinePicker({Random? random, this.lines = frenchLines}) : _random = random ?? Random();

  final Random _random;
  final Map<String, List<String>> lines;
  final _history = <String, List<int>>{};

  String pick(String group) {
    final variants = lines[group];
    if (variants == null || variants.isEmpty) return '';
    final history = _history[group] ??= [];
    final avoid = history.take(min(5, variants.length - 1)).toSet();
    final allowed = [
      for (var i = 0; i < variants.length; i++)
        if (!avoid.contains(i)) i,
    ];
    final index = allowed[_random.nextInt(allowed.length)];
    history.insert(0, index);
    if (history.length > 5) history.removeLast();
    return variants[index];
  }
}
