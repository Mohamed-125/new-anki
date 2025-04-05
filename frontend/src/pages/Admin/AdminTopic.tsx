import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Button from "@/components/Button";
import { TopicType } from "@/hooks/useGetTopics";
import Modal from "@/components/Modal";
import Form from "@/components/Form";
import ItemCard from "@/components/ui/ItemCard";
import { Text } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import { text } from "stream/consumers";

const useGetTopic = (topicId: string) => {
  return useQuery({
    queryKey: ["topic", topicId],
    queryFn: async () => {
      const response = await axios.get(`topic/${topicId}`);
      return response.data as TopicType;
    },
  });
};

const useGetTranscript = () => {
  return useMutation({
    mutationFn: async ({ url, lang }: { url: string; lang: string }) => {
      const response = await axios.post("transcript/get-transcript", {
        url,
        lang,
      });
      return response.data;
    },
  });
};

const AdminTopic = () => {
  const { topicId } = useParams();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: topic, isLoading } = useGetTopic(topicId!);
  const getTranscript = useGetTranscript();

  const addVideoHandler = async () => {
    try {
      const data = await getTranscript.mutateAsync({
        url: youtubeUrl,
        lang: "de",
      });
      const { translatedTranscript, transcript, title, thumbnail } = data;

      console.log(translatedTranscript, transcript, title, thumbnail);
      await axios.post("/video", {
        url: youtubeUrl,
        defaultCaptionData: {
          translatedTranscript,
          transcript,
        },
        topicId: topic?._id,
        title,
        thumbnail,
      });

      setYoutubeUrl("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error fetching transcript:", error);
    }
  };

  const topicVideos =
    topic?.lessons?.filter((lesson) => lesson.type === "video") || [];
  const topicLessons =
    topic?.lessons?.filter((lesson) => lesson.type === "text") || [];

  if (isLoading) return <div>Loading...</div>;
  if (!topic) return <div>Topic not found</div>;

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{topic.title}</h1>
        {topic.language && (
          <p className="mt-1 text-sm text-gray-500">
            Language: {topic.language.toUpperCase()}
          </p>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="texts">Texts</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4">
            {topic?.lessons?.map((lesson) => {
              console.log("lesson", lesson);
              if (lesson.type === "text") {
                return (
                  <ItemCard
                    key={lesson._id}
                    id={lesson._id}
                    name={lesson.title}
                    Icon={<Text />}
                    select={false}
                  />
                );
              } else {
                return <VideoCard key={lesson._id} video={lesson} />;
              }
            })}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <Button onClick={() => setIsDialogOpen(true)}>Add Video</Button>
          <div className="mb-4">
            <Modal
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              className="w-full max-w-lg"
            >
              <Modal.Header
                setIsOpen={setIsDialogOpen}
                title="Add YouTube Video"
              />
              <Form className="p-0 space-y-6" onSubmit={addVideoHandler}>
                <Form.FieldsContainer className="space-y-4">
                  <Form.Field>
                    <Form.Label>YouTube URL</Form.Label>
                    <Form.Input
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="px-4 py-2 w-full text-gray-900 rounded-lg border border-gray-200 transition-all focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter YouTube URL"
                      required
                    />
                  </Form.Field>
                </Form.FieldsContainer>
                <Modal.Footer className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <Button
                    onClick={() => setIsDialogOpen(false)}
                    size="parent"
                    type="button"
                    variant="danger"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="parent" disabled={!youtubeUrl}>
                    Get Transcript
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {topicVideos?.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
          {(topicVideos || (topicVideos as any[])?.length === 0) && (
            <p className="text-gray-500">No videos available</p>
          )}
        </TabsContent>

        <TabsContent value="texts">
          <Link to={"/texts/new"} state={{ topicId: topic._id }}>
            <Button className="mb-6">Add New Text</Button>
          </Link>{" "}
          <div className="grid grid-cols-1 gap-4">
            {topicLessons?.map((text) => (
              <ItemCard
                key={text._id}
                id={text._id}
                name={text.title}
                Icon={<Text />}
                select={false}
              />
            ))}
          </div>
          {(!topicLessons || topicLessons?.length === 0) && (
            <p className="text-gray-500">No texts available</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTopic;
