export interface CameraPreset {
  name: string;
  preset: number;
  obsScene: string;
  hotkey?: string | string[];
}

export interface Camera {
  name: string;
  ip: string;
  user: string;
  password: string;
  presets: CameraPreset[];
  vendor: string;
}

export interface CameraScene {
  cam: Camera;
  scene: CameraPreset;
}

export interface OBSConfig {
  host: string;
  port: number;
  password: string;
}

export type CameraList = Camera[];

export interface Configuration {
  obs: OBSConfig;
  cams: CameraList;
}
