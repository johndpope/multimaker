import fs from 'fs';

export const RealXMLHttpRequest = window.XMLHttpRequest;

/**
 * Wraps the Node fs module with an XHR-compatible interface
 * 
 * Suitable for replacing the global XmlHttpRequest class.
 */
class FsXMLHttpRequest {
  constructor() {
    /**
     * Whether `async` was set when open() was called
     * @type {boolean}
     */
    this._async = true;
    /**
     * Map of event handlers registered with addEventListener()
     * @type {{[key: string]: Function[]}}
     */
    this._eventListeners = {
      load: [],
      progress: [],
      error: []
    };
    /**
     * The HTTP method set when open() was called
     */
    this._method = null;
    /**
     * A mime type that was set with overrideMimeType()
     * @type {string}
     */
    this._overrideMimeType = null;
    /**
     * Password set with open()
     * @type {string}
     */
    this._password = null;
    /**
     * Map of request handlers set with 
     * @type {{[key: string]: string}}
     */
    this._requestHeaders = {};
    /**
     * URL set with open()
     * @type {string}
     */
    this._url = null;
    /**
     * User name set with open()
     * @type {string}
     */
    this._user = null;
    /**
     * Error handler
     * @type {Function}
     */
    this.onerror = noop;
    /**
     * Load handler
     * @type {Function}
     */
    this.onload = noop;
    /**
     * Progress handler
     * @type {Function}
     */
    this.onprogress = noop;
    /**
     * Ready state change handler
     * @type {Function}
     */
    this.onreadystatechange = noop;
    /**
     * One of the readyState constants defined on XMLHttpRequest
     * @type {number}
     */
    this.readyState = FsXMLHttpRequest.UNSENT;
    /**
     * Contains the loaded data.
     * 
     * The type of object stored here depends on the value of responseText.
     * 
     * @type {string|Blob}
     */
    this.response = null;
    /**
     * When responseType is text, this is the same as `response`.
     * @type {string}
     */
    this.responseText = null;
    /**
     * Determines how loaded data should be interpreted as the response.
     * 
     * Current types supported:
     * 
     * - 'text'
     * - 'blob'
     * 
     * @type {string}
     */
    this.responseType = "";
    /**
     * @type {string}
     */
    this.responseURL = "";
    /**
     * @todo Not currently used
     * @type {string}
     */
    this.responseXML = "";
    /**
     * HTTP status code
     * @type {number}
     */
    this.status = 0;
    /**
     * HTTP status text
     * @type {string}
     */
    this.statusText = "";
    /**
     * Amount of time to wait for content to load
     * 
     * Not currently used.
     * 
     * @type {number}
     */
    this.timeout = 0;
  }
  abort() {
    throw new error('TODO');
  }
  /**
   * @param {string} type 
   * @param {Function} callback 
   */
  addEventListener(type, callback) {
    this._eventListeners[type].push(callback);
  }
  /**
   * @param {string} type 
   * @param {Function} callback 
   */
  removeEventListener(type, callback) {
    const i = this._eventListeners[type].indexOf(callback);
    this._eventListeners[type].splice(i, 1);
  }
  /**
   * @return {string}
   */
  getAllResponseHeaders() {
    throw new Error('TODO');
  }
  /**
   * @param {string} header 
   * @return {string}
   */
  getResponseHeader(header) {
    throw new Error('TODO');
  }
  /**
   * @param {string} method 
   * @param {string} url 
   * @param {boolean} [async=true]
   * @param {string} [user]
   * @param {string} [password]
   */
  open(method, url, async = true, user = null, password = null) {
    this._method = method;
    this._url = url;
    this._async = async;
    this._user = user;
    this._password = password;
  }
  /**
   * @param {string} type 
   */
  overrideMimeType(type) {
    throw new Error('TODO');
    //this._overrideMimeType = type;
  }
  /**
   * Initiate loading of the file.
   * 
   * Immediately changes readyState to LOADING and fires any associated
   * handlers. Once the fils is loaded, changes readyState to DONE and fires
   * 
   * @param {string} body Unused
   */
  send(body) {
    setImmediate(() => {
      this.readyState = FsXMLHttpRequest.LOADING;
      const event = {
        lengthComputable: false,
        total: 0,
        // TODO
      };
      this.onprogress(event);
      this._eventListeners.progress.forEach(listener => {
        listener(event);
      });
      this.onreadystatechange();
    });
    fs.readFile(this._url, (err, data) => {
      this.readyState = FsXMLHttpRequest.DONE;
      if (err) {
        this.status = 500;
        this.statusText = "Internal Server Error";
        const event = {
          // TODO
        };
        this.onerror(event);
        this._eventListeners.error.forEach(listener => {
          listener(event);
        });
      } else {
        this.status = 200;
        this.statusText = "OK";
        switch (this.responseType) {
          case 'blob':
            this.response = new Blob([data.buffer]);
            break;
          case 'text':
            this.response = this.responseText = data.toString();
            break;
          default:
            throw new Error(`Unsupported responseType: ${this.responseType}`);
        }
        const event = {
          // TODO
        };
        this.onload(event);
        this._eventListeners.load.forEach(listener => {
          listener(event);
        });
      }
      this.onreadystatechange();
    });
  }
  /**
   * @param {string} header 
   * @param {string} value 
   */
  setRequestHeader(header, value) {
    this._requestHeaders[header] = value;
  }
  /**
   * Replaces the window's XMLHttpRequest with this class.
   */
  static install() {
    window.XMLHttpRequest = FsXMLHttpRequest;
  }
  /**
   * Replaces the window's XMLHttpRequest with its original value.
   */
  static uninstall() {
    window.XMLHttpRequest = RealXMLHttpRequest;
  }
}
FsXMLHttpRequest.DONE = RealXMLHttpRequest.DONE;
FsXMLHttpRequest.HEADERS_RECEIVED = RealXMLHttpRequest.HEADERS_RECEIVED;
FsXMLHttpRequest.LOADING = RealXMLHttpRequest.LOADING;
FsXMLHttpRequest.OPENED = RealXMLHttpRequest.OPENED;
FsXMLHttpRequest.UNSENT = RealXMLHttpRequest.UNSENT;

function noop() { }

export default FsXMLHttpRequest;