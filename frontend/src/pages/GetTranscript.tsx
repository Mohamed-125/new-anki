import React, { useState } from "react";
import axios from "axios";

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

const GetTranscript: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("/api/v1/transcript/get-transcript", {
        videoUrl,
      });
      setTranscript(response.data.transcript);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch transcript");
      setTranscript([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Get Video Transcript</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="flex-1 p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Loading..." : "Get Transcript"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded">{error}</div>
      )}

      {transcript.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold">Transcript</h2>
          </div>
          <div className="divide-y">
            {transcript.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="mb-1 text-sm text-gray-500">
                  {formatTime(item.start)}
                </div>
                <div className="text-gray-700">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetTranscript;
