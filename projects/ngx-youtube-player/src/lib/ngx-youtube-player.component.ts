import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'ngx-youtube-player',
  templateUrl: `./ngx-youtube-player.component.html`,
  styleUrls: ['./ngx-youtube-player.component.css']
})
export class NgxYoutubePlayerComponent implements OnInit {
  @Input() src: string = "";

  constructor() { }

  ngOnInit(): void {
  }

}
