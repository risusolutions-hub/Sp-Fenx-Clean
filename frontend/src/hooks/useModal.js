import { useState, useCallback } from 'react';

/**
 * Custom hook for managing modal state
 */
export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((data = null) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    toggleModal
  };
}

/**
 * Hook for managing multiple modals
 */
export function useModals() {
  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openModal = useCallback((modalName, data = null) => {
    setActiveModal(modalName);
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData(null);
  }, []);

  const isModalOpen = useCallback((modalName) => {
    return activeModal === modalName;
  }, [activeModal]);

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isModalOpen
  };
}
