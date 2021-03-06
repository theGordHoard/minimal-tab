let apiRoot = 'https://minimal.gordhoard.org'

let imageEl = document.getElementById('image')

// Chrome storage wrapper
class Storage {
  static get(key) {
    return new Promise(res => {
      chrome.storage.sync.get([key], value => {
        res(value)
      })
    })
  }
  static set(obj) {
    return new Promise(res => {
      chrome.storage.sync.set(obj, result => {
        res(result)
      })
    })
  }
}

// Custom context menu
const menu = document.querySelector(".menu")

const transitions = {
  fade: {
    in: image => {
      return new Promise(res => {
        imageEl.style.background = `url(${image}) no-repeat center center fixed`
        imageEl.style.backgroundSize = 'cover'
        let overlay = document.getElementById('overlay')
        overlay.classList.add('transparent')
        overlay.addEventListener('transitionend', () => {
          res()
        }, { once: true })
      })
    },
    out: image => {
      return new Promise(res => {
        let overlay = document.getElementById('overlay')
        overlay.classList.remove('transparent')
        overlay.addEventListener('transitionend', () => {
          res()
        }, { once: true })
      })
    },
    init: () => {
      let secondaryOverlay = document.getElementById('secondary-overlay')
      secondaryOverlay.classList.add('fade')
    }
  },
  slide: {
    in: image => {
      return new Promise(res => {
        imageEl.style.background = `url(${image}) no-repeat center center fixed`
        imageEl.style.backgroundSize = 'cover'
        let overlay = document.getElementById('overlay')
        let secondaryOverlay = document.getElementById('secondary-overlay')
        
        let overlayPromise = new Promise(overlayRes => {
          overlay.addEventListener('transitionend', () => {
            overlayRes()
          }, { once: true })
        })
        let secondaryPromise = new Promise(secondaryRes => {
          secondaryOverlay.addEventListener('transitionend', () => {
            secondaryRes()
          }, { once: true })
        })
        overlay.classList.add('transparent')
        secondaryOverlay.classList.add('slideout', 'transparent')
        Promise.all([overlayPromise, secondaryPromise]).then(() => {
          res()
        })
      })
    },
    out: image => {
      return new Promise(res => {
        let overlay = document.getElementById('overlay')
        let secondaryOverlay = document.getElementById('secondary-overlay')
        
        let overlayPromise = new Promise(overlayRes => {
          overlay.addEventListener('transitionend', () => {
            overlayRes()
          }, { once: true })
        })
        let secondaryPromise = new Promise(secondaryRes => {
          secondaryOverlay.addEventListener('transitionend', () => {
            secondaryRes()
          }, { once: true })
        })
        overlay.classList.remove('transparent')
        secondaryOverlay.classList.remove('slideout', 'transparent')
        Promise.all([overlayPromise, secondaryPromise]).then(() => {
          res()
        })
      })
    },
    init: () => {
      let secondaryOverlay = document.getElementById('secondary-overlay')
      secondaryOverlay.classList.add('slide')
    }
  },
  slideFast: {
    in: image => {
      return new Promise(res => {
        imageEl.style.background = `url(${image}) no-repeat center center fixed`
        imageEl.style.backgroundSize = 'cover'
        let overlay = document.getElementById('overlay')
        let secondaryOverlay = document.getElementById('secondary-overlay')
        
        let overlayPromise = new Promise(overlayRes => {
          overlay.addEventListener('transitionend', () => {
            overlayRes()
          }, { once: true })
        })
        let secondaryPromise = new Promise(secondaryRes => {
          secondaryOverlay.addEventListener('transitionend', () => {
            secondaryRes()
          }, { once: true })
        })
        overlay.classList.add('transparent')
        secondaryOverlay.classList.add('slideout', 'transparent')
        Promise.all([overlayPromise, secondaryPromise]).then(() => {
          res()
        })
      })
    },
    out: image => {
      return new Promise(res => {
        let overlay = document.getElementById('overlay')
        let secondaryOverlay = document.getElementById('secondary-overlay')
        
        let overlayPromise = new Promise(overlayRes => {
          overlay.addEventListener('transitionend', () => {
            overlayRes()
          }, { once: true })
        })
        let secondaryPromise = new Promise(secondaryRes => {
          secondaryOverlay.addEventListener('transitionend', () => {
            secondaryRes()
          }, { once: true })
        })
        overlay.classList.remove('transparent')
        secondaryOverlay.classList.remove('slideout', 'transparent')
        Promise.all([overlayPromise, secondaryPromise]).then(() => {
          res()
        })
      })
    },
    init: () => {
      let secondaryOverlay = document.getElementById('secondary-overlay')
      secondaryOverlay.classList.add('slide-fast')
    }
  }
}

