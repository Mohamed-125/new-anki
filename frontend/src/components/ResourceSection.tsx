import React, { useState } from "react";
import { Play, Volume2, Image as ImageIcon } from "lucide-react";

interface Resource {
  type: "audio" | "video" | "image";
  url: string;
  title?: string;
  description?: string;
}

interface ResourceSectionProps {
  resources: Resource[];
}

const ResourceSection: React.FC<ResourceSectionProps> = ({ resources }) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"video" | "image" | "audio">(
    "video"
  );

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const groupedResources = resources.reduce((acc, resource) => {
    const { type } = resource;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderAudioPlayer = (resource: Resource) => (
    <div className="p-4 max-w-full bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
      <div className="flex gap-3 items-center mb-2">
        <div className="p-2 bg-blue-100 rounded-full">
          <Volume2 className="w-5 h-5 text-blue-600" />
        </div>
        {resource.title && <h3 className="font-semibold">{resource.title}</h3>}
      </div>
      {resource.description && (
        <p className="mb-3 text-sm text-gray-600">{resource.description}</p>
      )}
      <audio controls className="w-full max-w-full">
        <source src={resource.url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );

  const renderVideoPlayer = (resource: Resource) => {
    if (isYouTubeUrl(resource.url)) {
      const videoId = getYouTubeVideoId(resource.url);
      return (
        <div className="p-4 bg-white rounded-lg shadow-md transition-shadow cursor-pointer hover:shadow-lg">
          <div className="flex gap-3 items-center mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <Play className="w-5 h-5 text-red-600" />
            </div>
            {resource.title && (
              <h3 className="font-semibold">{resource.title}</h3>
            )}
          </div>
          {resource.description && (
            <p className="mb-3 text-sm text-gray-600">{resource.description}</p>
          )}
          <div className="relative pt-[56.25%] overflow-hidden rounded-lg">
            <div className="flex absolute top-0 left-0 justify-center items-center w-full h-full bg-black/10">
              <Play className="w-12 h-12 text-white" />
            </div>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={resource.title || "Video thumbnail"}
              className="object-cover absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-white rounded-lg shadow-md transition-shadow hover:shadow-lg">
        <div className="flex gap-3 items-center mb-2">
          <div className="p-2 bg-red-100 rounded-full">
            <Play className="w-5 h-5 text-red-600" />
          </div>
          {resource.title && (
            <h3 className="font-semibold">{resource.title}</h3>
          )}
        </div>
        {resource.description && (
          <p className="mb-3 text-sm text-gray-600">{resource.description}</p>
        )}
        <video controls className="w-full rounded-lg">
          <source src={resource.url} type="video/mp4" />
          Your browser does not support the video element.
        </video>
      </div>
    );
  };

  const renderImageResource = (resource: Resource) => (
    <div className="p-4 bg-white rounded-lg shadow-md transition-shadow cursor-pointer hover:shadow-lg group">
      <div className="flex gap-3 items-center mb-2">
        <div className="p-2 bg-green-100 rounded-full">
          <ImageIcon className="w-5 h-5 text-green-600" />
        </div>
        {resource.title && <h3 className="font-semibold">{resource.title}</h3>}
      </div>
      {resource.description && (
        <p className="mb-3 text-sm text-gray-600">{resource.description}</p>
      )}
      <div className="relative pt-[75%] overflow-hidden rounded-lg">
        <div className="flex absolute inset-0 justify-center items-center transition-colors duration-200 bg-black/0 group-hover:bg-black/10">
          <div className="p-3 rounded-full opacity-0 transition-opacity duration-200 bg-white/80 group-hover:opacity-100">
            <ImageIcon className="w-6 h-6 text-gray-800" />
          </div>
        </div>
        <img
          src={resource.url}
          alt={resource.title || "Image"}
          className="object-cover absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );

  const renderModal = () => {
    if (!selectedResource) return null;

    return (
      <div
        className="flex fixed inset-0 z-50 justify-center items-center bg-black/90"
        onClick={() => setSelectedResource(null)}
      >
        <div
          className="relative w-[95%] max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {selectedResource.type === "video" && (
            <div className="relative pt-[56.25%]">
              {isYouTubeUrl(selectedResource.url) ? (
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    selectedResource.url
                  )}?autoplay=1`}
                  title={selectedResource.title || "YouTube video player"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  autoPlay
                  className="absolute top-0 left-0 w-full h-full bg-black"
                >
                  <source src={selectedResource.url} type="video/mp4" />
                  Your browser does not support the video element.
                </video>
              )}
            </div>
          )}
          {selectedResource.type === "image" && (
            <div className="relative max-h-[80vh] overflow-hidden">
              <img
                src={selectedResource.url}
                alt={selectedResource.title || "Image"}
                className="object-contain w-full h-auto"
              />
            </div>
          )}
          {(selectedResource.title || selectedResource.description) && (
            <div className="p-6 bg-white border-t">
              {selectedResource.title && (
                <h3 className="text-xl font-semibold">
                  {selectedResource.title}
                </h3>
              )}
              {selectedResource.description && (
                <p className="mt-2 text-gray-600">
                  {selectedResource.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredResources = resources.filter(
    (resource) => resource.type === activeTab
  );
  const groupedFilteredResources = filteredResources.reduce((acc, resource) => {
    const { type } = resource;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="">
      <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveTab("video")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "video"
              ? "bg-white shadow-sm font-medium"
              : "hover:bg-white/50"
          }`}
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("image")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "image"
              ? "bg-white shadow-sm font-medium"
              : "hover:bg-white/50"
          }`}
        >
          Images
        </button>
        <button
          onClick={() => setActiveTab("audio")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "audio"
              ? "bg-white shadow-sm font-medium"
              : "hover:bg-white/50"
          }`}
        >
          Audio
        </button>
      </div>
      {Object.entries(groupedFilteredResources).map(([type, resources]) => (
        <div key={type} className="space-y-4">
          <h2 className="mt-6 text-xl font-semibold capitalize">{type}s</h2>
          <div className="grid grid-cols-3 gap-6 max-w-7xl sm:grid-cols-1">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="w-full max-w-md cursor-pointer"
                onClick={() =>
                  resource.type !== "audio" && setSelectedResource(resource)
                }
              >
                {resource.type === "audio" && renderAudioPlayer(resource)}
                {resource.type === "video" && renderVideoPlayer(resource)}
                {resource.type === "image" && renderImageResource(resource)}
              </div>
            ))}
          </div>
        </div>
      ))}
      {renderModal()}
    </div>
  );
};

export default ResourceSection;
