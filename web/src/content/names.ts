/**
 * Prénoms que le dino sait reconnaître quand l'enfant se présente à voix haute
 * (prénoms fréquents en France, en Belgique, en Suisse et au Québec). Un prénom
 * absent de la liste n'est pas reconnu : le parent l'écrit dans le formulaire.
 */
export const FIRST_NAMES = [...new Set(`
léa emma jade louise alice chloé lina rose anna mia ambre julia mila léna inès zoé juliette lou agathe iris camille
manon sarah nina léonie charlotte lucie eva victoria romane margaux clara adèle jeanne valentine louna lola sofia
alba olivia luna gabrielle elena maëlys maya capucine elise céleste apolline marie lise héloïse joséphine diane
lily lilou nora sara salomé ava mathilde emmy liv alix margot noémie océane pauline justine laura marine aurore
charline julie noa giulia elsa thaïs maëlle constance philippine victoire suzanne garance louisa yasmine amira
lisa nour aya assia kenza maryam fatima sofia lyna ines mélina léana kiara mélissa naïa ninon olympe rosalie
sacha anaïs eden esther hanna hannah jasmine lana lucille madeleine maëva marion mélodie morgane myriam nadia
amandine aurélie émilie stella tessa violette zélie albane blanche cassandre clémence clémentine colombe eléonore
gabriel léo raphaël louis arthur jules maël lucas adam hugo noah liam gabin sacha nathan paul aaron mohamed
tom léon éthan ethan noé timéo théo nolan isaac mathis axel naël martin enzo marius tiago lenny victor antoine
samuel mathéo maxime clément baptiste alexandre simon thomas valentin oscar milo augustin eden ismaël robin
gaspard malo côme ayden rayan amir yanis ilyes elias aurélien bastien benjamin charles damien david diego
dylan émile eliott elliot erwan esteban evan félix florian gaël guillaume hector henri ibrahim ilan jean
jonas joseph kylian loïc lorenzo luca lukas malone marceau marin mattéo max maximilien mehdi nicolas noam
olivier pablo pierre quentin rafael romain ruben sami santiago stanislas sylvain tristan ulysse vincent william
yann youssef yusuf zacharie zakaria achille alban alexis andré antonin anatole auguste basile benoît
camille charlie emmanuel étienne fabien françois gabriel gustave hippolyte joachim josué jules justin
léandre léonard lino lou louison lyam marcel matthieu nael nils noa octave pierre-louis rémi solal swann
téo thibault timothée tony valentin wassim yassine youness zayn adrien arnaud cédric cyril denis éric frédéric
`.split(/\s+/).filter(Boolean))];
