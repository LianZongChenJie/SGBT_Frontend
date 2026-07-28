import notificationSound from '@/assets/sounds/notification.mp3';

class SoundPlayer {
  private audio: HTMLAudioElement;

  constructor() {
    this.audio = new Audio(notificationSound);
    this.audio.volume = 1; // 音量设置（0-1）
  }

  play() {
    // 解决浏览器自动播放限制：先静音播放再恢复
    this.audio.muted = true;
    this.audio.play()
      .then(() => {
        this.audio.muted = false;
      })
      .catch(e => {
        console.error('音效播放失败:', e);
      });
  }
}

export const soundPlayer = new SoundPlayer();