const contextActions = {
  toggleLock: async () => {
    let currentState = (await Storage.get('imageLock')).imageLock
    await Storage.set({ imageLock: !currentState })
    if (currentState) {
      // No longer locked
      let imageLockElement = document.querySelector('.js-imagelock')
      imageLockElement.textContent = 'Lock Image'
    } else {
      // Locked, store image url
      let imageLockElement = document.querySelector('.js-imagelock')
      imageLockElement.textContent = 'Unlock Image'
    }
  },
  shuffle: async () => {
    menu.style.display = ''
    menu.style.top = ''
    menu.style.left = ''

    await transition.out()
    let randomImages = (await fetch(`${apiRoot}/api/random/bulk?orientation=${(window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait'}`)
      .then(res => { return res.json() }))
    // Select random from array
    let currentImage = randomImages[Math.floor(Math.random() * randomImages.length)]
    let image = new Image()
    image.onload = () => {
      transition.in(`${currentImage.url}${(window.innerWidth > window.innerHeight) ? '&w=' + window.screen.width : '&h=' + window.screen.height}`)
    }
    image.src = `${currentImage.url}${(window.innerWidth > window.innerHeight) ? '&w=' + window.screen.width : '&h=' + window.screen.height}`
    Storage.set({ currentImage })
  },
  imageCredits: async () => {
    let currentImage = (await Storage.get('currentImage')).currentImage
    window.open(currentImage.credit.url)

    menu.style.display = ''
    menu.style.top = ''
    menu.style.left = ''
  },
  transitionChange: async transitionMode => {
    menu.style.display = ''
    menu.style.top = ''
    menu.style.left = ''

    await Storage.set({ transitionMode })
    await transition.out()
    location.reload()
  },
  toggleBlur: async (params, el) => {
    await Storage.set({ blur: !(await Storage.get('blur')).blur})
    image.classList.toggle('blur')
    el.classList.toggle('toggle-selected')
  }
}

window.addEventListener('click', e => {
  if (menu.contains(e.target) || menu === e.target) {
    if (e.target.dataset.action && contextActions[e.target.dataset.action]) contextActions[e.target.dataset.action](e.target.dataset.params, e.target)
  } else {
    menu.style.display = ''
    menu.style.top = ''
    menu.style.left = ''
  }
})

window.addEventListener("contextmenu", e => {
  e.preventDefault()
  if (menu.contains(e.target) || menu === e.target) return
  menu.style.top = `${e.pageY}px`
  menu.style.left = `${e.pageX}px`
  if (getComputedStyle(menu).display === 'none') {
    menu.style.display = 'block'
  }
})

initSettings()

async function initSettings() {
  let { transitionMode } = await Storage.get('transitionMode')
  if (!transitionMode) transitionMode = 'fade'
  window.transition = transitions[transitionMode]
  let transitionSettings = document.querySelector(`.js-transition-${transitionMode}`)
  transitionSettings.classList.add('toggle-selected')

  let { blur } = await Storage.get('blur')
  if (blur) {
    image.classList.add('blur')
    document.querySelector('.js-blur').classList.add('toggle-selected')
  }

  await transition.init()

  let currentImage
  let { imageLock } = await Storage.get('imageLock')
  console.log(imageLock ? 'Image locked, not fetching new image' : 'Fetching new image.')
  if (imageLock) {
    let imageLockElement = document.querySelector('.js-imagelock')
    imageLockElement.textContent = 'Unlock Image'
    currentImage = (await Storage.get('currentImage')).currentImage
  } else {
    currentImage = (await fetch(`${apiRoot}/api/random/${(window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait'}`)
      .then(res => { return res.json() }))
    Storage.set({ currentImage })
  }

  // Fade in image
  let background = new Image()
  background.src = `${currentImage.url}${(window.innerWidth > window.innerHeight) ? '&w=' + window.screen.width : '&h=' + window.screen.height}`
  background.onload = () => {
    transition.in(`${currentImage.url}${(window.innerWidth > window.innerHeight) ? '&w=' + window.screen.width : '&h=' + window.screen.height}`)
  }
}
