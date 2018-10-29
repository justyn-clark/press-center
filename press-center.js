;(function () {

  /*  ___        __  _       _      _                ____                         ______           __
     /   | _____/ /_(_)   __(_)____(_)___  ____     / __ \________  __________   / ____/__  ____  / /____  _____
    / /| |/ ___/ __/ / | / / / ___/ / __ \/ __ \   / /_/ / ___/ _ \/ ___/ ___/  / /   / _ \/ __ \/ __/ _ \/ ___/
   / ___ / /__/ /_/ /| |/ / (__  ) / /_/ / / / /  / ____/ /  /  __(__  |__  )  / /___/  __/ / / / /_/  __/ /
  /_/  |_\___/\__/_/ |___/_/____/_/\____/_/ /_/  /_/   /_/   \___/____/____/   \____/\___/_/ /_/\__/\___/_/ vanilla js by jc

  */

  'use strict'

  const _ = { // Selector and EventListener Util

    qs: function (selector, scope) { return (scope || document).querySelector(selector) },
    qsa: function (selector, scope) { return (scope || document).querySelectorAll(selector) },
    crEl: function (selector, scope) { return (scope || document).createElement(selector) },
    evt: function (evt, target, callback, useCapture) { target.addEventListener(evt, callback, !!useCapture) },
    rmEvt: function (evt, target, callback, useCapture) { target.removeEventListener(evt, callback, !!useCapture) }

  }

  let data = {} // data store object

  const init = function () { // init module
    const LoadData = (function () {
      let buster = Math.floor(Date.now() / 60000)
      let DAM_JSON = '/content/atvi/activision/web/en/data/json/dam-press-center-feed.js?' + buster
      return {
        init: function (callback) {  // asynchronously load entire Press directory
          const xhr = new XMLHttpRequest()
          xhr.open('GET', DAM_JSON, true)
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
              data = JSON.parse(xhr.responseText)
              console.log(data)
              callback()
            }
          }
          xhr.onerror = function () { console.log('Something ain\'t right from the server') }
          xhr.send()
        }
      }
    })()

    const LoadDirectory = (function () {
      let CURSEOFOSIRIS = /destiny2_expansion1_curseofosiris/g
      let WARMIND = /destiny2_expansion2_warmind_PressKit/g
      let FORSAKEN = /forsaken/g
      let SEKIRO = /sekiro/g
      let BO4_REGEXP = /call-of-duty-black-ops-4/g
      let SPYRO_REGEXP = /spyro/g
      let WW2_REGEXP = /call-of-duty-wwii/g
      let CRASH_REGEXP = /crash_bandicoot/g
      let PRODUCTS_REGEXP = /activision_blizzard_consumer_products/g
      let DESTINY2_REGEXP = /destiny2/g
      let IW_REGEXP = /call-of-duty-infinite-warfare/g
      let BO3_REGEXP = /call-of-duty-black-ops-3/g
      let WL_REGEXP = /call-of-duty-world-league/g

      const getTopLevelDirs = function (dir) { // grab top level directories
        let arr = []
        data.entries.forEach(function (obj) {
          if (obj.path.match(dir)) {
            arr.push(obj)
          }
        })

        console.log(arr)

        arr.sort(function (a, b) {
          return a.modifiedTimestamp - b.modifiedTimestamp
        }).reverse()

        return arr

      }

      const buildView = function (arr) { // build the view
        let thumbPath = '/jcr:content/renditions/cq5dam.thumbnail.319.319.png'
        let fileIcon  = '/content/dam/atvi/activision/press-center/file.png'
        let videoIcon = '/content/dam/atvi/activision/press-center/video-player.png'
        let pdfIcon   = '/content/dam/atvi/activision/press-center/pdf.png'
        let tifIcon   = '/content/dam/atvi/activision/press-center/tiff-image-file-outlined-symbol.png'
        let pressGrid = _.qs('.press__grid')

        const templateFrom = function (data, template) {
          return data.reduce(function (markup) {
            for (var len = arguments.length, args = Array(len > 1 ? len - 1 : 0), key = 1; key < len; key++) {
              args[key - 1] = arguments[key]
            }
            return markup.concat(template.apply(args[0], args))
          }, '')
        }

        const template = templateFrom(arr, function (obj) {
          return ('<div class="press__grid__item">' +
            '<a href=' + obj.path.replace(/ /g, '%20') + ' download>' +
            '<img class="press__grid__img" alt="Photo" src="/content/dam/atvi/activision/press-center/loading.svg" data-lazy=' +
            (obj.path.match(/.docx/gi)
              ? fileIcon
              : obj.path.match(/.pdf/gi)
                ? pdfIcon
                : obj.path.match(/.mp4/gi)
                  ? videoIcon
                  : obj.path.match(/.tif/gi)
                    ? tifIcon
                    : obj.path.replace(/ /g, '%20') + thumbPath) + '>' +
            '</a>' +
            '<h3>' + obj.name + '</h3>' +
            '<span>' + 'Width: ' + obj.width + ' Height: ' + obj.height + '</span>' +
            '<a href=' + obj.path.replace(/ /g, '%20') + ' download><i class="dl-icon"></i></a>' +
            '</div>')
        })

        pressGrid.innerHTML = template

        LazyPress.init({ // call LazyPress
          offsetBottom: 400,
          throttle: 200,
          debounce: false,
          unload: false,
          callback: function (element, op) {}
        })

        let pressImgs = _.qsa('.press__grid__img')

        pressImgs.forEach(function (img) {
          if (img.src.match(/white.png/ig)) {
            img.style.backgroundColor = 'grey'
            img.style.padding = '1rem'
          }
        })
      }

      function render (dir) {
        return function () {
          return buildView(getTopLevelDirs(dir))
        }
      }

      return {
        sekiro: render(SEKIRO),
        bo4: render(BO4_REGEXP),
        spyro: render(SPYRO_REGEXP),
        wwii: render(WW2_REGEXP),
        iw: render(IW_REGEXP),
        bo3: render(BO3_REGEXP),
        Wl: render(WL_REGEXP),
        crash: render(CRASH_REGEXP),
        consprod: render(PRODUCTS_REGEXP),
        destiny2: render(DESTINY2_REGEXP),
        forsaken: render(FORSAKEN),
        curseofosiris: render(CURSEOFOSIRIS),
        warmind: render(WARMIND)
      }
    })()

    const RegisterEvents = (function () { // set up event listeners
      return {
        init: function () {
          let width = window.innerWidth
          let sekiro = _.qs('.js-sekiro')
          let iw = _.qs('.js-iw')
          let bo3 = _.qs('.js-bo3')
          let bo4 = _.qs('.js-bo4')
          let spyro = _.qs('.js-spyro')
          let wwii = _.qs('.js-wwii')
          let wl = _.qs('.js-wl')
          let cod = _.qs('.js-cod')
          let destiny = _.qs('.js-dest')
          let d2 = _.qs('.js-d2')
          let forsaken = _.qs('.js-forsaken')
          let curseofosiris = _.qs('.js-curseofosiris')
          let warmind = _.qs('.js-warmind')
          let crash = _.qs('.js-crash')
          let products = _.qs('.js-products')
          let navSubnav = _.qs('.press__nav__wrap')
          let mobileDropbtn = _.qs('.press__nav__mobile')
          let codDropdownContent = _.qs('.js-cod__dropdown-content')
          let destDropdownContent = _.qs('.js-dest__dropdown-content')
          let dataScrollTop = _.qs('.scroll-top')

          let toggleState = function (dataAttr, elem, one, two) {
            elem.setAttribute(dataAttr, elem.getAttribute(dataAttr) === one ? two : one)
          }

          let handleToggleCodDropdown = function () { toggleState('data-cod-dropdown', codDropdownContent, 'open', 'closed') }
          let handleToggleDestDropdown = function () { toggleState('data-dest-dropdown', destDropdownContent, 'open', 'closed') }

          let handleToggleMobile = function () { toggleState('data-mobile', navSubnav, 'open', 'closed') }

          let handleToggleScrollTop = function () {
            (window.pageYOffset > 500)
              ? dataScrollTop.setAttribute('data-scroll', 'up')
              : dataScrollTop.removeAttribute('data-scroll', 'up')
          }

          let resizeFunc = function () {
            let width = window.innerWidth
            if (width > 767) {
              navSubnav.removeAttribute('data-mobile')
              codDropdownContent.removeAttribute('data-cod-dropdown')
              destDropdownContent.removeAttribute('data-dest-dropdown')
              _.rmEvt('click', cod, handleToggleCodDropdown)
              _.rmEvt('click', destiny, handleToggleDestDropdown)
            }
            if (width <= 768) {
              _.evt('click', cod, handleToggleCodDropdown)
              _.evt('click', destiny, handleToggleDestDropdown)
            }
          }

          if (width <= 768) {
            _.evt('click', cod, handleToggleCodDropdown)
            _.evt('click', destiny, handleToggleDestDropdown)
          } else if (width > 769) {
            _.rmEvt('click', cod, handleToggleCodDropdown)
            _.rmEvt('click', destiny, handleToggleDestDropdown)
            _.evt('touchstart', cod, handleToggleCodDropdown)
            _.evt('touchstart', destiny, handleToggleDestDropdown)
          }

          _.evt('click', sekiro, LoadDirectory.sekiro)
          _.evt('click', iw, LoadDirectory.iw)
          _.evt('click', bo3, LoadDirectory.bo3)
          _.evt('click', bo4, LoadDirectory.bo4)
          _.evt('click', spyro, LoadDirectory.spyro)
          _.evt('click', wwii, LoadDirectory.wwii)
          _.evt('click', wl, LoadDirectory.Wl)
          _.evt('click', crash, LoadDirectory.crash)
          _.evt('click', d2, LoadDirectory.destiny2)
          _.evt('click', forsaken, LoadDirectory.forsaken)
          _.evt('click', curseofosiris, LoadDirectory.curseofosiris)
          _.evt('click', warmind, LoadDirectory.warmind)
          _.evt('click', products, LoadDirectory.consprod)
          _.evt('click', mobileDropbtn, handleToggleMobile)
          _.evt('resize', window, resizeFunc)
          _.evt('scroll', window, handleToggleScrollTop)
          _.evt('click', dataScrollTop, function () { window.scrollTo(0, 0) })
        }
      }
    })()

    const LazyPress = (function (root) { // Lazy-load images function with options
      let callback = function () {}
      let offset, poll, delay, useDebounce, unload

      let isHidden = function (element) {
        return (element.offsetParent === null)
      }

      let inView = function (element, view) {
        if (isHidden(element)) { return false }
        let box = element.getBoundingClientRect()
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b)
      }

      let debounceOrThrottle = function () {
        if (!useDebounce && !!poll) { return }
        clearTimeout(poll)
        poll = setTimeout(function () {
          LazyPress.render()
          poll = null
        }, delay)
      }

      return {
        init: function (opts) {
          opts = opts || {}
          let offsetAll = opts.offset || 0
          let offsetVertical = opts.offsetVertical || offsetAll
          let offsetHorizontal = opts.offsetHorizontal || offsetAll

          let optionToInt = function (opt, fallback) {
            return parseInt(opt || fallback, 10)
          }

          offset = {
            t: optionToInt(opts.offsetTop, offsetVertical),
            b: optionToInt(opts.offsetBottom, offsetVertical),
            l: optionToInt(opts.offsetLeft, offsetHorizontal),
            r: optionToInt(opts.offsetRight, offsetHorizontal)
          }

          delay = optionToInt(opts.throttle, 250)
          useDebounce = opts.debounce !== false
          unload = !!opts.unload
          callback = opts.callback || callback

          LazyPress.render()

          if (document.addEventListener) {
            root.addEventListener('scroll', debounceOrThrottle, false)
            root.addEventListener('load', debounceOrThrottle, false)
          } else {
            root.attachEvent('onscroll', debounceOrThrottle)
            root.attachEvent('onload', debounceOrThrottle)
          }
        },

        render: function (context) {
          let nodes = (context || document).querySelectorAll('[data-lazy], [data-lazy-background]')
          let length = nodes.length
          let src, elem
          let view = {
            l: 0 - offset.l,
            t: 0 - offset.t,
            b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
            r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
          }

          for (let i = 0; i < length; i++) {
            elem = nodes[i]
            if (inView(elem, view)) {
              if (unload) {
                elem.setAttribute('data-lazy-placeholder', elem.src)
              }
              if (elem.getAttribute('data-lazy-background') !== null) {
                elem.style.backgroundImage = 'url(' + elem.getAttribute('data-lazy-background') + ')'
              } else if (elem.src !== (src = elem.getAttribute('data-lazy'))) {
                elem.src = src
              }
              if (!unload) {
                elem.removeAttribute('data-lazy')
                elem.removeAttribute('data-lazy-background')
              }
              callback(elem, 'load')
            } else if (unload && !!(src = elem.getAttribute('data-lazy-placeholder'))) {
              if (elem.getAttribute('data-lazy-background') !== null) {
                elem.style.backgroundImage = 'url(' + src + ')'
              } else {
                elem.src = src
              }
              elem.removeAttribute('data-lazy-placeholder')
              callback(elem, 'unload')
            }
          }

          if (!length) {
            LazyPress.detach()
          }
        },

        detach: function () {
          (document.removeEventListener)
            ? root.removeEventListener('scroll', debounceOrThrottle)
            : root.detachEvent('onscroll', debounceOrThrottle)
          clearTimeout(poll)
        }
      }
    })(window)

    LoadData.init(LoadDirectory.bo4) // default to BO4 on page load
    RegisterEvents.init()
  }
  _.evt('DOMContentLoaded', document, init)

})();
