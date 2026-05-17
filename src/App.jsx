import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import Steps from './components/Steps.jsx';
import Gallery from './components/Gallery.jsx';
import CTABanner from './components/CTABanner.jsx';
import Footer from './components/Footer.jsx';
import Editor from './components/Editor.jsx';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const toastTimerRef = useRef(null);
  const imageUrlRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
  }, []);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please choose an image file');
      return;
    }
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;
    setImageFile(file);
    setImageUrl(url);
    setEditorOpen(true);
  }, [showToast]);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setImageFile(null);
    setImageUrl(null);
  }, []);

  const openPicker = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  return (
    <>
      {!editorOpen && (
        <>
          <Header onStart={openPicker} />
          <main>
            <Hero onFile={handleFile} onPick={openPicker} />
            <Features />
            <Steps />
            <Gallery />
            <div className="container">
              <CTABanner onPick={openPicker} />
            </div>
          </main>
          <Footer />
        </>
      )}

      {editorOpen && imageUrl && (
        <Editor
          imageUrl={imageUrl}
          imageFile={imageFile}
          onClose={closeEditor}
          onToast={showToast}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          handleFile(e.target.files[0]);
          e.target.value = '';
        }}
        accept="image/*"
        className="hidden-input"
      />
      <Analytics />
    </>
  );
}
