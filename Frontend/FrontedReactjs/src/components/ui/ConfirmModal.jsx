import React from 'react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDestructive = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-surface-600 dark:text-surface-400">{message}</p>
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button variant={isDestructive ? 'danger' : 'brand405'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
