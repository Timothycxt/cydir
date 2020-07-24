/*
 * @Author: CoyoteWaltz <coyote_waltz@163.com>
 * @Date: 2020-07-13 23:28:43
 * @LastEditTime: 2020-07-25 01:25:54
 * @LastEditors: CoyoteWaltz <coyote_waltz@163.com>
 * @Description: store root path, command, history and endpoints
 * @TODO: recontruct to Singleton
 */

const fs = require('fs');

// const { getMatchers } = require('./util/endpoint.js');
const { toJSON, noop } = require('./util/chores.js');
const { getCfgPath, probe } = require('./util/probe.js');
const logger = require('./util/log.js');

class Store {
  constructor() {
    this.cfgPath = getCfgPath();
    try {
      const cfg = JSON.parse(fs.readFileSync(this.cfgPath));
      this._root = cfg.root || '';
      this._command = cfg.command || '';
      this._endPoints = cfg.endPoints || [];
    } catch (e) {}
  }
  save(cb) {
    cb = cb || noop;
    // TODO JSON.stringify
    fs.writeFile(this.cfgPath, toJSON(this.toJSON()), (err) => {
      if (err) {
        logger.err(err, false);
        logger.err('Failed to save config!');
      }
      cb();
    });
  }
  toJSON() {
    return {
      root: this._root || '',
      command: this._command || '',
      endPoints: this._endPoints || [],
      // TODO
      usualList: this._usualList || [],
    };
  }
  get root() {
    return this._root;
  }
  get command() {
    return this._command;
  }
  get endPoints() {
    return this._endPoints;
  }
  set root(value) {
    if (!fs.existsSync(value)) {
      console.log(this);
      logger.err('Path does not exist!');
    }
    if (!fs.statSync(value).isDirectory()) {
      logger.err('Path is not a directory!');
    }
    this._root = value;
    this.updateRootPath();
  }
  set command(value) {
    this._command = value;
    this.save(() => {
      logger.info(`Store command: ${value}`);
    });
  }
  // TODO
  set endPoints(value) {
    this._endPoints = value;
  }
  // 更新根目录 每次更新都 probe 更新
  updateRootPath() {
    this.updateEndPoints(this._root, 2);
    this.save(() => {
      logger.info(`Config root path: ${this._root}`);
    });
  }
  // 不考虑异步吧
  updateEndPoints(absPath, depth) {
    this._endPoints = probe(absPath, depth);
  }
}

const store = new Store();

// store.root = '/Users/koyote/programming';
store.command = 'code';
// store.save();
console.log(store);

module.exports = store;

// const node = {
//   name: '',
//   weight: 0,
//   children: [], // 获得子路径的数量
//   purity: 0, // 文件数量 / 目录数
//   path: 0, // 相对于根结点的距离 root 为 0
//   updateTime: Date.now(), // 每次遍历生成一次即可
//   passTimes: 0,
// };
