import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageComposer } from '../message-composer'

describe('MessageComposer', () => {
  it('renders textarea and send button', () => {
    render(<MessageComposer onSend={jest.fn()} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onSend when send button is clicked', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.type(textarea, 'Test message')
    
    const sendButton = screen.getByRole('button')
    await user.click(sendButton)
    
    expect(handleSend).toHaveBeenCalledWith('Test message')
  })

  it('calls onSend when Enter is pressed', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.type(textarea, 'Test message{Enter}')
    
    expect(handleSend).toHaveBeenCalledWith('Test message')
  })

  it('does not send when Shift+Enter is pressed', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2')
    
    expect(handleSend).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('Line 1\nLine 2')
  })

  it('clears textarea after sending', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.type(textarea, 'Test message')
    
    const sendButton = screen.getByRole('button')
    await user.click(sendButton)
    
    expect(textarea).toHaveValue('')
  })

  it('disables input when disabled prop is true', () => {
    render(<MessageComposer onSend={jest.fn()} disabled />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    const sendButton = screen.getByRole('button')
    
    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('does not send empty messages', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const sendButton = screen.getByRole('button')
    await user.click(sendButton)
    
    expect(handleSend).not.toHaveBeenCalled()
  })

  it('does not send whitespace-only messages', async () => {
    const handleSend = jest.fn()
    const user = userEvent.setup()
    
    render(<MessageComposer onSend={handleSend} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    await user.type(textarea, '   ')
    
    const sendButton = screen.getByRole('button')
    await user.click(sendButton)
    
    expect(handleSend).not.toHaveBeenCalled()
  })

  it('renders with custom placeholder', () => {
    render(<MessageComposer onSend={jest.fn()} placeholder="Custom placeholder" />)
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument()
  })
})
