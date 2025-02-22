# transcript_fetcher.py
import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id, lang='en'):
    try:
        # Fetch transcript for the video
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
        return json.dumps(transcript)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    video_id = sys.argv[1]
    lang = sys.argv[2] if len(sys.argv) > 2 else 'en'
    print(get_transcript(video_id, lang))
