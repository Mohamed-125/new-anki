import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import {
  User,
  BookOpen,
  Trophy,
  Activity,
  Calendar,
  Target,
  Award,
  Medal,
  Star,
  Info,
} from "lucide-react";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import Button from "./Button";
import { motion } from "framer-motion";

// Helper functions for achievement badges
const getBadgeColor = (reward: string) => {
  switch (reward) {
    case "Platinum Badge":
      return "bg-gradient-to-r from-purple-200 to-purple-100";
    case "Gold Badge":
      return "bg-gradient-to-r from-yellow-200 to-yellow-100";
    case "Silver Badge":
      return "bg-gradient-to-r from-gray-200 to-gray-100";
    case "Bronze Badge":
      return "bg-gradient-to-r from-orange-200 to-orange-100";
    default:
      return "bg-gray-100";
  }
};

const getBadgeIcon = (reward: string) => {
  switch (reward) {
    case "Platinum Badge":
      return <Star className="w-4 h-4 text-purple-600" />;
    case "Gold Badge":
      return <Award className="w-4 h-4 text-yellow-600" />;
    case "Silver Badge":
      return <Medal className="w-4 h-4 text-gray-600" />;
    case "Bronze Badge":
      return <Trophy className="w-4 h-4 text-orange-600" />;
    default:
      return null;
  }
};

// Define interfaces
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  languages: Language[];
  achievements: Achievement[];
  stats: UserStats;
}

interface Language {
  name: string;
  code: string;
  fluencyLevel: number;
  wordsLearned: number;
  goal: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  isCompleted: boolean;
}

// Update the UserStats interface to include the streak-related fields
interface UserStats {
  streak: number;
  totalWords: number;
  activeDays: number;
  weeklyProgress: DailyProgress[];
}

interface DailyProgress {
  date: string;
  wordsLearned: number;
}

// Dummy data
const dummyProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
  languages: [
    {
      name: "German",
      code: "de",
      fluencyLevel: 60,
      wordsLearned: 480,
      goal: 1000,
    },
    {
      name: "Spanish",
      code: "es",
      fluencyLevel: 30,
      wordsLearned: 240,
      goal: 1000,
    },
    {
      name: "French",
      code: "fr",
      fluencyLevel: 45,
      wordsLearned: 320,
      goal: 1000,
    },
  ],
  achievements: [
    {
      id: "1",
      title: "Word Master",
      description: "Learn 500 words in a language",
      icon: "🎯",
      progress: 80,
      isCompleted: true,
      category: "Vocabulary",
      reward: "Gold Badge",
    },
    {
      id: "2",
      title: "Streak Champion",
      description: "Maintain a 30-day learning streak",
      icon: "🔥",
      progress: 60,
      isCompleted: false,
      category: "Consistency",
      reward: "Silver Badge",
    },
    {
      id: "3",
      title: "Grammar Guru",
      description: "Complete all grammar lessons",
      icon: "📚",
      progress: 40,
      isCompleted: false,
      category: "Grammar",
      reward: "Bronze Badge",
    },
    {
      id: "4",
      title: "Vocabulary Explorer",
      description: "Learn words across multiple categories",
      icon: "🌟",
      progress: 100,
      isCompleted: true,
      category: "Vocabulary",
      reward: "Platinum Badge",
    },
    {
      id: "5",
      title: "Perfect Pronunciation",
      description: "Complete 50 speaking exercises",
      icon: "🎤",
      progress: 75,
      isCompleted: false,
      category: "Speaking",
      reward: "Gold Badge",
    },
    {
      id: "6",
      title: "Writing Expert",
      description: "Write 20 essays in target language",
      icon: "✍️",
      progress: 90,
      isCompleted: true,
      category: "Writing",
      reward: "Gold Badge",
    },
  ],
  stats: {
    streak: 7,
    totalWords: 720,
    activeDays: 40,
    weeklyProgress: [
      { date: "Mon", wordsLearned: 15 },
      { date: "Tue", wordsLearned: 8 },
      { date: "Wed", wordsLearned: 12 },
      { date: "Thu", wordsLearned: 10 },
      { date: "Fri", wordsLearned: 20 },
      { date: "Sat", wordsLearned: 25 },
      { date: "Sun", wordsLearned: 14 },
    ],
  },
};

// API function to fetch user profile data
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // If we have a real API endpoint, we would use it here
  // For now, we'll use the dummy data but enhance it with real user data from getCurrentUser
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyProfile), 500);
  });
};

