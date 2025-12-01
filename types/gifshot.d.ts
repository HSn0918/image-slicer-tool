declare module "gifshot" {
  export interface GifshotOptions {
    images: string[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    sampleInterval?: number;
    numWorkers?: number;
    repeat?: number;
  }

  export interface GifshotResult {
    error: boolean;
    errorCode?: string;
    errorMsg?: string;
    image: string;
  }

  type GifshotCallback = (result: GifshotResult) => void;

  const gifshot: {
    createGIF(options: GifshotOptions, callback: GifshotCallback): void;
  };

  export default gifshot;
}
