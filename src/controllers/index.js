// Import the neccesary modules.
import fs from "fs";
import path from "path";

import Anime from "../models/Anime";
import Movie from "../models/Movie";
import Show from "../models/Show";
import Util from "../util";

import { server, statusFile, tempDir, updatedFile } from "../config/constants";
import { name, repository, version } from "../../package.json";

/** class for displaying information about the server the API is running on. */
export default class Index {

  /** Create an index object. */
  constructor() {
    /**
     * The util object with general functions.
     * @type {Util}
     */
    Index.util = new Util();
  };

  /**
   * Displays a given file.
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {String} path - The path to the file.
   * @param {String} file - The name of the file.
   * @returns {Object} - A file to display in the browser.
   */
  static displayFile(req, res, root, file) {
    if (fs.existsSync(path.join(root, file))) {
      return res.sendFile(file, {
        root,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        }
      });
    } else {
      return res.json({error: `Could not find file: '${root}'`});
    }
  };

  /**
   * Get general information about the server.
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {Function} next - The next function for Express.
   * @returns {Object} - General information about the server.
   */
  async getIndex(req, res, next) {
    try {
      const { updated } = JSON.parse(fs.readFileSync(path.join(tempDir, updatedFile), "utf8")),
        { status } = JSON.parse(fs.readFileSync(path.join(tempDir, statusFile), "utf8")),
        commit = await Index.util.executeCommand("git rev-parse --short HEAD"),
        totalAnimes = await Anime.count({num_episodes: {$gt: 0}}).exec(),
        totalMovies = await Movie.count().exec(),
        totalShows = await Show.count({num_seasons: {$gt: 0}}).exec();

      return res.json({
        repo: repository.url, server, status,
        totalAnimes, totalMovies, totalShows,
        updated, uptime: process.uptime() | 0,
        version, commit
      });
    } catch (err) {
      return next(err);
    }
  };

  /**
   * Displays the 'popcorn-api.log' file.
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @returns {File} - The content of the log file.
   */
  getErrorLog(req, res) {
    return Index.displayFile(req, res, tempDir, `${name}.log`);
  };

};
