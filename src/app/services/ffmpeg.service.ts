import { Injectable } from "@angular/core";
import {
  createFFmpeg,
  fetchFile,
  FFmpeg
} from "@ffmpeg/ffmpeg";

@Injectable({
  providedIn: "root"
})
export class FfmpegService {
  isRunning = false;
  isReady = false;
  private ffmpeg: FFmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true;

    const data = await fetchFile(file);

    this.ffmpeg.FS("writeFile", file.name, data);

    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach(second => {
      commands.push(
        // Input
        "-i", file.name,
        // Output Options
        "-ss", `00:00:0${second}`,
        "-frames:v", "1",
        "-filter:v", "scale=510:-1", // -1 auto resize for height by ratio
        // Output
        `output_0${second}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        "readFile",
        `output_0${second}.png`
      );
      const screenshotBlob = new Blob(
        [screenshotFile.buffer],
        { type: "image/png" }
      );
      const screenshotURL = URL.createObjectURL(screenshotBlob);
      screenshots.push(screenshotURL);
    });

    this.isRunning = false;

    return screenshots;
  }

  async blobFromUrl(url: string) {
    const response = await fetch(url);
    return await response.blob();
  }
}