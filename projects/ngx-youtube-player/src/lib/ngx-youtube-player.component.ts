import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
@Component({
  selector: 'ngx-youtube-player',
  templateUrl: `./ngx-youtube-player.component.html`,
  styleUrls: ['./ngx-youtube-player.component.css'],
})
export class NgxYoutubePlayerComponent implements OnInit {
  @Input() src: string = '';
  // Handle KeyDown Events
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        this.togglePlay();
        break;
    }
  }

  // Handle Full Screen Events
  @HostListener('document:fullscreenchange', ['$event'])
  handleFullScreenChange(event: Event) {
    this.videoContainer.nativeElement.classList.toggle(
      'fullscreen',
      document.fullscreenElement ? true : false
    );
  }
  // get child element .play-pause-btn with ViewChild
  @ViewChild('playPauseBtn') playPauseBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoContainer') videoContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('theaterBtn') theaterBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('miniPlayerBtn') miniPlayerBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('fullScreenBtn') fullScreenBtn!: ElementRef<HTMLButtonElement>;

  constructor() {}

  ngOnInit(): void {}

  // View Modes
  toggleTheater() {
    this.videoContainer.nativeElement.classList.toggle('theater');
  }

  toggleFullScreen() {
    if (document.fullscreenElement === null) {
      this.videoContainer.nativeElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  toggleMiniPlayer() {}

  // Play/Pause video
  togglePlay() {
    this.video.nativeElement.paused
      ? this.video.nativeElement.play()
      : this.video.nativeElement.pause();
  }

  playVideo() {
    this.videoContainer.nativeElement.classList.remove('paused');
  }

  pauseVideo() {
    this.videoContainer.nativeElement.classList.add('paused');
  }
}