const SetProfile = () => {
  const { user } = useGetCurrentUser();
  const userId = user?._id || "1";
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("de");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [previewAchievement, setPreviewAchievement] =
    useState<Achievement | null>(null);
  const [userLoginDates, setUserLoginDates] = useState<Date[]>([]);

  // Helper function to generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get calendar days for the selected month
  const calendarDays = getDaysInMonth(selectedMonth);

  // Parse the lastLoginDate from user data
  useEffect(() => {
    if (user?.lastLoginDate) {
      console.log(user);
      // For demonstration, let's create some login dates around the last login date
      const lastLogin = new Date(user.lastLoginDate);
      const loginDates = [lastLogin];

      setUserLoginDates(loginDates);
    }
  }, [user]);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchUserProfile(userId),
  });

  const filteredAchievements =
    profile?.achievements.filter(
      (achievement) =>
        achievement.category ===
        profile?.languages.find((lang) => lang.code === selectedLanguage)?.name
    ) || [];

  if (isLoading) return <div className="p-4">Loading profile...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading profile</div>;
  if (!profile) return <div className="p-4">No profile data found</div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex gap-6 items-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="object-cover w-24 h-24 rounded-full border-2 border-blue-500"
          />
          <div className="absolute right-0 bottom-0 p-1 text-white bg-blue-500 rounded-full">
            <User size={16} />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="text-gray-600">{profile.email}</p>
          <div className="flex gap-2 mt-4">
            <Button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex mb-6 border-b">
          <TabsTrigger
            value="overview"
            className="px-4 sm:px-2 sm:text-base    py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="px-4  sm:px-2 sm:text-base  py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            Achievements
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="px-4  sm:px-2 sm:text-base  py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Language Progress */}
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
            {profile.languages.map((language) => (
              <div
                key={language.code}
                className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{language.name}</h3>
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="text-blue-500 stroke-current"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${
                          (language.fluencyLevel / 100) * 175.93
                        } 175.93`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="flex absolute inset-0 justify-center items-center text-sm font-semibold">
                      {language.fluencyLevel}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Words Learned</span>
                    <span className="font-semibold">
                      {language.wordsLearned}
                    </span>
                  </div>
                  <div className="overflow-hidden w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          (language.wordsLearned / language.goal) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Goal: {language.goal}</span>
                    <span>
                      {Math.round(
                        (language.wordsLearned / language.goal) * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="p-2 text-blue-500 bg-blue-100 rounded-lg">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-xl font-bold">
                    {profile.stats.streak} days
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="p-2 text-green-500 bg-green-100 rounded-lg">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Days</p>
                  <p className="text-xl font-bold">
                    {user?.activeDays || profile.stats.activeDays} days
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="p-2 text-purple-500 bg-purple-100 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Words</p>
                  <p className="text-xl font-bold">
                    {profile.stats.totalWords}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex gap-3 items-center">
                <div className="p-2 text-yellow-500 bg-yellow-100 rounded-lg">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Goal</p>
                  <p className="text-xl font-bold">20 words</p>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="p-6 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <div className="flex gap-3 items-center">
                <div className="p-3 text-orange-500 bg-orange-100 rounded-lg">
                  <Activity size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Learning Streak</h2>
                  <p className="text-gray-600">
                    {user?.streak || profile.stats.streak} days
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setSelectedMonth(new Date())}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Today
                </button>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedMonth);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedMonth(newDate);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    ←
                  </button>
                  <div className="flex items-center px-3 font-medium min-w-[140px] justify-center">
                    {selectedMonth.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedMonth);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedMonth(newDate);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="py-2 text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                if (!day)
                  return (
                    <div key={`empty-${index}`} className="aspect-square" />
                  );

                const isToday =
                  new Date().toDateString() === day.toDateString();
                // Check if this day is in the user's login dates
                const hasActivity = userLoginDates.some(
                  (loginDate) => loginDate.toDateString() === day.toDateString()
                );

                return (
                  <div
                    key={day.toISOString()}
                    className={`aspect-square p-1 ${
                      isToday ? "rounded-full border-2 border-blue-200" : ""}`}
                  >
                    <div
                      className={`flex justify-center items-center w-full h-full rounded-full text-sm
                    ${
                      hasActivity
                        ? "text-white bg-primary"
                        : "hover:bg-gray-100"
                    }`}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-1">
            {profile.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-6 bg-white rounded-xl border ${
                  achievement.isCompleted
                    ? "border-green-200 shadow-green-50"
                    : "border-gray-200 opacity-75"
                } transition-all hover:shadow-lg`}
              >
                <div className="flex gap-4 items-start mb-4">
                  <div
                    className={`p-3 rounded-xl ${
                      achievement.isCompleted
                        ? getBadgeColor(achievement.reward)
                        : "bg-gray-100"
                    }`}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 items-center">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      {achievement.isCompleted && (
                        <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {achievement.description}
                    </p>
                    <span className="inline-block px-2 py-1 mt-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                      {achievement.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="overflow-hidden w-full h-2 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${
                          achievement.isCompleted
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      {achievement.isCompleted && (
                        <span className="flex justify-center items-center w-4 h-4 text-white bg-green-500 rounded-full">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span
                        className={`text-sm ${
                          achievement.isCompleted
                            ? "text-green-600"
                            : "text-gray-600"
                        }`}
                      >
                        Progress
                      </span>
                      <span className="text-sm font-medium">
                        {achievement.progress}%
                      </span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className="text-sm">{achievement.reward}</span>
                      {getBadgeIcon(achievement.reward)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Weekly Progress</h3>
            <div className="relative h-48">
              {profile.stats.weeklyProgress.map((day, index) => (
                <div
                  key={day.date}
                  className="absolute bottom-0"
                  style={{
                    left: `${
                      (index / (profile.stats.weeklyProgress.length - 1)) * 100
                    }%`,
                    height: `${(day.wordsLearned / 25) * 100}%`,
                    width: "20px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="w-full h-full bg-blue-500 rounded-t-lg" />
                  <p className="mt-2 text-xs text-center text-gray-600">
                    {day.date}
                  </p>
                  <p className="text-xs font-semibold text-center">
                    {day.wordsLearned}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SetProfile;
