import { css } from 'styled-components'

const sizes = {
  giant: 1200,
  desktop: 992,
  tablet: 768,
  phone: 376
}

export const media = Object.keys(sizes).reduce((accumulator, label) => {
  const emSize = sizes[label] / 16
  accumulator[label] = (...args) => css`
    @media (max-width: ${emSize}em) {
      ${css(...args)}
    }
  `
  return accumulator
}, {})

export const mediaopacity = {
  handheld: (...args) => css`
  @media
  (-webkit-min-device-pixel-ratio: 2),
  (min-resolution: 192dpi) {
      ${ css(...args) }
    }
  `
}
