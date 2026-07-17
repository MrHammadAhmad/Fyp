import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import Button from './Button'
import Input from './Input'

export default function PromptModal({ isOpen, onClose, onSubmit, title, message, defaultValue = '', placeholder = '', confirmText = 'Submit', cancelText = 'Cancel' }) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) setValue(defaultValue)
  }, [isOpen, defaultValue])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(value)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="p-6">
        {message && <p className="mb-4 text-surface-600 dark:text-surface-400">{message}</p>}
        <Input 
          autoFocus
          value={value} 
          onChange={(e) => setValue(e.target.value)} 
          placeholder={placeholder} 
        />
        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button type="submit" variant="brand405">{confirmText}</Button>
        </div>
      </form>
    </Modal>
  )
}
