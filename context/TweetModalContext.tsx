import React, { createContext, useContext, useState } from "react";

const TweetModalContext = createContext({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export const TweetModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);


  
  return (
    <TweetModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </TweetModalContext.Provider>
  );
};

export const useTweetModal = () => useContext(TweetModalContext);
