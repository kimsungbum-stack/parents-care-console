import OpenAI from "openai";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  "audio/mpeg": "audio.mp3",
  "audio/mp3": "audio.mp3",
  "audio/m4a": "audio.m4a",
  "audio/x-m4a": "audio.m4a",
  "audio/mp4": "audio.m4a",
  "audio/wav": "audio.wav",
  "audio/x-wav": "audio.wav",
  "audio/webm": "audio.webm",
};

// 5초 추정: 일반 오디오 비트레이트(128kbps) 기준 약 80KB
const MIN_AUDIO_SIZE_BYTES = 80_000;

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (audioBuffer.byteLength < MIN_AUDIO_SIZE_BYTES) {
    throw new Error("RECORDING_TOO_SHORT");
  }

  const fileName = SUPPORTED_MIME_TYPES[mimeType];
  if (!fileName) {
    throw new Error(
      `Unsupported audio format: ${mimeType}. Supported: mp3, m4a, wav, webm`
    );
  }

  const openai = getOpenAIClient();

  try {
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      language: "ko",
    });

    return transcription.text;
  } catch (error) {
    if (error instanceof Error && error.message === "RECORDING_TOO_SHORT") {
      throw error;
    }
    throw new Error("TRANSCRIPTION_FAILED");
  }
}
