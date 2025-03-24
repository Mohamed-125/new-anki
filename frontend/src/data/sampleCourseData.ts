import {
  CourseType,
  CourseSectionType,
  LessonType,
} from "../pages/Admin/AdminCourses";

export const sampleLessons: LessonType[] = [
  {
    _id: "lesson-1",
    name: "Greetings and Introductions",
    img: "https://images.unsplash.com/photo-1557425493-6f90ae4659fc",
    type: "lesson",
    description:
      "Learn essential German greetings and how to introduce yourself",
    courseLevel: [
      {
        name: "Sich Vorstellen Text",
        type: "text",
        content: "",
        _id: "1",
        // audio: "",
        // video: "",
      },
      {
        name: "Sich Vorstellen excercises",
        type: "excercises",
        content: "",
        _id: "2",

        // audio: "",
        // video: "",
      },
    ],
  },

  {
    _id: "lesson-2",
    name: "Numbers and Counting",
    img: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    type: "lesson",
    content: {},
    description: "Master German numbers and counting systems",
  },
  {
    _id: "revision-1",
    name: "Unit 1 Review",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    type: "revision",
    content: {},
    description: "Comprehensive review of Unit 1 materials",
  },
  {
    _id: "exam-1",
    name: "A1 Assessment",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    content: {},
    type: "exam",
    description: "Complete assessment of A1 level materials",
  },
];

export const sampleSections: CourseSectionType[] = [
  {
    _id: "courseLevel-1",
    name: "A1 - Beginner",
    img: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
    description: "Basic German language fundamentals",
  },
  {
    _id: "courseLevel-2",
    name: "A2 - Elementary",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
    description: "Building basic conversation skills",
  },
  {
    _id: "courseLevel-3",
    name: "B1 - Intermediate",
    img: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e",
    description: "Developing fluency and comprehension",
  },
];

export const sampleCourses: CourseType[] = [
  {
    name: "German Language Course",
    language: "de",
    _id: "german-a1-course",
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Flag_of_Germany.svg/1280px-Flag_of_Germany.svg.png",
    courseLevel: sampleSections[0],
  },
  {
    name: "Spanish Language Course",
    language: "es",
    _id: "spanish-a1-course",
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Flag_of_Spain.svg/1280px-Flag_of_Spain.svg.png",
    courseLevel: sampleSections[0],
  },
  {
    name: "French Language Course",
    language: "fr",
    _id: "french-a1-course",
    flag: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/Flag_of_France.svg/1280px-Flag_of_France.svg.png",
    courseLevel: sampleSections[0],
  },
];

export const sampleCourse = sampleCourses[0];
