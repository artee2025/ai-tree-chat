import { render, screen } from '@testing-library/react'
import { TypingIndicator } from '../typing-indicator'

describe('TypingIndicator', () => {
  it('renders AI avatar', () => {
    render(<TypingIndicator />)
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots).toHaveLength(3)
  })

  it('has correct styling classes', () => {
    const { container } = render(<TypingIndicator />)
    const dotsContainer = container.querySelector('.flex.items-center.gap-1')
    expect(dotsContainer).toBeInTheDocument()
  })
})
