(function() {
  var __slice = [].slice;

  window.tic = (function() {
    var add, addLeapDaysR, apply, clone, compact, compose, curry, daysInMonths, dotExec, equals, first, foldl, format, formatFunctions, formatFunctionsRegex, formatStrGroups, getAttribute, getConfiguredSubstrFn, getLanguageLookupFn, increment, isBeforeMarch1, isLeapYear, isToday, keys, lang, langs, leapDaysBetween, msFactors, padNumber, parse, parseFormatRegex, parseFunctions, remove, resetTime, substr;
    langs = {
      "en-US": {
        stdDateFormat: "MM/DD/YYYY",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      }
    };
    lang = langs["en-US"];
    apply = function(f, args) {
      return f.apply(window, args);
    };
    curry = function() {
      var args, f;
      f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return function() {
        var moreArgs;
        moreArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return f.apply(this, args.concat(moreArgs));
      };
    };
    compose = function() {
      var fs;
      fs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return function() {
        var args, i, _i, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        for (i = _i = _ref = fs.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
          args = [apply(fs[i], args)];
        }
        return first(args);
      };
    };
    foldl = function(f, a, _arg) {
      var x, xs;
      x = _arg[0], xs = 2 <= _arg.length ? __slice.call(_arg, 1) : [];
      if (xs.length === 0) {
        return f(a, x);
      } else {
        return foldl(f, f(a, x), xs);
      }
    };
    first = function(xs) {
      if ((xs != null) && xs.length > 0) {
        return xs[0];
      }
    };
    keys = function(obj) {
      var k, v, _results;
      _results = [];
      for (k in obj) {
        v = obj[k];
        _results.push(k);
      }
      return _results;
    };
    compact = function(xs) {
      var x, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = xs.length; _i < _len; _i++) {
        x = xs[_i];
        if (x != null) {
          _results.push(x);
        }
      }
      return _results;
    };
    substr = function(str, id, i) {
      return ("" + str).substr(id, i);
    };
    getConfiguredSubstrFn = function(id, i) {
      return function(str) {
        return substr(str, id, i);
      };
    };
    increment = function(num) {
      return num + 1;
    };
    padNumber = function(num, targetLength) {
      if (targetLength == null) {
        targetLength = 2;
      }
      if ((num + "").length < targetLength) {
        return padNumber("0" + num, targetLength);
      } else {
        return num + "";
      }
    };
    getAttribute = function(obj, attribute) {
      return obj[attribute];
    };
    getLanguageLookupFn = function(key) {
      return curry(getAttribute, lang[key]);
    };
    dotExec = function(p) {
      return function(obj) {
        return obj[p]();
      };
    };
    clone = function(d) {
      return new Date(d);
    };
    resetTime = function(date, time) {
      var d, h, m, ms, s, _ref;
      if (time == null) {
        time = "";
      }
      _ref = time.split(":"), h = _ref[0], m = _ref[1], s = _ref[2], ms = _ref[3];
      d = clone(date);
      d.setHours(h || 0);
      d.setMinutes(m || 0);
      d.setSeconds(s || 0);
      d.setMilliseconds(ms || 0);
      return d;
    };
    parseFunctions = {
      "YYYY": function(date, val) {
        return new Date(date.setYear(val));
      },
      "YY": function(date, val) {
        return new Date(date.setYear("20" + val));
      },
      "MM": function(date, val) {
        return new Date(date.setMonth(+val - 1));
      },
      "M": function(date, val) {
        return new Date(date.setMonth(+val - 1));
      },
      "DD": function(date, val) {
        return new Date(date.setDate(val));
      },
      "D": function(date, val) {
        return new Date(date.setDate(val));
      },
      "HH": function(date, val) {
        return new Date(date.setHours(val));
      },
      "H": function(date, val) {
        return new Date(date.setHours(val));
      },
      "mm": function(date, val) {
        return new Date(date.setMinutes(val));
      },
      "m": function(date, val) {
        return new Date(date.setMinutes(val));
      },
      "SS": function(date, val) {
        return new Date(date.setSeconds(val));
      },
      "S": function(date, val) {
        return new Date(date.setSeconds(val));
      },
      "ss": function(date, val) {
        return new Date(date.setSeconds(val));
      },
      "s": function(date, val) {
        return new Date(date.setSeconds(val));
      }
    };
    parseFormatRegex = new RegExp((keys(parseFunctions)).join("|"), "g");
    parse = function(str, formatStr) {
      var applyRule, date, parseRules;
      if (str == null) {
        str = "";
      }
      if (formatStr == null) {
        formatStr = lang.stdDateFormat;
      }
      if (str === "") {
        return new Date();
      } else {
        switch (typeof str) {
          case "string":
            date = resetTime(new Date());
            parseRules = formatStr.match(parseFormatRegex);
            applyRule = function(date, rule) {
              var val;
              val = str.substr(formatStr.indexOf(rule), rule.length);
              if (parseFunctions[rule] != null) {
                return parseFunctions[rule](date, val);
              } else {
                return date;
              }
            };
            if (parseRules != null) {
              return foldl(applyRule, date, parseRules);
            } else {
              return date;
            }
            break;
          case "number":
            return new Date(str);
          default:
            return new Date();
        }
      }
    };
    formatFunctions = {
      "YYYY": dotExec("getFullYear"),
      "YY": compose(getConfiguredSubstrFn(2), dotExec("getFullYear")),
      "MMMM": compose(getLanguageLookupFn("months"), dotExec("getMonth")),
      "MMM": compose(getLanguageLookupFn("monthsShort"), dotExec("getMonth")),
      "MM": compose(padNumber, increment, dotExec("getMonth")),
      "M": compose(increment, dotExec("getMonth")),
      "DD": compose(padNumber, dotExec("getDate")),
      "D": dotExec("getDate"),
      "dddd": compose(getLanguageLookupFn("days"), dotExec("getDay")),
      "ddd": compose(getConfiguredSubstrFn(0, 3), getLanguageLookupFn("days"), dotExec("getDay")),
      "dd": compose(getConfiguredSubstrFn(0, 2), getLanguageLookupFn("days"), dotExec("getDay")),
      "d": dotExec("getDay"),
      "HH": compose(padNumber, dotExec("getHours")),
      "H": dotExec("getHours"),
      "mm": compose(padNumber, dotExec("getMinutes")),
      "m": dotExec("getMinutes"),
      "SS": compose(padNumber, dotExec("getSeconds")),
      "ss": compose(padNumber, dotExec("getSeconds")),
      "S": dotExec("getSeconds"),
      "s": dotExec("getSeconds")
    };
    formatFunctionsRegex = new RegExp((keys(formatFunctions)).join("|"));
    formatStrGroups = function(formatStr) {
      var group, groupId, newFormatStr, preGroup;
      if (formatFunctionsRegex.test(formatStr)) {
        group = (formatStr.match(formatFunctionsRegex))[0];
        groupId = formatStr.indexOf(group);
        if (groupId !== 0) {
          preGroup = formatStr.substr(0, groupId);
        }
        newFormatStr = formatStr.substr(groupId + group.length);
        return (preGroup != null ? [preGroup, group] : [group]).concat(formatStrGroups(newFormatStr));
      } else {
        return [formatStr];
      }
    };
    format = function(date, formatStr) {
      var g;
      if (formatStr == null) {
        formatStr = lang.stdDateFormat;
      }
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = formatStrGroups(formatStr);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          g = _ref[_i];
          _results.push(formatFunctions[g] != null ? formatFunctions[g](date) : g);
        }
        return _results;
      })()).join("");
    };
    isToday = function(date) {
      return (format(date, "YYYYMD")) === (format(new Date(), "YYYYMD"));
    };
    equals = function(a, b) {
      return !(a < b || a > b);
    };
    isBeforeMarch1 = function(d) {
      if (d.getMonth != null) {
        return d.getMonth() < 4;
      }
    };
    isLeapYear = function(d) {
      var y;
      y = d.getFullYear != null ? d.getFullYear() : +d;
      return y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0);
    };
    leapDaysBetween = function(date1, date2) {
      var d1, d2, y, y1, y2, _ref;
      _ref = date1 > date2 ? [date2, date1] : [date1, date2], d1 = _ref[0], d2 = _ref[1];
      y1 = d1.getFullYear != null ? d1.getFullYear() : +d1;
      y2 = d2.getFullYear != null ? d2.getFullYear() : +d2;
      if (!isBeforeMarch1(d1)) {
        y1 = y1 + 1;
      }
      if (isBeforeMarch1(d2)) {
        y2 = y2 - 1;
      }
      if (y2 > y1) {
        return foldl((function(a, b) {
          return a + b;
        }), 0, (function() {
          var _i, _results;
          _results = [];
          for (y = _i = y1; y1 <= y2 ? _i <= y2 : _i >= y2; y = y1 <= y2 ? ++_i : --_i) {
            _results.push(isLeapYear(y) ? 1 : 0);
          }
          return _results;
        })());
      } else if (y2 === y1) {
        if (isLeapYear(y2)) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    };
    addLeapDaysR = function(d1, d2, dir) {
      var a, ld;
      if (dir == null) {
        dir = 1;
      }
      a = new Date((dir > 0 ? Math.max(d1, d2) : Math.min(d1, d2)));
      ld = (leapDaysBetween(d1, d2)) * dir;
      if (ld === 0) {
        return a;
      } else {
        return addLeapDaysR(a, add(a, ld, "days"), dir);
      }
    };
    msFactors = {
      "milliseconds": 1,
      "seconds": 1e3,
      "minutes": 6e4,
      "hours": 36e5,
      "days": 864e5,
      "weeks": 6048e5,
      "years": 31536e6
    };
    daysInMonths = function(start_m, mc) {
      var dc, dms, months, _i, _j, _ref, _ref1, _ref2, _results, _results1;
      dms = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      months = mc > 0 ? (function() {
        _results = [];
        for (var _i = start_m, _ref = start_m + mc; start_m <= _ref ? _i <= _ref : _i >= _ref; start_m <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this) : (function() {
        _results1 = [];
        for (var _j = _ref1 = start_m - (mc + 1), _ref2 = start_m - 1; _ref1 <= _ref2 ? _j <= _ref2 : _j >= _ref2; _ref1 <= _ref2 ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this);
      return foldl((function(a, b) {
        return a + b;
      }), 0, (function() {
        var _k, _len, _results2;
        _results2 = [];
        for (_k = 0, _len = months.length; _k < _len; _k++) {
          dc = months[_k];
          _results2.push(dms[dc % 11]);
        }
        return _results2;
      })());
    };
    add = function(date, amount, unit) {
      var d, d2, factor, leapDaysFactor, m1;
      if (unit == null) {
        unit = "second";
      }
      switch (unit) {
        case "year":
        case "years":
          d2 = new Date(date.getTime() + amount * msFactors.years);
          return addLeapDaysR(date, d2, amount / (Math.abs(amount)));
        case "month":
        case "months":
          m1 = date.getMonth != null ? date.getMonth() : +date;
          d = new Date(date.getTime() + (daysInMonths(m1, amount)) * msFactors.days);
          leapDaysFactor = amount / (Math.abs(amount));
          return addLeapDaysR(date, d, leapDaysFactor);
        default:
          factor = msFactors[unit] || msFactors[unit + "s"] || 1e3;
          return new Date(date.getTime() + (amount * factor));
      }
    };
    remove = function(date, amount, unit) {
      return add(date, -amount, unit);
    };
    return {
      equals: equals,
      resetTime: resetTime,
      parse: parse,
      format: format,
      add: add,
      remove: remove,
      isToday: isToday,
      isLeapYear: isLeapYear
    };
  })();

}).call(this);
