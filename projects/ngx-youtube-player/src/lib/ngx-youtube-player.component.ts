import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
@Component({
  selector: 'ngx-youtube-player',
  templateUrl: `./ngx-youtube-player.component.html`,
  styleUrls: ['./ngx-youtube-player.component.css'],
})
export class NgxYoutubePlayerComponent implements OnInit {
  @Input() src: string = '';
  lastVolume: number | undefined;
  // Handle KeyDown Events
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const tagName = document.activeElement?.tagName.toLocaleLowerCase();
    if (tagName === 'input') return;
    switch (event.key.toLowerCase()) {
      //@ts-ignore
      case ' ':
        if (tagName === 'button') return;
      case 'k':
        this.togglePlay();
        break;
      case 'f':
        this.toggleFullScreen();
        break;
      case 't':
        this.toggleTheater();
        break;
      case 'i':
        this.toggleMiniPlayer();
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
  @ViewChild('volumeContainer') volumeContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef<HTMLDivElement>;
  @ViewChild('volumeProgress') volumeProgress!: ElementRef<HTMLDivElement>;

  constructor(private renderer2: Renderer2) {}

  private unlistenVolumeDrag!: () => void;
  private unlistenMoveHandler!: () => void;
  private unlistenVolumeStopHandler!: () => void;

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.unlistenVolumeDrag = this.renderer2.listen(
      this.volumeSlider.nativeElement,
      'mousedown',
      (e: MouseEvent) => {
        e.preventDefault();
        this.unlistenMoveHandler = this.renderer2.listen(
          'document',
          'mousemove',
          (e: MouseEvent) => {
            let percent = this.getElementPercentage(e, this.volumeSlider);
            if (percent < 0) {
              percent = 0;
            } else if (percent > 100) {
              percent = 100;
            }
            return this.volumeSet(percent);
          }
        );

        this.unlistenVolumeStopHandler = this.renderer2.listen(
          'document',
          'mouseup',
          (e: MouseEvent) => {
            this.unlistenMoveHandler();
            this.unlistenVolumeStopHandler();
          }
        );
      }
    );
  }

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

  toggleMiniPlayer() {
    if (this.videoContainer.nativeElement.classList.contains('mini-player')) {
      document.exitPictureInPicture();
    } else {
      this.video.nativeElement.requestPictureInPicture();
    }
  }

  enterPictureInPicture() {
    this.videoContainer.nativeElement.classList.add('mini-player');
  }

  leavePictureInPicture() {
    this.videoContainer.nativeElement.classList.remove('mini-player');
  }

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

  // Volume Controls

  getElementPercentage(click: MouseEvent, elm: ElementRef<HTMLDivElement>) {
    const rect = elm.nativeElement.getBoundingClientRect();
    return ((click.pageX - rect.left) / rect.width) * 100;
  }

  volumeClick(e: MouseEvent) {
    const percent = this.getElementPercentage(e, this.volumeSlider);
    this.volumeSet(percent);
  }

  volumeSet(percent: number) {
    this.volumeProgress.nativeElement.style.width = percent + '%';
    this.lastVolume = this.video.nativeElement.volume = percent / 100;
  }

  volumeMute() {
    const vol = this.video.nativeElement.volume > 0 ? 0 : this.lastVolume || 1;
    this.video.nativeElement.volume = vol;
    this.volumeProgress.nativeElement.style.width = vol * 100 + '%';
  }
}
