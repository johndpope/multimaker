// @ts-check

/**
 * This is a modified version of the JavaScript port of FLOD.
 * @see https://github.com/photonstorm/FlodJS
 */

import FileLoader from './file-loader';

const loader = FileLoader();

export default {
  load(...args) {
    return loader.load(...args);
  }
};
