import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { User, BookOpen, Pin, Share2, Search } from "lucide-react";
import ItemCard from "./ui/ItemCard";
import SetCard from "./ui/SetCard";
import Button from "./Button";
import ShareModal from "./ShareModal";
import Form from "./Form";
import useDebounce from "@/hooks/useDebounce";

// Define the user profile data type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  sets: Set[];
  pinnedSets: Set[];
}

interface Set {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Dummy data for development
const dummyProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff",
  sets: [
    {
      _id: "set1",
      name: "Spanish Vocabulary",
      description: "Basic Spanish words and phrases",
      createdAt: "2023-01-15T12:00:00Z",
    },
    {
      _id: "set2",
      name: "French Grammar",
      description: "French grammar rules and examples",
      createdAt: "2023-02-20T14:30:00Z",
    },
    {
      _id: "set3",
      name: "German Phrases",
      description: "Common German phrases for travelers",
      createdAt: "2023-03-10T09:15:00Z",
    },
  ],
  pinnedSets: [
    {
      _id: "set1",
      name: "Spanish Vocabulary",
      description: "Basic Spanish words and phrases",
      createdAt: "2023-01-15T12:00:00Z",
    },
  ],
};

// Mock API function to fetch user profile
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  // In a real app, this would be an API call
  // return await axios.get(`/api/profile/${userId}`).then(res => res.data);

  // For now, return dummy data after a small delay to simulate network request
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyProfile), 500);
  });
};

const SetProfile = () => {
  // In a real app, you would get the userId from auth context or route params
  const userId = "1";

  // State for share modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", userId, debouncedQuery],
    queryFn: () => fetchUserProfile(userId),
  });

  // Function to handle share button click
  const handleShare = (id: string, name: string) => {
    setShareItem({ id, name });
    setShareModalOpen(true);
  };

  if (isLoading) return <div className="p-4">Loading profile...</div>;
  if (error)
    return <div className="p-4 text-red-500">Error loading profile</div>;
  if (!profile) return <div className="p-4">No profile data found</div>;

  return (
    <div className="space-y-6">
      {/* Share Modal */}
      {shareItem && <ShareModal sharing="profile" />}
      {/* User Profile Header */}
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
          <div className="flex gap-2 mt-2">
            <Button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* <Button onClick={} variant="danger">delete account </Button> */}
      {/* Pinned Sets
      {profile.pinnedSets.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <Pin size={18} />
            <h2 className="text-xl font-semibold">Pinned Sets</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.pinnedSets
              .filter(set => 
                debouncedQuery ? set.name.toLowerCase().includes(debouncedQuery.toLowerCase()) : true
              )
              .map((set) => (
                <SetCard
                  key={set._id}
                  id={set._id}
                  name={set.name}
                  subText={set.description}
                  isPinned={true}
                  shareHandler={() => handleShare(set._id, set.name)}
                />
              ))}
          </div>
        </div>
      )} */}

      {/* Tabs for Sets */}
      {/* <Tabs defaultValue="sets" className="w-full">
        <TabsList className="flex mb-4 border-b">
          <TabsTrigger
            value="sets"
            className="px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            My Sets
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="px-4 py-2 text-gray-600 hover:text-blue-600 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            Add New Set
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              My Sets ({profile.sets.length})
            </h2>
            <Button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
              Create New Set
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.sets
              .filter((set) =>
                debouncedQuery
                  ? set.name
                      .toLowerCase()
                      .includes(debouncedQuery.toLowerCase())
                  : true
              )
              .map((set) => (
                <SetCard
                  key={set._id}
                  id={set._id}
                  name={set.name}
                  subText={set.description}
                  isPinned={profile.pinnedSets.some(
                    (pinnedSet) => pinnedSet._id === set._id
                  )}
                  shareHandler={() => handleShare(set._id, set.name)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Create New Set</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Set Name
                </label>
                <input
                  type="text"
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter set name"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter set description"
                ></textarea>
              </div>
              <Button className="px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700">
                Create Set
              </Button>
            </form>
          </div>
        </TabsContent>
      </Tabs> */}
    </div>
  );
};

export default SetProfile;
