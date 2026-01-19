/**
 * ElevenLabs Text-to-Speech API Route
 * Converts text to natural-sounding speech using ElevenLabs API
 */

import { NextRequest, NextResponse } from 'next/server';

// ElevenLabs voice IDs - female voices
const VOICE_IDS = {
  rachel: '21m00Tcm4TlvDq8ikWAM',      // Rachel - conversational female
  domi: 'AZnzlk1XvdvUeBnXmlld',        // Domi - strong female
  bella: 'EXAVITQu4vr4xnSDxMaL',       // Bella - soft female
  elli: 'MF3mGyEYCl7XYWbV9V6O',        // Elli - young female
  charlotte: 'XB0fDUnXU5powFXDhCwa',   // Charlotte - seductive female
  sarah: 'EXAVITQu4vr4xnSDxMaL',       // Sarah - soft news
};

// Default voice for IVR system
const DEFAULT_VOICE = VOICE_IDS.rachel;

export async function POST(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { text, language: _language = 'en' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // ElevenLabs text-to-speech endpoint with natural voice settings
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.65,        // Higher stability for clearer speech
            similarity_boost: 0.7,  // Natural voice tone
            speed: 0.92,            // Slightly slower than normal
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: response.status }
      );
    }

    // Return audio as binary stream
    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
