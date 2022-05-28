import {
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
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
  @Input() captionSrc: string = '';
  lastVolume!: number;
  volumeHoverTimeout: any;
  volumeSliderDown: boolean = false;
  captions!: TextTrack;
  // Handle KeyDown Events
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const tagName = document.activeElement?.tagName.toLocaleLowerCase();
    if (tagName === 'input') return;
    if (document.activeElement?.className === 'bsp-volume-slider') return;
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
      case 'm':
        this.volumeMute();
        break;
      case 'c':
        this.toggleCaptions();
        break;
      case 'arrowup':
        if (this.lastVolume * 100 + 5 <= 100) {
          this.volumeSet(this.lastVolume * 100 + 5);
        } else {
          this.volumeSet(100);
        }
        break;
      case 'arrowdown':
        if (this.lastVolume * 100 - 5 >= 0) {
          this.volumeSet(this.lastVolume * 100 - 5);
        } else {
          this.volumeSet(0);
        }
        break;
      case 'arrowleft':
      case 'j':
        this.skip(-5);
        break;
      case 'arrowright':
      case 'l':
        this.skip(5);
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
  @ViewChild('captionsBtn') captionsBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('volumeContainer') volumeContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef<HTMLDivElement>;
  @ViewChild('volumeProgress') volumeProgress!: ElementRef<HTMLDivElement>;
  @ViewChild('currentTime') currentTime!: ElementRef<HTMLDivElement>;
  @ViewChild('totalTime') totalTime!: ElementRef<HTMLDivElement>;
  @ViewChild('speedBtn') speedBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('dropupPanel') dropupPanel!: ElementRef<HTMLDivElement>;

  constructor(private renderer2: Renderer2, private ngZone: NgZone) {}

  private unlistenVolumeDrag!: () => void;
  private unlistenMoveHandler!: () => void;
  private unlistenVolumeStopHandler!: () => void;

  ngOnInit(): void {}
  ngAfterViewInit(): void {
    console.log('Video src: ', this.src);
    console.log('Captions src: ', this.captionSrc);
    this.volumeSet(50);
    this.captions = this.video.nativeElement.textTracks[0];
    this.captions.mode = 'hidden';
    this.unlistenVolumeDrag = this.renderer2.listen(
      this.volumeSlider.nativeElement,
      'mousedown',
      (e: MouseEvent) => {
        this.volumeSliderDown = true;
        this.videoContainer.nativeElement.classList.add('mouseheld');
        e.preventDefault();
        this.ngZone.runOutsideAngular(() => {
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
        });

        this.unlistenVolumeStopHandler = this.renderer2.listen(
          'document',
          'mouseup',
          (e: MouseEvent) => {
            this.volumeSliderDown = false;
            this.videoContainer.nativeElement.classList.remove('mouseheld');
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

  volumeHoverIn() {
    if (this.volumeHoverTimeout) {
      clearTimeout(this.volumeHoverTimeout);
    }
    this.volumeContainer.nativeElement.classList.add('bsp-volume-show');
  }

  volumeHoverOut() {
    if (this.volumeSliderDown === false) {
      this.volumeHoverTimeout = setTimeout(() => {
        this.volumeContainer.nativeElement.classList.remove('bsp-volume-show');
      }, 400);
    }
  }

  volumeClick(event: MouseEvent) {
    const percent = this.getElementPercentage(event, this.volumeSlider);
    this.volumeSet(percent);
  }

  /*
   * Set Volume of video and set lastVolume variable.
   * @param {number} percent - Percentage of volume to set.
   * @returns {void}
   */
  volumeSet(percent: number) {
    this.volumeProgress.nativeElement.style.width = percent + '%';
    this.lastVolume = this.video.nativeElement.volume = percent / 100;
    this.video.nativeElement.muted = this.lastVolume === 0;

    let volumeLevel;
    if (
      this.video.nativeElement.muted ||
      this.video.nativeElement.volume === 0
    ) {
      volumeLevel = 'muted';
    } else if (this.lastVolume >= 0.5) {
      volumeLevel = 'high';
    } else {
      volumeLevel = 'low';
    }
    this.videoContainer.nativeElement.dataset['volumeLevel'] = volumeLevel;
  }

  /*
   * Volume Mute Toggle
   * @returns {void}
   */
  volumeMute(): void {
    const vol = this.video.nativeElement.volume > 0 ? 0 : this.lastVolume || 1;
    this.video.nativeElement.volume = vol;
    this.video.nativeElement.muted = vol === 0;
    if (vol === 0)
      this.videoContainer.nativeElement.dataset['volumeLevel'] = 'muted';
    else if (vol >= 0.5)
      this.videoContainer.nativeElement.dataset['volumeLevel'] = 'high';
    else this.videoContainer.nativeElement.dataset['volumeLevel'] = 'low';

    this.volumeProgress.nativeElement.style.width = vol * 100 + '%';
  }

  /*
   * Volume Slider KeyboardEvent Handler
   * @param {KeyboardEvent} event - KeyboardEvent
   * @returns {void}
   */
  volumeKeydown(event: KeyboardEvent): void {
    let volumePercent = this.lastVolume * 100;
    if (event.key.toLowerCase() === 'arrowright') {
      if (volumePercent + 5 <= 100) {
        this.volumeSet(volumePercent + 5);
      } else {
        this.volumeSet(100);
      }
    } else if (event.key.toLowerCase() === 'arrowleft') {
      if (volumePercent - 5 >= 0) {
        this.volumeSet(volumePercent - 5);
      } else {
        this.volumeSet(0);
      }
    }
  }

  // Caption Controls

  /*
   * Caption Toggle
   * @returns {void}
   */
  toggleCaptions() {
    const isCaptions = this.captions!.mode === 'hidden';
    this.captions.mode = isCaptions ? 'showing' : 'hidden';
    this.videoContainer.nativeElement.classList.toggle('captions', isCaptions);
  }

  // Time Controls
  leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2,
  });

  /*
   * This function is used to update the current time of the video.
   * It is called everytime the video time is updated.
   * @returns {void}
   */
  onTimeUpdate(): void {
    this.currentTime.nativeElement.textContent = this.formatDuration(
      this.video.nativeElement.currentTime
    );
  }

  /*
   * This function is used to format the duration of the video as hh:mm:ss or mm:ss.
   * @param {number} time - The time in seconds.
   * @returns {string} - The formatted time.
   */
  formatDuration(time: number): string {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
      return `${minutes}:${this.leadingZeroFormatter.format(seconds)}`;
    }
    return `${hours}:${this.leadingZeroFormatter.format(
      minutes
    )}:${this.leadingZeroFormatter.format(seconds)}`;
  }

  /*
   * This function sets the total time once the video is loaded.
   * @returns {void}
   */
  onVideoLoaded(): void {
    this.totalTime.nativeElement.textContent = this.formatDuration(
      this.video.nativeElement.duration
    );
  }

  /*
   * This function skips the video by the specified time.
   * @param {number} time - The time in seconds.
   * @returns {void}
   */
  skip(time: number): void {
    const newTime = this.video.nativeElement.currentTime + time;
    this.video.nativeElement.currentTime = newTime;
  }

  /*
   * This function changes playback speed.
   * @param {number} speed - The speed to set.
   * @returns {void}
   */
  changeSpeed(speed: number): void {
    this.video.nativeElement.playbackRate = speed;
    this.speedBtn.nativeElement.textContent = `${speed}x`;
    this.dropupPanel.nativeElement.classList.toggle('drop-up');
  }

  /*
   * This function is used to toggle the playback speed menu.
   * @returns {void}
   */
  toggleSpeed(): void {
    if (this.dropupPanel.nativeElement.classList.contains('hidden')) {
      this.dropupPanel.nativeElement.classList.remove('hidden');
      setTimeout(
        () =>
          this.dropupPanel.nativeElement.classList.remove('visually-hidden'),
        0
      );
    } else {
      this.dropupPanel.nativeElement.classList.add('visually-hidden');
      this.dropupPanel.nativeElement.addEventListener(
        'transitionend',
        () => {
          this.dropupPanel.nativeElement.classList.add('hidden');
        },
        {
          capture: false,
          once: true,
          passive: false,
        }
      );
    }
  }
}
