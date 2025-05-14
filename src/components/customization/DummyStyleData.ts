import { Style } from "@/types/customization";

// Dummy style data with structure for testing grid layout and thumbnails
export const DUMMY_STYLES: Style[] = [
  {
    id: "realistic",
    name: "Realistic",
    description: "A true-to-life representation of your pet.",
    thumbnailUrl: "/placeholders/style-realistic.jpg",
    tags: ["portrait", "featured", "premium"]
  },
  {
    id: "cartoon",
    name: "Cartoon Fun",
    description: "A playful, animated version of your furry friend.",
    thumbnailUrl: "/placeholders/style-cartoon.jpg",
    tags: ["cartoon"]
  },
  {
    id: "watercolor",
    name: "Watercolor Dreams",
    description: "Soft, flowing colors create an artistic impression.",
    thumbnailUrl: "/placeholders/style-watercolor.jpg",
    tags: ["artistic"]
  },
  {
    id: "oil-painting",
    name: "Oil Painting Classic",
    description: "A timeless, textured oil painting look.",
    thumbnailUrl: "/placeholders/style-oil.jpg",
    tags: ["artistic", "premium"]
  },
  {
    id: "pop-art",
    name: "Pop Art Power",
    description: "Bold colors and iconic pop-art flair.",
    thumbnailUrl: "/placeholders/style-popart.jpg",
    tags: ["artistic"]
  },
  {
    id: "pencil-sketch",
    name: "Pencil Sketch",
    description: "A detailed and artistic pencil drawing.",
    thumbnailUrl: "/placeholders/style-sketch.jpg",
    tags: ["artistic"]
  },
  {
    id: "fantasy-art",
    name: "Fantasy Realm",
    description: "Transform your pet into a mythical creature.",
    thumbnailUrl: "/placeholders/style-fantasy.jpg",
    tags: ["fantasy", "premium"]
  },
  {
    id: "pixel-art",
    name: "Pixel Art",
    description: "Retro pixelated style reminiscent of classic video games.",
    thumbnailUrl: "/placeholders/style-pixel.jpg",
    tags: ["retro"]
  },
  {
    id: "comic-book",
    name: "Comic Book Hero",
    description: "Turn your pet into a comic book character.",
    thumbnailUrl: "/placeholders/style-comic.jpg",
    tags: ["cartoon"]
  },
  // Styles without thumbnails to test placeholder generation
  {
    id: "cyberpunk",
    name: "Cyberpunk Future",
    description: "Neon colors and futuristic vibes for your digital pet.",
    tags: ["futuristic"]
  },
  {
    id: "steampunk",
    name: "Steampunk Adventure",
    description: "Victorian-inspired mechanical aesthetic.",
    tags: ["fantasy"]
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, clean lines and limited color palette.",
    tags: ["modern"]
  }
]; 