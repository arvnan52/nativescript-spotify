import {Observable, EventData} from 'data/observable';
import {Page} from 'ui/page';
import {topmost} from 'ui/frame';
import {AnimationCurve} from 'ui/enums';
import {LoadingIndicator} from 'nativescript-loading-indicator';
import {
  TNSSpotifyConstants,
  TNSSpotifyAuth,
  TNSSpotifyPlayer,
  TNSSpotifySearch,
  TNSTrack,
  Utils
} from 'nativescript-spotify';

export class SpotifySearchDemo extends Observable {

  // UI  
  public footerNote: string = "<span style='font-family: sans-serif; background-color:#000; color:#fff;'>Demo by <a href='https://github.com/NathanWalker' style='color:#A6CE40;'>Nathan Walker</a></span>";
  public loggedIn: boolean = false;
  public searchResults: Array<TNSTrack>;

  // State  
  private _spotify: TNSSpotifyPlayer;  
  private _loader: any;
  private _currentTrack: string;
  private _resultPlayingIndex: number;

  constructor() {
    super();

    this._loader = new LoadingIndicator();
    // init player
    this._loader.show();
    this._spotify = new TNSSpotifyPlayer();
    this._spotify.initPlayer(true);
    this.setupEvents();
  }
  
  public login() {
    TNSSpotifyAuth.LOGIN();
  }

  public togglePlay(args?: EventData, trackUri?: string) {
    this._loader.show();
    
    this._currentTrack = trackUri;

    this._spotify.togglePlay(this._currentTrack).then((isPlaying: boolean) => {
      this._loader.hide();
    }, (error) => {
      this._loader.hide();
      if (error === 'login') {
        this.set(`loggedIn`, false);
      }
    });
  }

  public resultTap(args: EventData) {
    if (this._resultPlayingIndex === args.index) {
      // pause track
      this.searchResults[this._resultPlayingIndex].playing = false;
      let id = this.searchResults[this._resultPlayingIndex].id;
      console.log(id);
      this.togglePlay(null, `spotify:track:${id}`);
    } else {
      this._resultPlayingIndex = args.index;
      for (let item of this.searchResults) {
        item.playing = false;
      }
      this.searchResults[this._resultPlayingIndex].playing = true;
      let id = this.searchResults[this._resultPlayingIndex].id;
      console.log(id);
      this.togglePlay(null, `spotify:track:${id}`);
    }
    this.set(`searchResults`, this.searchResults);  
  }

  public search(e: any) {
    if (e && e.object) {
      console.log(e.object.text);
      TNSSpotifySearch.QUERY(e.object.text, 'track').then((result) => {
        console.log(result);
        this.set('searchResults', result.tracks);
      }, () => {
        Utils.alert('No tracks found!');
      });
    }
  }
  
  private updateLogin(status: boolean) {
    this.set(`loggedIn`, status);
  }
  
  private loginCheck() {
    this._loader.show();
  }
  
  private loginSuccess() {
    this.set(`loggedIn`, true);
    console.log(`loginSuccess!`);
    this._loader.hide();
  }

  private loginError(error: any) {
    this.set(`loggedIn`, false);
    console.log(`loginError!`);
    console.log(error);
    this._loader.hide();
  }  

  private playerReady() {
    this._loader.hide();
  }

  private setupEvents() {
    this._spotify.events.on('playerReady', (eventData) => {
      this.playerReady();
      if (eventData && eventData.data.loggedIn) {
        this.loginSuccess();
      }
    });
    this._spotify.auth.events.on('authLoginChange', (eventData) => {
      this.updateLogin(eventData.data.status);
    });
    this._spotify.auth.events.on('authLoginCheck', (eventData) => {
      this.loginCheck();
    });
    this._spotify.auth.events.on('authLoginSuccess', (eventData) => {
      this.loginSuccess();
    });
    this._spotify.auth.events.on('authLoginError', (eventData) => {
      this.loginError(eventData.data);
    });
  }  
}