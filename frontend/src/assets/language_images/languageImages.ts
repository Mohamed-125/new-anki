// Language images with URLs from Wikipedia and other free sources

export interface LanguageImage {
  name: string;
  flag: string;
  imageUrl: string;
  altText: string;
}

export const languageImages: LanguageImage[] = [
  {
    name: "English",
    flag: "🇺🇸",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg/1200px-Flag_of_the_United_Kingdom_%281-2%29.svg.png",
    altText: "English language - Union Jack flag",
  },
  {
    name: "Spanish",
    flag: "🇪🇸",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bandera_de_Espa%C3%B1a.svg/1200px-Bandera_de_Espa%C3%B1a.svg.png",
    altText: "Spanish language - Flag of Spain",
  },
  {
    name: "French",
    flag: "🇫🇷",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1200px-Flag_of_France.svg.png",
    altText: "French language - Flag of France",
  },
  {
    name: "German",
    flag: "🇩🇪",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/1200px-Flag_of_Germany.svg.png",
    altText: "German language - Flag of Germany",
  },
  {
    name: "Italian",
    flag: "🇮🇹",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/1200px-Flag_of_Italy.svg.png",
    altText: "Italian language - Flag of Italy",
  },
  {
    name: "Japanese",
    flag: "🇯🇵",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1200px-Flag_of_Japan.svg.png",
    altText: "Japanese language - Flag of Japan",
  },
  {
    name: "Chinese",
    flag: "🇨🇳",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/1200px-Flag_of_the_People%27s_Republic_of_China.svg.png",
    altText: "Chinese language - Flag of China",
  },
  {
    name: "Russian",
    flag: "🇷🇺",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/1200px-Flag_of_Russia.svg.png",
    altText: "Russian language - Flag of Russia",
  },
  {
    name: "Portuguese",
    flag: "🇵🇹",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/1200px-Flag_of_Portugal.svg.png",
    altText: "Portuguese language - Flag of Portugal",
  },
  {
    name: "Korean",
    flag: "🇰🇷",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/1200px-Flag_of_South_Korea.svg.png",
    altText: "Korean language - Flag of South Korea",
  },
  {
    name: "Arabic",
    flag: "🇸🇦",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/1200px-Flag_of_Saudi_Arabia.svg.png",
    altText: "Arabic language - Flag of Saudi Arabia",
  },
  {
    name: "Dutch",
    flag: "🇳🇱",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Flag_of_the_Netherlands.svg/1200px-Flag_of_the_Netherlands.svg.png",
    altText: "Dutch language - Flag of the Netherlands",
  },
  {
    name: "Hindi",
    flag: "🇮🇳",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png",
    altText: "Hindi language - Flag of India",
  },
  {
    name: "Turkish",
    flag: "🇹🇷",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1200px-Flag_of_Turkey.svg.png",
    altText: "Turkish language - Flag of Turkey",
  },
  {
    name: "Swedish",
    flag: "🇸🇪",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flag_of_Sweden.svg/1200px-Flag_of_Sweden.svg.png",
    altText: "Swedish language - Flag of Sweden",
  },
  {
    name: "Polish",
    flag: "🇵🇱",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Flag_of_Poland.svg/1200px-Flag_of_Poland.svg.png",
    altText: "Polish language - Flag of Poland",
  },
];

// Additional images for language learning concepts
export const learningImages = {
  conversation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Social_Network_Analysis_Visualization.png/800px-Social_Network_Analysis_Visualization.png",
  reading:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Biblioteca_Vasconcelos%2C_Ciudad_de_M%C3%A9xico_-_Biblioteca_Vasconcelos%2C_Mexico_City_%2839055238225%29.jpg/800px-Biblioteca_Vasconcelos%2C_Ciudad_de_M%C3%A9xico_-_Biblioteca_Vasconcelos%2C_Mexico_City_%2839055238225%29.jpg",
  writing:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Fountain_pen_writing_%28literacy%29.jpg/800px-Fountain_pen_writing_%28literacy%29.jpg",
  listening:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Headphones_1.jpg/800px-Headphones_1.jpg",
  vocabulary:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Metal_movable_type.jpg/800px-Metal_movable_type.jpg",
  grammar:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Grammatica_Latina.jpg/800px-Grammatica_Latina.jpg",
  pronunciation:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Gray1204.png/800px-Gray1204.png",
  culture:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Worldmap_location.svg/1200px-Worldmap_location.svg.png",
};

// Testimonial user images
export const testimonialImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Woman_1.jpg/800px-Woman_1.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Pierre-Person.jpg/800px-Pierre-Person.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/800px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg",
];
