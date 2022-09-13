const gaBtnTrack = Array.prototype.slice.call(
  document.querySelectorAll('.ga-btn-track')
)
gaBtnTrack.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    ga('send', 'event', e.target.role, e.type, e.target.dataset.label)
  })
})
