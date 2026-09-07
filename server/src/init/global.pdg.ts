import type {
  ValueOf as _ValueOf,
  Dict as _Dict,
  Arr as _Arr,
  IsObject as _IsObject,
  IsArray as _IsArray,
  ObjectMerge as _ObjectMerge,
  ArrayMerge as _ArrayMerge,
  PartialPick as _PartialPick,
  PartialOmit as _PartialOmit,
  RequiredPick as _RequiredPick,
  RequiredOmit as _RequiredOmit,
} from '@pdg/types';
import {
  empty as _empty,
  ifEmpty as _ifEmpty,
  notEmpty as _notEmpty,
  equal as _equal,
  contains as _contains,
  ifNull as _ifNull,
  ifNotNull as _ifNotNull,
  ifUndefined as _ifUndefined,
  ifNotUndefined as _ifNotUndefined,
  ifNullOrUndefined as _ifNullOrUndefined,
  ifNotNullAndUndefined as _ifNotNullAndUndefined,
} from '@pdg/compare';
import {
  beginDateOfDay as _beginDateOfDay,
  beginDateOfMonth as _beginDateOfMonth,
  endDateOfDay as _endDateOfDay,
  endDateOfMonth as _endDateOfMonth,
  extractDate as _extractDate,
  formatDate as _formatDate,
  getY as _getY,
  getYm as _getYm,
  getYmd as _getYmd,
  getYmdh as _getYmdh,
  getYmdhm as _getYmdhm,
  getYmdhms as _getYmdhms,
  now as _now,
  nowJs as _nowJs,
  nowTime as _nowTime,
  nowY as _nowY,
  nowYm as _nowYm,
  nowYmd as _nowYmd,
  nowYmdh as _nowYmdh,
  nowYmdhm as _nowYmdhm,
  nowYmdhms as _nowYmdhms,
  weekdayText as _weekdayText,
} from '@pdg/date-time';
import { lv as _lv, vl as _vl, copy as _copy } from '@pdg/data';

/* eslint-disable */
declare global {
  /** types */
  type ValueOf<T> = _ValueOf<T>;
  type Dict<T = unknown> = _Dict<T>;
  type Arr<T = unknown> = _Arr<T>;
  type IsObject<T> = _IsObject<T>;
  type IsArray<T> = _IsArray<T>;
  type ObjectMerge<T> = _ObjectMerge<T>;
  type ArrayMerge<A extends any[]> = _ArrayMerge<A>;
  type PartialPick<T, K extends keyof T> = _PartialPick<T, K>;
  type PartialOmit<T, K extends keyof T> = _PartialOmit<T, K>;
  type RequiredPick<T, K extends keyof T> = _RequiredPick<T, K>;
  type RequiredOmit<T, K extends keyof T> = _RequiredOmit<T, K>;

  /** compare */
  var empty: typeof _empty;
  var ifEmpty: typeof _ifEmpty;
  var notEmpty: typeof _notEmpty;
  var equal: typeof _equal;
  var contains: typeof _contains;
  var ifNull: typeof _ifNull;
  var ifNotNull: typeof _ifNotNull;
  var ifUndefined: typeof _ifUndefined;
  var ifNotUndefined: typeof _ifNotUndefined;
  var ifNullOrUndefined: typeof _ifNullOrUndefined;
  var ifNotNullAndUndefined: typeof _ifNotNullAndUndefined;

  /** date-time */
  var beginDateOfDay: typeof _beginDateOfDay;
  var beginDateOfMonth: typeof _beginDateOfMonth;
  var endDateOfDay: typeof _endDateOfDay;
  var endDateOfMonth: typeof _endDateOfMonth;
  var extractDate: typeof _extractDate;
  var formatDate: typeof _formatDate;
  var getY: typeof _getY;
  var getYm: typeof _getYm;
  var getYmd: typeof _getYmd;
  var getYmdh: typeof _getYmdh;
  var getYmdhm: typeof _getYmdhm;
  var getYmdhms: typeof _getYmdhms;
  var now: typeof _now;
  var nowJs: typeof _nowJs;
  var nowTime: typeof _nowTime;
  var nowY: typeof _nowY;
  var nowYm: typeof _nowYm;
  var nowYmd: typeof _nowYmd;
  var nowYmdh: typeof _nowYmdh;
  var nowYmdhm: typeof _nowYmdhm;
  var nowYmdhms: typeof _nowYmdhms;
  var weekdayText: typeof _weekdayText;

  /** data */
  var lv: typeof _lv;
  var vl: typeof _vl;
  var copy: typeof _copy;
}
/* eslint-enable */

/** compare */
globalThis.empty = _empty;
globalThis.ifEmpty = _ifEmpty;
globalThis.notEmpty = _notEmpty;
globalThis.equal = _equal;
globalThis.contains = _contains;
globalThis.ifNull = _ifNull;
globalThis.ifNotNull = _ifNotNull;
globalThis.ifUndefined = _ifUndefined;
globalThis.ifNotUndefined = _ifNotUndefined;
globalThis.ifNullOrUndefined = _ifNullOrUndefined;
globalThis.ifNotNullAndUndefined = _ifNotNullAndUndefined;

/** date-time */
globalThis.beginDateOfDay = _beginDateOfDay;
globalThis.beginDateOfMonth = _beginDateOfMonth;
globalThis.endDateOfDay = _endDateOfDay;
globalThis.endDateOfMonth = _endDateOfMonth;
globalThis.extractDate = _extractDate;
globalThis.formatDate = _formatDate;
globalThis.getY = _getY;
globalThis.getYm = _getYm;
globalThis.getYmd = _getYmd;
globalThis.getYmdh = _getYmdh;
globalThis.getYmdhm = _getYmdhm;
globalThis.getYmdhms = _getYmdhms;
globalThis.now = _now;
globalThis.nowJs = _nowJs;
globalThis.nowTime = _nowTime;
globalThis.nowY = _nowY;
globalThis.nowYm = _nowYm;
globalThis.nowYmd = _nowYmd;
globalThis.nowYmdh = _nowYmdh;
globalThis.nowYmdhm = _nowYmdhm;
globalThis.nowYmdhms = _nowYmdhms;
globalThis.weekdayText = _weekdayText;

/** data */
globalThis.lv = _lv;
globalThis.vl = _vl;
globalThis.copy = _copy;

export {};
