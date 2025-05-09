declare module 'browser-image-compression' {
  export interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    exifOrientation?: number;
    fileType?: string;
    initialQuality?: number;
    alwaysKeepResolution?: boolean;
    preserveExif?: boolean;
    onProgress?: (progress: number) => void;
  }

  function imageCompression(file: File, options?: Options): Promise<File>;
  
  export default imageCompression;
} 