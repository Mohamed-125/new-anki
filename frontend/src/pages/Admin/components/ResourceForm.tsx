import React, { useState, useEffect } from "react";
import { PlusIcon, X } from "lucide-react";
import Form from "@/components/Form";
import Button from "@/components/Button";

const getYoutubeVideoId = (url: string) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

interface Resource {
  type: "video" | "image" | "audio";
  url: string;
  title?: string;
}

interface ResourceFormProps {
  resources?: Resource[];
  onAddResource: (resource: Resource) => void;
  onRemoveResource: (index: number) => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({
  resources = [],
  onAddResource,
  onRemoveResource,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newResource, setNewResource] = useState<Resource>({
    type: "video",
    url: "",
    title: "",
  });

  const handleAddResource = () => {
    if (newResource.url) {
      onAddResource(newResource);
      setNewResource({ type: "video", url: "", title: "" });
      setShowDropdown(false);
    }
  };

  const renderPreview = (resource: Resource, index: number) => {
    const youtubeVideoId =
      resource.type === "video" ? getYoutubeVideoId(resource.url) : null;

    return (
      <div key={index} className="relative p-4 bg-gray-50 rounded-lg">
        <button
          onClick={() => onRemoveResource(index)}
          className="absolute top-2 right-2 z-10 p-2 text-white rounded-full backdrop-blur-sm transition-colors bg-black/50 hover:bg-black/70"
        >
          <X size={16} />
        </button>
        {resource.type === "video" &&
          (youtubeVideoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              className="w-full h-48 rounded"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              className="object-cover w-full h-48 rounded"
              src={resource.url}
            />
          ))}
        {resource.type === "image" && (
          <img
            src={resource.url}
            alt={resource.title || "Image"}
            className="object-cover w-full h-48 rounded"
          />
        )}
        {resource.type === "audio" && (
          <audio controls className="mt-2 w-full" src={resource.url} />
        )}
        {resource.title && (
          <p className="mt-2 text-sm font-medium text-gray-700">
            {resource.title}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource, index) => renderPreview(resource, index))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          type="button"
          className="grid place-items-center mx-auto w-10 h-10 text-sm font-medium text-gray-700 bg-white rounded-full border border-gray-300 hover:bg-gray-50"
        >
          <PlusIcon />
        </button>

        {showDropdown && (
          <div className="absolute bottom-full left-1/2 z-10 p-4 mb-2 w-80 bg-white rounded-lg ring-1 ring-black ring-opacity-5 shadow-lg -translate-x-1/2">
            <div className="space-y-3">
              <Form.Field>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={newResource.type}
                  onChange={(e) =>
                    setNewResource({
                      ...newResource,
                      type: e.target.value as Resource["type"],
                    })
                  }
                >
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                </Form.Select>
              </Form.Field>

              <Form.Field>
                <Form.Label>URL</Form.Label>
                <Form.Input
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder="Enter media URL"
                />
              </Form.Field>

              <Form.Field>
                <Form.Label>Title (Optional)</Form.Label>
                <Form.Input
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="Enter title"
                />
              </Form.Field>

              <Button
                type="button"
                onClick={handleAddResource}
                className="w-full"
              >
                Add Resource
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceForm;
