const { YoutubeTranscript } = require('youtube-transcript');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { url: videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: "Missing 'url' in request body." });
  }

  try {
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoUrl);
    const formattedTranscript = transcriptData.map(line => {
      const start = Math.floor(line.offset / 1000);
      const minutes = Math.floor(start / 60).toString().padStart(2, '0');
      const seconds = (start % 60).toString().padStart(2, '0');
      return `[${minutes}:${seconds}] ${line.text}`;
    }).join('\n');
    
    return res.status(200).json({ transcript: formattedTranscript });

  } catch (error) {
    return res.status(500).json({ 
        error: 'Transcript is disabled or unavailable for this video.',
        details: error.message 
    });
  }
}
