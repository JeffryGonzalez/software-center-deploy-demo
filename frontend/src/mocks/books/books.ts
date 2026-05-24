import { http, HttpHandler, HttpResponse, delay } from 'msw';
import activeScenarios from '../active-scenarios';

const ENDPOINT = '/api/books';

type Book = {
  id: number;
  title: string;
  author: string;
  country: string;
  language: string;
  pages: number;
  year: number;
  link: string;
  imageLink: string;
};

// A fixed corpus of classic books — drawn from the public-domain BBC "100 Books" list.
const corpus: Omit<Book, 'id' | 'link' | 'imageLink'>[] = [
  { title: 'Things Fall Apart', author: 'Chinua Achebe', country: 'Nigeria', language: 'English', pages: 209, year: 1958 },
  { title: 'Fairy tales', author: 'Hans Christian Andersen', country: 'Denmark', language: 'Danish', pages: 784, year: 1836 },
  { title: 'The Divine Comedy', author: 'Dante Alighieri', country: 'Italy', language: 'Italian', pages: 928, year: 1315 },
  { title: 'The Epic Of Gilgamesh', author: 'Unknown', country: 'Sumer and Akkadian Empire', language: 'Akkadian', pages: 160, year: -1700 },
  { title: 'The Book Of Job', author: 'Unknown', country: 'Achaemenid Empire', language: 'Hebrew', pages: 176, year: -600 },
  { title: 'One Thousand and One Nights', author: 'Various', country: 'Indian/Iranian/Iraqi/Egyptian/Tajik', language: 'Arabic', pages: 288, year: 1200 },
  { title: 'Njál\'s Saga', author: 'Unknown', country: 'Iceland', language: 'Old Norse', pages: 384, year: 1350 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', country: 'United Kingdom', language: 'English', pages: 226, year: 1813 },
  { title: 'Le Père Goriot', author: 'Honoré de Balzac', country: 'France', language: 'French', pages: 443, year: 1835 },
  { title: 'Molloy, Malone Dies, The Unnamable, the trilogy', author: 'Samuel Beckett', country: 'Republic of Ireland', language: 'French, English', pages: 256, year: 1952 },
  { title: 'The Decameron', author: 'Giovanni Boccaccio', country: 'Italy', language: 'Italian', pages: 1024, year: 1351 },
  { title: 'Ficciones', author: 'Jorge Luis Borges', country: 'Argentina', language: 'Spanish', pages: 224, year: 1965 },
  { title: 'Wuthering Heights', author: 'Emily Brontë', country: 'United Kingdom', language: 'English', pages: 342, year: 1847 },
  { title: 'The Stranger', author: 'Albert Camus', country: 'Algeria, French Empire', language: 'French', pages: 185, year: 1942 },
  { title: 'Poems', author: 'Paul Celan', country: 'Romania, France', language: 'German', pages: 320, year: 1952 },
  { title: 'Journey to the End of the Night', author: 'Louis-Ferdinand Céline', country: 'France', language: 'French', pages: 505, year: 1932 },
  { title: 'Don Quijote De La Mancha', author: 'Miguel de Cervantes', country: 'Spain', language: 'Spanish', pages: 1056, year: 1610 },
  { title: 'The Canterbury Tales', author: 'Geoffrey Chaucer', country: 'England', language: 'English', pages: 544, year: 1450 },
  { title: 'Stories', author: 'Anton Chekhov', country: 'Russia', language: 'Russian', pages: 194, year: 1886 },
  { title: 'Nostromo', author: 'Joseph Conrad', country: 'United Kingdom', language: 'English', pages: 320, year: 1904 },
  { title: 'Great Expectations', author: 'Charles Dickens', country: 'United Kingdom', language: 'English', pages: 194, year: 1861 },
  { title: 'Jacques the Fatalist', author: 'Denis Diderot', country: 'France', language: 'French', pages: 596, year: 1796 },
  { title: 'Berlin Alexanderplatz', author: 'Alfred Döblin', country: 'Germany', language: 'German', pages: 600, year: 1929 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 551, year: 1866 },
  { title: 'The Idiot', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 656, year: 1869 },
  { title: 'The Possessed', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 768, year: 1872 },
  { title: 'The Brothers Karamazov', author: 'Fyodor Dostoevsky', country: 'Russia', language: 'Russian', pages: 824, year: 1880 },
  { title: 'Middlemarch', author: 'George Eliot', country: 'United Kingdom', language: 'English', pages: 800, year: 1871 },
  { title: 'Invisible Man', author: 'Ralph Ellison', country: 'United States', language: 'English', pages: 581, year: 1952 },
  { title: 'Medea', author: 'Euripides', country: 'Greece', language: 'Greek', pages: 104, year: -431 },
  { title: 'Absalom, Absalom!', author: 'William Faulkner', country: 'United States', language: 'English', pages: 313, year: 1936 },
  { title: 'The Sound and the Fury', author: 'William Faulkner', country: 'United States', language: 'English', pages: 326, year: 1929 },
  { title: 'Madame Bovary', author: 'Gustave Flaubert', country: 'France', language: 'French', pages: 528, year: 1857 },
  { title: 'Sentimental Education', author: 'Gustave Flaubert', country: 'France', language: 'French', pages: 606, year: 1869 },
  { title: 'Gypsy Ballads', author: 'Federico García Lorca', country: 'Spain', language: 'Spanish', pages: 218, year: 1928 },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', country: 'Colombia', language: 'Spanish', pages: 417, year: 1967 },
  { title: 'Love in the Time of Cholera', author: 'Gabriel García Márquez', country: 'Colombia', language: 'Spanish', pages: 368, year: 1985 },
  { title: 'Faust', author: 'Johann Wolfgang von Goethe', country: 'Saxe-Weimar', language: 'German', pages: 158, year: 1832 },
  { title: 'Dead Souls', author: 'Nikolai Gogol', country: 'Russia', language: 'Russian', pages: 432, year: 1842 },
  { title: 'The Tin Drum', author: 'Günter Grass', country: 'Germany', language: 'German', pages: 600, year: 1959 },
  { title: 'The Devil to Pay in the Backlands', author: 'João Guimarães Rosa', country: 'Brazil', language: 'Portuguese', pages: 494, year: 1956 },
  { title: 'Hunger', author: 'Knut Hamsun', country: 'Norway', language: 'Norwegian', pages: 176, year: 1890 },
  { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', country: 'United States', language: 'English', pages: 128, year: 1952 },
  { title: 'Iliad', author: 'Homer', country: 'Greece', language: 'Greek', pages: 608, year: -735 },
  { title: 'Odyssey', author: 'Homer', country: 'Greece', language: 'Greek', pages: 374, year: -800 },
  { title: 'A Doll\'s House', author: 'Henrik Ibsen', country: 'Norway', language: 'Norwegian', pages: 68, year: 1879 },
  { title: 'The Ramayana', author: 'Valmiki', country: 'India', language: 'Sanskrit', pages: 152, year: -450 },
  { title: 'The Mahabharata', author: 'Vyasa', country: 'India', language: 'Sanskrit', pages: 276, year: -700 },
  { title: 'Ulysses', author: 'James Joyce', country: 'Republic of Ireland', language: 'English', pages: 228, year: 1922 },
  { title: 'The Trial', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 160, year: 1925 },
  { title: 'The Castle', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 352, year: 1926 },
  { title: 'Complete Stories', author: 'Franz Kafka', country: 'Czechoslovakia', language: 'German', pages: 488, year: 1924 },
  { title: 'The recognition of Sakuntala', author: 'Kālidāsa', country: 'India', language: 'Sanskrit', pages: 147, year: 150 },
  { title: 'The Sound of the Mountain', author: 'Yasunari Kawabata', country: 'Japan', language: 'Japanese', pages: 288, year: 1954 },
  { title: 'Zorba the Greek', author: 'Nikos Kazantzakis', country: 'Greece', language: 'Greek', pages: 368, year: 1946 },
  { title: 'Sons and Lovers', author: 'D. H. Lawrence', country: 'United Kingdom', language: 'English', pages: 432, year: 1913 },
  { title: 'Independent People', author: 'Halldór Laxness', country: 'Iceland', language: 'Icelandic', pages: 470, year: 1934 },
  { title: 'Poems', author: 'Giacomo Leopardi', country: 'Italy', language: 'Italian', pages: 184, year: 1818 },
  { title: 'The Golden Notebook', author: 'Doris Lessing', country: 'United Kingdom', language: 'English', pages: 688, year: 1962 },
  { title: 'Pippi Longstocking', author: 'Astrid Lindgren', country: 'Sweden', language: 'Swedish', pages: 160, year: 1945 },
  { title: 'Diary of a Madman', author: 'Lu Xun', country: 'China', language: 'Chinese', pages: 389, year: 1918 },
  { title: 'Children of Gebelawi', author: 'Naguib Mahfouz', country: 'Egypt', language: 'Arabic', pages: 355, year: 1959 },
  { title: 'Buddenbrooks', author: 'Thomas Mann', country: 'Germany', language: 'German', pages: 736, year: 1901 },
  { title: 'The Magic Mountain', author: 'Thomas Mann', country: 'Germany', language: 'German', pages: 720, year: 1924 },
  { title: 'Moby Dick', author: 'Herman Melville', country: 'United States', language: 'English', pages: 378, year: 1851 },
  { title: 'Essays', author: 'Michel de Montaigne', country: 'France', language: 'French', pages: 404, year: 1595 },
  { title: 'History', author: 'Elsa Morante', country: 'Italy', language: 'Italian', pages: 600, year: 1974 },
  { title: 'Beloved', author: 'Toni Morrison', country: 'United States', language: 'English', pages: 321, year: 1987 },
  { title: 'The Tale of Genji', author: 'Murasaki Shikibu', country: 'Japan', language: 'Japanese', pages: 1360, year: 1006 },
  { title: 'The Man Without Qualities', author: 'Robert Musil', country: 'Austria', language: 'German', pages: 1774, year: 1930 },
  { title: 'Lolita', author: 'Vladimir Nabokov', country: 'Russia/United States', language: 'English', pages: 317, year: 1955 },
  { title: 'Nineteen Eighty-Four', author: 'George Orwell', country: 'United Kingdom', language: 'English', pages: 272, year: 1949 },
  { title: 'The Book of Disquiet', author: 'Fernando Pessoa', country: 'Portugal', language: 'Portuguese', pages: 277, year: 1928 },
  { title: 'Tales', author: 'Edgar Allan Poe', country: 'United States', language: 'English', pages: 842, year: 1950 },
  { title: 'In Search of Lost Time', author: 'Marcel Proust', country: 'France', language: 'French', pages: 4211, year: 1920 },
  { title: 'Gargantua and Pantagruel', author: 'François Rabelais', country: 'France', language: 'French', pages: 623, year: 1533 },
  { title: 'Pedro Páramo', author: 'Juan Rulfo', country: 'Mexico', language: 'Spanish', pages: 124, year: 1955 },
  { title: 'The Masnavi', author: 'Rumi', country: 'Persia, Persian Empire', language: 'Persian', pages: 438, year: 1236 },
  { title: 'Midnight\'s Children', author: 'Salman Rushdie', country: 'United Kingdom, India', language: 'English', pages: 536, year: 1981 },
  { title: 'Bostan', author: 'Saadi', country: 'Persia, Persian Empire', language: 'Persian', pages: 298, year: 1257 },
  { title: 'Season of Migration to the North', author: 'Tayeb Salih', country: 'Sudan', language: 'Arabic', pages: 139, year: 1966 },
  { title: 'Blindness', author: 'José Saramago', country: 'Portugal', language: 'Portuguese', pages: 352, year: 1995 },
  { title: 'Hamlet', author: 'William Shakespeare', country: 'England', language: 'English', pages: 432, year: 1603 },
  { title: 'King Lear', author: 'William Shakespeare', country: 'England', language: 'English', pages: 384, year: 1608 },
  { title: 'Othello', author: 'William Shakespeare', country: 'England', language: 'English', pages: 314, year: 1609 },
  { title: 'Oedipus the King', author: 'Sophocles', country: 'Greece', language: 'Greek', pages: 88, year: -430 },
  { title: 'The Red and the Black', author: 'Stendhal', country: 'France', language: 'French', pages: 576, year: 1830 },
  { title: 'The Life and Opinions of Tristram Shandy, Gentleman', author: 'Laurence Sterne', country: 'United Kingdom', language: 'English', pages: 640, year: 1760 },
  { title: 'Confessions of Zeno', author: 'Italo Svevo', country: 'Italy', language: 'Italian', pages: 412, year: 1923 },
  { title: 'Gulliver\'s Travels', author: 'Jonathan Swift', country: 'Republic of Ireland', language: 'English', pages: 178, year: 1726 },
  { title: 'Anna Karenina', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 864, year: 1877 },
  { title: 'War and Peace', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 1296, year: 1867 },
  { title: 'The Death of Ivan Ilyich', author: 'Leo Tolstoy', country: 'Russia', language: 'Russian', pages: 86, year: 1886 },
  { title: 'The Adventures of Huckleberry Finn', author: 'Mark Twain', country: 'United States', language: 'English', pages: 366, year: 1884 },
  { title: 'Ramayana', author: 'Tulsidas', country: 'India', language: 'Awadhi', pages: 1248, year: 1575 },
  { title: 'The Aeneid', author: 'Virgil', country: 'Roman Republic', language: 'Classical Latin', pages: 442, year: -23 },
  { title: 'Mahabharata', author: 'Vyasa', country: 'India', language: 'Sanskrit', pages: 768, year: -300 },
  { title: 'Leaves of Grass', author: 'Walt Whitman', country: 'United States', language: 'English', pages: 152, year: 1855 },
  { title: 'Mrs Dalloway', author: 'Virginia Woolf', country: 'United Kingdom', language: 'English', pages: 216, year: 1925 },
  { title: 'To the Lighthouse', author: 'Virginia Woolf', country: 'United Kingdom', language: 'English', pages: 209, year: 1927 },
  { title: 'Memoirs of Hadrian', author: 'Marguerite Yourcenar', country: 'France/Belgium', language: 'French', pages: 408, year: 1951 },
];

const books: Book[] = corpus.map((b, i) => ({
  id: i + 1,
  ...b,
  link: `https://en.wikipedia.org/wiki/${encodeURIComponent(b.title.replace(/\s+/g, '_'))}`,
  imageLink: `https://picsum.photos/seed/book-${i + 1}/240/360`,
}));

export default [
  http.get(ENDPOINT, async () => {
    const scenario = activeScenarios[`GET ${ENDPOINT}`] ?? 'typical';

    switch (scenario) {
      case 'empty':
        return HttpResponse.json([]);

      case 'slow':
        await delay(1000);
        return HttpResponse.json(books);

      case 'server-error':
        return new HttpResponse(null, { status: 500 });

      case 'typical':
      default:
        return HttpResponse.json(books);
    }
  }),
] as HttpHandler[];
