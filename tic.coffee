window.tic = do ->

  # tic has some languages
  langs =
    "en-US":
      "stdDateFormat": "MM/DD/YYYY",
      "days"         : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      "months"       : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      "monthsShort"  : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  # change this, if your default language is something else
  lang = langs["en-US"]


  # internal functions

  apply = (f, args) -> f.apply window, args

  curry = (f, args...) ->
    (moreArgs...) -> f.apply this, (args.concat moreArgs)

  compose = (fs...) ->
    (args...) ->
      args = [apply fs[i], args] for i in [fs.length-1..0]
      first args

  foldl = (f, a, [x, xs...]) ->
    if xs.length == 0 then f a, x else foldl f, (f a, x), xs

  first = (xs) -> xs[0] if xs? && xs.length > 0
  # rest = (xs) -> xs.slice 1 if xs?
  # last = (xs) -> xs[xs.length-1] if xs?

  keys = (obj) -> (k for k, v of obj)

  add = (a, b) -> a + b

  substr = (str, id, i) -> ("" + str).substr id, i

  getConfiguredSubstrFn = (id, i) -> (str) -> substr str, id, i

  increment = (num) -> num + 1

  padNumber = (num, targetLength = 2) ->
    if (num+"").length < targetLength then padNumber "0#{num}", targetLength else num+""

  getAttribute = (obj, attribute) -> obj[attribute]

  getLanguageLookupFn = (key) -> curry getAttribute, lang[key]

  dotExec = (p) -> (obj) -> obj[p]()

  # more tic specific stuff

  clone = (d) -> new Date d

  resetTime = (date, time = "") ->
    [h, m, s, ms] = time.split ":"
    d = clone date
    d.setHours (h || 0)
    d.setMinutes (m || 0)
    d.setSeconds (s || 0)
    d.setMilliseconds (ms || 0)
    d

  parseFunctions =
    "YYYY": (date, val) -> new Date (date.setYear val)
    "YY"  : (date, val) -> new Date (date.setYear "20"+val)
    "MM"  : (date, val) -> new Date (date.setMonth +val-1)
    "M"   : (date, val) -> new Date (date.setMonth +val-1)
    "DD"  : (date, val) -> new Date (date.setDate val)
    "D"   : (date, val) -> new Date (date.setDate val)
    "HH"  : (date, val) -> new Date (date.setHours val)
    "H"   : (date, val) -> new Date (date.setHours val)
    "mm"  : (date, val) -> new Date (date.setMinutes val)
    "m"   : (date, val) -> new Date (date.setMinutes val)
    "SS"  : (date, val) -> new Date (date.setSeconds val)
    "S"   : (date, val) -> new Date (date.setSeconds val)
    "ss"  : (date, val) -> new Date (date.setSeconds val)
    "s"   : (date, val) -> new Date (date.setSeconds val)

  parseFormatRegex = new RegExp ((keys parseFunctions).join "|"), "g"

  parse = (str = "", formatStr = lang.stdDateFormat)  ->
    if str == ""
      new Date()
    else
      switch typeof str
        when "string"
          date = resetTime new Date()
          parseRules = formatStr.match parseFormatRegex
          applyRule = (date, rule) ->
            val = str.substr (formatStr.indexOf rule), rule.length
            if parseFunctions[rule]? then parseFunctions[rule] date, val else date

          if parseRules?
            foldl applyRule, date, parseRules
          else
            date

        when "number" then new Date str

        else new Date()

  formatFunctions =
    "YYYY": dotExec "getFullYear"
    "YY"  : compose (getConfiguredSubstrFn 2), (dotExec "getFullYear")
    "MMMM": compose (getLanguageLookupFn "months"), (dotExec "getMonth")
    "MMM" : compose (getLanguageLookupFn "monthsShort"), (dotExec "getMonth")
    "MM"  : compose padNumber, increment, (dotExec "getMonth")
    "M"   : compose increment, (dotExec "getMonth")
    "DD"  : compose padNumber, (dotExec "getDate")
    "D"   : dotExec "getDate"
    "dddd": compose (getLanguageLookupFn "days"), (dotExec "getDay")
    "ddd" : compose (getConfiguredSubstrFn 0, 3), (getLanguageLookupFn "days"), (dotExec "getDay")
    "dd"  : compose (getConfiguredSubstrFn 0, 2), (getLanguageLookupFn "days"), (dotExec "getDay")
    "d"   : dotExec "getDay"
    "HH"  : compose padNumber, (dotExec "getHours")
    "H"   : dotExec "getHours"
    "mm"  : compose padNumber, (dotExec "getMinutes")
    "m"   : dotExec "getMinutes"
    "SS"  : compose padNumber, (dotExec "getSeconds")
    "ss"  : compose padNumber, (dotExec "getSeconds")
    "S"   : dotExec "getSeconds"
    "s"   : dotExec "getSeconds"

  formatFunctionsRegex = new RegExp ((keys formatFunctions).join "|")

  formatStrGroups = (formatStr) ->
    if formatFunctionsRegex.test formatStr
      group = (formatStr.match formatFunctionsRegex)[0]
      groupId = formatStr.indexOf group
      preGroup = (formatStr.substr 0, groupId) if groupId != 0
      newFormatStr = formatStr.substr (groupId + group.length)
      (if preGroup? then [preGroup, group] else [group]).concat (formatStrGroups newFormatStr)

    else
      [formatStr]

  format = (date, formatStr = lang.stdDateFormat)  ->
    (for g in formatStrGroups formatStr
      (if formatFunctions[g]? then formatFunctions[g] date else g)
    ).join ""

  isToday = (date) ->
    (format date, "YYYYMD") == (format new Date(), "YYYYMD")

  leapYearsBetween = (d1, d2) ->
    d1 = if d1.getFullYear? then d1.getFullYear else +d1
    d2 = if d2.getFullYear? then d2.getFullYear else +d2
    foldl add, 0, (if isLeapYear y then 1 else 0 for y in [d1..d2])

  isLeapYear = (d) ->
    y = if d.getFullYear? then d.getFullYear?() else +d
    y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)

  millisecondFactors =
    "milliseconds": 1
    "seconds"     : 1e3
    "minutes"     : 6e4
    "hours"       : 36e5
    "days"        : 864e5
    "weeks"       : 6048e5
    "months"      : 2592e6
    "years"       : 31536e6

  add = (date, val, unit = "second") ->
    factor = millisecondFactors[unit] || millisecondFactors[unit+"s"] || 1e3
    new Date date.getTime() + (val * factor)

  remove = (date, val, unit) -> add date, -val, unit

  return {
    resetTime: resetTime
    parse: parse
    format: format
    add: add
    remove: remove
    isToday: isToday
    isLeapYear: isLeapYear
  }
