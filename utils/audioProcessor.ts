
export interface AudioProcessingOptions {
    convertToMono16k: boolean;
    noiseReduction: boolean;
    normalizeVolume: boolean;
    removeSilence: boolean;
}

/**
 * Converts an AudioBuffer object to a WAV file (Blob).
 *
 * @param buffer The AudioBuffer to convert.
 * @returns A Blob representing the WAV file.
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const format = 1; // PCM
  
  const interleaved = new Int16Array(buffer.length * numChannels);
  const channels = [];
  for (let i = 0; i < numChannels; i++) {
      channels.push(buffer.getChannelData(i));
  }

  let offset = 0;
  for (let i = 0; i < buffer.length; i++) {
      for (let j = 0; j < numChannels; j++) {
          let sample = Math.max(-1, Math.min(1, channels[j][i]));
          interleaved[offset++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
  }

  const bufferLength = 44 + interleaved.length * 2;
  const view = new DataView(new ArrayBuffer(bufferLength));

  function writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  let pos = 0;
  writeString(view, pos, 'RIFF'); pos += 4;
  view.setUint32(pos, 36 + interleaved.length * 2, true); pos += 4;
  writeString(view, pos, 'WAVE'); pos += 4;
  writeString(view, pos, 'fmt '); pos += 4;
  view.setUint32(pos, 16, true); pos += 4;
  view.setUint16(pos, format, true); pos += 2;
  view.setUint16(pos, numChannels, true); pos += 2;
  view.setUint32(pos, sampleRate, true); pos += 4;
  view.setUint32(pos, sampleRate * numChannels * (bitDepth / 8), true); pos += 4;
  view.setUint16(pos, numChannels * (bitDepth / 8), true); pos += 2;
  view.setUint16(pos, bitDepth, true); pos += 2;
  writeString(view, pos, 'data'); pos += 4;
  view.setUint32(pos, interleaved.length * 2, true); pos += 4;
  
  for (let i = 0; i < interleaved.length; i++, pos += 2) {
      view.setInt16(pos, interleaved[i], true);
  }

  return new Blob([view], { type: 'audio/wav' });
}


/**
 * Applies various audio processing techniques to an audio file.
 *
 * @param inputFile The audio file to process.
 * @param options The processing options to apply.
 * @param onProgress A callback function to report progress (0-100).
 * @returns A Promise that resolves with the processed audio File object.
 */
export const processAudio = async (
    inputFile: File,
    options: AudioProcessingOptions,
    onProgress: (progress: number) => void
): Promise<File> => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
        onProgress(5);
        const arrayBuffer = await inputFile.arrayBuffer();
        onProgress(15);
        
        const originalBuffer = await audioContext.decodeAudioData(arrayBuffer);
        onProgress(25);

        let currentBuffer = originalBuffer;

        // 1. Remove Silence
        if (options.removeSilence) {
            const SILENCE_THRESHOLD = 0.01;
            const MIN_LOUD_DURATION = 0.1; // seconds
            const sampleRate = currentBuffer.sampleRate;

            const pcmData = currentBuffer.getChannelData(0);
            const loudChunks: Float32Array[] = [];
            let currentChunkStart = -1;

            for (let i = 0; i < pcmData.length; i++) {
                const isLoud = Math.abs(pcmData[i]) > SILENCE_THRESHOLD;
                if (isLoud && currentChunkStart === -1) {
                    currentChunkStart = i; // Start of a loud chunk
                } else if (!isLoud && currentChunkStart !== -1) {
                    const chunkEnd = i;
                    const duration = (chunkEnd - currentChunkStart) / sampleRate;
                    if (duration >= MIN_LOUD_DURATION) {
                        loudChunks.push(pcmData.subarray(currentChunkStart, chunkEnd));
                    }
                    currentChunkStart = -1; // End of a loud chunk
                }
            }
            // Check for a trailing loud chunk
            if(currentChunkStart !== -1) {
                loudChunks.push(pcmData.subarray(currentChunkStart));
            }

            if (loudChunks.length > 0) {
                const totalLength = loudChunks.reduce((sum, chunk) => sum + chunk.length, 0);
                const newData = new Float32Array(totalLength);
                let offset = 0;
                for (const chunk of loudChunks) {
                    newData.set(chunk, offset);
                    offset += chunk.length;
                }
                const newBuffer = audioContext.createBuffer(1, totalLength, sampleRate);
                newBuffer.copyToChannel(newData, 0);
                currentBuffer = newBuffer;
            }
            onProgress(45);
        }

        // 2. Noise Reduction (Simple Gate) & Volume Normalization
        if (options.noiseReduction || options.normalizeVolume) {
            const pcmData = currentBuffer.getChannelData(0);
            const NOISE_GATE_THRESHOLD = 0.005;
            let peak = 0.0;

            for (let i = 0; i < pcmData.length; i++) {
                if (options.noiseReduction && Math.abs(pcmData[i]) < NOISE_GATE_THRESHOLD) {
                    pcmData[i] = 0;
                }
                if (options.normalizeVolume && Math.abs(pcmData[i]) > peak) {
                    peak = Math.abs(pcmData[i]);
                }
            }

            if (options.normalizeVolume && peak > 0) {
                const gain = 0.95 / peak; // Normalize to -0.4dB
                for (let i = 0; i < pcmData.length; i++) {
                    pcmData[i] *= gain;
                }
            }
            // The pcmData is modified in place on the buffer's underlying data
            onProgress(65);
        }

        // 3. Convert to Mono & 16kHz
        if (options.convertToMono16k) {
             const targetSampleRate = 16000;
             if (currentBuffer.numberOfChannels !== 1 || currentBuffer.sampleRate !== targetSampleRate) {
                const duration = currentBuffer.duration;
                const offlineContext = new OfflineAudioContext(1, duration * targetSampleRate, targetSampleRate);
                const sourceNode = offlineContext.createBufferSource();
                sourceNode.buffer = currentBuffer;
                sourceNode.connect(offlineContext.destination);
                sourceNode.start(0);
                currentBuffer = await offlineContext.startRendering();
            }
            onProgress(85);
        }
        
        const wavBlob = audioBufferToWav(currentBuffer);
        onProgress(95);

        const newFileName = `${inputFile.name.split('.').slice(0, -1).join('.')}_processed.wav`;
        
        onProgress(100);
        return new File([wavBlob], newFileName, { type: 'audio/wav' });

    } catch (error) {
        console.error("Error processing audio:", error);
        alert(`Audio processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Returning original file.`);
        return inputFile;
    } finally {
        if (audioContext.state !== 'closed') {
            audioContext.close();
        }
    }
};
