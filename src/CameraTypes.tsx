export interface CameraPreset {
  name: string;
  preset: number;
  obsScene: string;
}

export interface Camera {
  name: string;
  ip: string;
  user: string;
  password: string;
  presets: CameraPreset[];
}

export interface OBSConfig {
  host: string;
  port: number;
  password: string;
}

export type CameraList = Camera[];
