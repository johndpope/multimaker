// @ts-check

import { ByteArray } from './core';
import { Amiga } from './amiga';
import F2Player from './f2-player';

/*
  Flod JS 2.1
  2012/04/30
  Christian Corti
  Neoart Costa Rica
  Last Update: Flod JS 2.1 - 2012/04/16
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
  IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  This work is licensed under the Creative Commons Attribution-Noncommercial-Share Alike 3.0 Unported License.
  To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter to
  Creative Commons, 171 Second Street, Suite 300, San Francisco, California, 94105, USA.
*/

export default function FileLoader() {
  var o = Object.create(null, {
    player: { value: null, writable: true },
    index: { value: 0, writable: true },
    amiga: { value: null, writable: true },
    mixer: { value: null, writable: true },

    tracker: {
      get: function () {
        return (this.player) ? TRACKERS[this.index + this.player.version] : TRACKERS[0];
      }
    },

    load: {
      value: function (stream) {
        var archive, id, value;
        if (!stream.view) stream = ByteArray(stream);
        stream.endian = 1;
        stream.position = 0;

        if (stream.readUint() == 67324752) {
          // TODO: Re-add Unzip support
          // if (window.neoart.Unzip) {
          //   archive = ZipFile(stream);
          //   stream = archive.uncompress(archive.entries[0]);
          // } else {
            throw "Unzip support is not available.";
          // }
        }

        // TODO: Why would stream be NULL at this point???
        if (!stream) return null;

        if (this.player && this.player.id != "STPlayer") {
          this.player.load(stream);
          // if (this.player.version) return player;
          if (this.player.version) return this.player;
        }

        if (stream.length > 336) {
          stream.position = 38;
          id = stream.readString(20);

          if (id == "FastTracker v2.00   " ||
            id == "FastTracker v 2.00  " ||
            id == "Sk@le Tracker" ||
            id == "MadTracker 2.0" ||
            id == "MilkyTracker        " ||
            id == "DigiBooster Pro 2.18" ||
            id.indexOf("OpenMPT") != -1) {

            this.player = F2Player(this.mixer);
            this.player.load(stream);

            if (this.player.version) {
              this.index = FASTTRACKER;
              return this.player;
            }
          }
        }

        stream.endian = 0;

        if (stream.length > 2105) {
          stream.position = 1080;
          id = stream.readString(4);

          if (id == "M.K." || id == "FLT4") {
            throw "M.K./FLT4 disabled";
            // this.player = window.neoart.MKPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = NOISETRACKER;
            //   return this.player;
            // }
          } else if (id == "FEST") {
            throw "FEST disabled";
            // this.player = window.neoart.HMPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = HISMASTER;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 2105) {
          stream.position = 1080;
          id = stream.readString(4);

          if (id == "M.K." || id == "M!K!") {
            throw "PT disabled";
            // this.player = window.neoart.PTPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = PROTRACKER;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 1685) {
          stream.position = 60;
          id = stream.readString(4);

          if (id != "SONG") {
            stream.position = 124;
            id = stream.readString(4);
          }

          if (id == "SONG" || id == "SO31") {
            throw "FX disabled";
            // this.player = window.neoart.FXPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = SOUNDFX;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 4) {
          stream.position = 0;
          id = stream.readString(4);

          if (id == "ALL ") {
            throw "D1 disabled";
            // this.player = window.neoart.D1Player(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = DELTAMUSIC;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 3018) {
          stream.position = 3014;
          id = stream.readString(4);

          if (id == ".FNL") {
            throw "D2 disabled";
            // this.player = window.neoart.D2Player(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = DELTAMUSIC;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 30) {
          stream.position = 26;
          id = stream.readString(3);

          if (id == "BPS" || id == "V.2" || id == "V.3") {
            throw "BP/BPS disabled"
            // this.player = window.neoart.BPPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = BPSOUNDMON;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 4) {
          stream.position = 0;
          id = stream.readString(4);

          if (id == "SMOD" || id == "FC14") {
            throw "SMOD/FC14 disabled"
            // this.player = window.neoart.FCPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = FUTURECOMP;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 10) {
          stream.position = 0;
          id = stream.readString(9);

          if (id == " MUGICIAN") {
            throw "MUGICIAN disabled";
            // this.player = window.neoart.DMPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = DIGITALMUG;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 86) {
          stream.position = 58;
          id = stream.readString(28);

          if (id == "SIDMON II - THE MIDI VERSION") {
            throw "SIDMON II dsiabled";
            // this.player = window.neoart.S2Player(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = SIDMON;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 2830) {
          stream.position = 0;
          value = stream.readUshort();

          if (value == 0x4efa) {
            throw "FE disabled";
            // this.player = window.neoart.FEPlayer(this.amiga);
            // this.player.load(stream);

            // if (this.player.version) {
            //   this.index = FREDED;
            //   return this.player;
            // }
          }
        }

        if (stream.length > 5220) {
          throw "S1 disabled"
          // this.player = window.neoart.S1Player(this.amiga);
          // this.player.load(stream);

          // if (this.player.version) {
          //   this.index = SIDMON;
          //   return this.player;
          // }
        }

        stream.position = 0;
        value = stream.readUshort();
        stream.position = 0;
        id = stream.readString(4);

        if (id == "COSO" || value == 0x6000 || value == 0x6002 || value == 0x600e || value == 0x6016) {
          throw "JH disabled";
          // this.player = window.neoart.JHPlayer(this.amiga);
          // this.player.load(stream);

          // if (this.player.version) {
          //   this.index = HIPPEL;
          //   return this.player;
          // }
        }

        stream.position = 0;
        value = stream.readUshort();

        // this.player = window.neoart.DWPlayer(this.amiga);
        // this.player.load(stream);

        // if (this.player.version) {
        //   this.index = WHITTAKER;
        //   return this.player;
        // }

        stream.position = 0;
        value = stream.readUshort();

        if (value == 0x6000) {
          throw "RH disabled"
          // this.player = window.neoart.RHPlayer(this.amiga);
          // this.player.load(stream);

          // if (this.player.version) {
          //   this.index = HUBBARD;
          //   return this.player;
          // }
        }

        if (stream.length > 1625) {
          throw "ST disabled"
          // this.player = window.neoart.STPlayer(this.amiga);
          // this.player.load(stream);

          // if (this.player.version) {
          //   this.index = SOUNDTRACKER;
          //   return this.player;
          // }
        }

        stream.clear();
        this.index = 0;
        return this.player = null;
      }
    }
  });

  o.amiga = Amiga();
  return Object.seal(o);
}

export const SOUNDTRACKER = 0;
export const  NOISETRACKER = 4;
export const  PROTRACKER = 9;
export const  HISMASTER = 12;
export const  SOUNDFX = 13;
export const  BPSOUNDMON = 17;
export const  DELTAMUSIC = 20;
export const  DIGITALMUG = 22;
export const  FUTURECOMP = 24;
export const  SIDMON = 26;
export const  WHITTAKER = 28;
export const  FREDED = 29;
export const  HIPPEL = 30;
export const  HUBBARD = 32;
export const  FASTTRACKER = 33;

export const TRACKERS = [
    "Unknown Format",
    "Ultimate SoundTracker",
    "D.O.C. SoundTracker 9",
    "Master SoundTracker",
    "D.O.C. SoundTracker 2.0/2.2",
    "SoundTracker 2.3",
    "SoundTracker 2.4",
    "NoiseTracker 1.0",
    "NoiseTracker 1.1",
    "NoiseTracker 2.0",
    "ProTracker 1.0",
    "ProTracker 1.1/2.1",
    "ProTracker 1.2/2.0",
    "His Master's NoiseTracker",
    "SoundFX 1.0/1.7",
    "SoundFX 1.8",
    "SoundFX 1.945",
    "SoundFX 1.994/2.0",
    "BP SoundMon V1",
    "BP SoundMon V2",
    "BP SoundMon V3",
    "Delta Music 1.0",
    "Delta Music 2.0",
    "Digital Mugician",
    "Digital Mugician 7 Voices",
    "Future Composer 1.0/1.3",
    "Future Composer 1.4",
    "SidMon 1.0",
    "SidMon 2.0",
    "David Whittaker",
    "FredEd",
    "Jochen Hippel",
    "Jochen Hippel COSO",
    "Rob Hubbard",
    "FastTracker II",
    "Sk@leTracker",
    "MadTracker 2.0",
    "MilkyTracker",
    "DigiBooster Pro 2.18",
    "OpenMPT"];
