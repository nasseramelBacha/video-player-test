import videojs from 'video.js';

declare module 'video.js' {
  export interface Player {
    ima: (options: any) => void;
  }
}
