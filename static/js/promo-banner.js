const promoBanner = document.getElementById('promo-banner')
const closePromoBanner = document.getElementById('close-banner')
const navbar = document.getElementById('navbar')
const tdTocWrapper = document.querySelector('.td-toc')

if (promoBanner) {
  closePromoBanner.addEventListener('click', () => {
    // Close banner
    promoBanner.classList.remove('active')

    // Drop cookie to keep banner closed 24 hours for user
    createCookie('banner_closed', 1, 1)
    navbar.style.top = '0px'
    if (tdTocWrapper) tdTocWrapper.classList.remove('bumped')
  })

  if (!readCookie('banner_closed')) {
    // Show promo banner if no "closed_banner" cookie
    promoBanner.classList.add('active')
    if (tdTocWrapper) tdTocWrapper.classList.add('bumped')

    // Adjust navbar position after promo banner appears
    setTimeout(() => {
      navbarPosition()
    }, 150)

    // Set nav position as user scrolls
    window.addEventListener('scroll', function () {
      navbarPosition()
    })

    // Set nav position as user resizes browser width
    window.addEventListener('resize', () => {
      if (window.innerWidth < 992) {
        navbar.style.top = '0px'
      } else {
        navbar.style.top = `${
          promoBanner.getClientRects()[0].height - this.window.scrollY
        }px`
      }
    })
  } else {
    // Set nav position on page load
    navbarPosition()
  }
}

function navbarPosition() {
  if (this.window.scrollY < promoBanner.offsetHeight) {
    navbar.style.top = `${
      promoBanner.getClientRects()[0].height - this.window.scrollY
    }px`
  } else {
    navbar.style.top = '0px'
  }
}

// *************************************
//   Helper function to create cookies **
// ***************************************
function createCookie(name, value, days) {
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + value + expires + '; path=/'
}

// **********************************************
//   Helper function to get/read cookie values  **
// ************************************************
function readCookie(name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length)
    }
    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length)
    }
  }
  return null
}
