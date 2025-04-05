import React from "react";
import { Link } from "react-router-dom";
import { TopicType } from "../hooks/useGetTopics";

interface TopicCardProps {
  topic: TopicType;
  id: string;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, id }) => {
  // Determine if the topic has videos or texts
  const hasVideos = topic.videos && topic.videos.length > 0;
  const hasTexts = topic.texts && topic.texts.length > 0;

  // Get counts for display
  const videosCount = Array.isArray(topic.videos) ? topic.videos.length : 0;
  const textsCount = Array.isArray(topic.texts) ? topic.texts.length : 0;

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:translate-y-[-3px] mb-4">
      <Link to={`/topics/${id}`} className="block">
        <div className="p-5">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-medium text-gray-800">{topic.title}</h3>
            <div className="flex space-x-2">
              {hasVideos && (
                <span className="px-2 py-1 text-xs text-blue-600 bg-blue-100 rounded-full">
                  {videosCount} {videosCount === 1 ? "Video" : "Videos"}
                </span>
              )}
              {hasTexts && (
                <span className="px-2 py-1 text-xs text-green-600 bg-green-100 rounded-full">
                  {textsCount} {textsCount === 1 ? "Text" : "Texts"}
                </span>
              )}
            </div>
          </div>

          {topic.description && (
            <p className="mt-2 text-sm text-gray-500">{topic.description}</p>
          )}

          {topic.language && (
            <div className="mt-3">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                {topic.language}
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default TopicCard;
