import type { Track } from "../components/music-player/types";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tracks: Track[];
}

export interface Category {
  label: string;
  projects: Project[];
}

const mediaBaseUrl = "https://shane-portfolio-media.eising.net";
const mediaSrc = (path: string) => `${mediaBaseUrl}${path}`;

export const portfolioCategories: Category[] = [
  {
    label: "Musicals",
    projects: [
      {
        id: "songs-from-west-egg",
        title: "Songs From West Egg",
        description: "A Gatsby-inspired song-cycle.",
        longDescription:
          "The classic myth is recounted in a minimalist take on America's greatest story.",
        tracks: [
          {
            title: "Under the Red, White, and Blue",
            src: mediaSrc("/audio/songs-from-west-egg/1.mp3"),
          },
          {
            title: "The Valley of Ashes",
            src: mediaSrc("/audio/songs-from-west-egg/2.mp3"),
          },
          {
            title: "Reaching Out",
            src: mediaSrc("/audio/songs-from-west-egg/3.mp3"),
          },
          {
            title: "Oranges and Lemons",
            src: mediaSrc("/audio/songs-from-west-egg/4.mp3"),
          },
          {
            title: "The Ballad of Daisy Fay",
            src: mediaSrc("/audio/songs-from-west-egg/5.mp3"),
          },
          {
            title: "Nobody's Coming to Tea",
            src: mediaSrc("/audio/songs-from-west-egg/6.mp3"),
          },
          {
            title: "Dreamsong",
            src: mediaSrc("/audio/songs-from-west-egg/7.mp3"),
          },
          {
            title: "Rumors",
            src: mediaSrc("/audio/songs-from-west-egg/8.mp3"),
          },
          {
            title: "Gatz",
            src: mediaSrc("/audio/songs-from-west-egg/9.mp3"),
          },
          {
            title: "Confrontation",
            src: mediaSrc("/audio/songs-from-west-egg/10.mp3"),
          },
          {
            title: "Home",
            src: mediaSrc("/audio/songs-from-west-egg/11.mp3"),
          },
          {
            title: "Valley (Reprise)",
            src: mediaSrc("/audio/songs-from-west-egg/12.mp3"),
          },
          {
            title: "The Light",
            src: mediaSrc("/audio/songs-from-west-egg/13.mp3"),
          },
          {
            title: "To Live and Die, By The American Dream",
            src: mediaSrc("/audio/songs-from-west-egg/14.mp3"),
          },
        ],
      },
      {
        id: "the-ship-show",
        title: "The Ship Show (IN PROGRESS)",
        description:
          "A chamber musical chronicling an 18th-century packet service.",
        longDescription:
          "Six men are tested and discover hard truths about themselves and each other.",
        tracks: [
          {
            title: "Words Fall Short",
            src: mediaSrc("/audio/the-ship-show/words_fall_short.mp3"),
          },
          {
            title: "The Firmament",
            src: mediaSrc("/audio/the-ship-show/the_firmament.mp3"),
          },
          {
            title: "Run Away (I Was Born To)",
            src: mediaSrc("/audio/the-ship-show/run_away.mp3"),
          },
          {
            title: "Amelia",
            src: mediaSrc("/audio/the-ship-show/amelia.mp3"),
          },
          {
            title: "The Line (I Feel Fine)",
            src: mediaSrc("/audio/the-ship-show/the_line.mp3"),
          },
        ],
      },
    ],
  },
  {
    label: "Video Games",
    projects: [
      {
        id: "froggy-mail",
        title: "Froggy Mail",
        description: "A game about mail.",
        longDescription:
          "Composer, Developer - An anthropomorphic frog takes his time to deliver packages to the residents of his idyllic animal town.",
        tracks: [
          {
            title: "Snow",
            src: mediaSrc("/audio/froggy-mail/snow.mp3"),
          },
          {
            title: "The 5/4 Mail Delivery Waltz",
            src: mediaSrc("/audio/froggy-mail/the_5_4_mail_delivery_waltz.mp3"),
          },
          {
            title: "Tropical Freeway 2.0",
            src: mediaSrc("/audio/froggy-mail/tropical_freeway%202.0.mp3"),
          },
        ],
      },
      {
        id: "compuquest9000",
        title: "CompuQuest9000",
        description: "A game about old computers.",
        longDescription:
          "Composer, Designer, Developer - Take control of the M.O.U.S.E. and fight back against the ghosts of computing past.",
        tracks: [],
      },
    ],
  },
  {
    label: "MISC.",
    projects: [
      {
        id: "miscellaneous",
        title: "Miscellaneous",
        description: "The junk drawer.",
        longDescription:
          "Assorted one-offs, incomplete projects, side-quests, and digressions.",
        tracks: [
          {
            title: "Sisyphus, The Spiral",
            src: mediaSrc("/audio/misc/Sisyphus_The_Spiral.mp3"),
          },
        ],
      },
    ],
  },
];
