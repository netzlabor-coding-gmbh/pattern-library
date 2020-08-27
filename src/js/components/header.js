export default function scrollToReveal() {
  return {
    sticky: false,
    stickyHidden: false,
    lastPos: window.scrollY + 0,
    scroll() {
      this.sticky = window.scrollY > this.$refs.header.offsetHeight && this.lastPos > window.scrollY;
      this.stickyHidden = window.scrollY > this.$refs.header.offsetHeight && this.lastPos < window.scrollY;
      this.lastPos = window.scrollY;
    },
  };
}
