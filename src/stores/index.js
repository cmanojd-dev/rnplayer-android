import VideoStore from '@videoPlayer/VideoStore';

export default function createStores() {
  return {
    videoStore: new VideoStore(),
  };
}
