import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Layers,
  Wand2,
  Moon,
  Sun,
  Download,
  Loader2,
  Trash2,
  Sparkles
} from 'lucide-react';

// API Configuration
const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

function App() {
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('product');
  const [productImage, setProductImage] = useState(null);
  const [productPrompt, setProductPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState('');

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const getBase64Data = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({
        mimeType: file.type,
        data: reader.result.split(',')[1],
        previewUrl: reader.result
      });
      reader.onerror = reject;
    });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageData = await getBase64Data(file);
      setProductImage(imageData);
    } catch (err) {
      setError('Gagal membaca gambar');
    }
  };

  const handleGenerate = async () => {
    if (!productImage) return setError('Unggah foto dulu!');
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        contents: [{
          parts: [
            { text: productPrompt || "Professional product photography, studio lighting, high resolution" },
            { inlineData: { mimeType: productImage.mimeType, data: productImage.data } }
          ]
        }],
        generationConfig: { responseModalities: ["IMAGE"] }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      const base64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      
      if (base64) setResultImage(`data:image/jpeg;base64,${base64}`);
      else throw new Error('AI tidak mengirim gambar.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-slate-800'}`}>
      <header className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wand2 className="text-blue-500" /> StudioVision AI
        </h1>
        <button onClick={toggleTheme} className="p-2 bg-gray-200 dark:bg-slate-700 rounded-full">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sisi Kiri: Upload */}
            <div className="space-y-4">
              <label className="block p-8 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition cursor-pointer text-center">
                <input type="file" className="hidden" onChange={handleUpload} />
                {productImage ? (
                  <img src={productImage.previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud size={40} className="text-blue-500 mb-2" />
                    <p className="font-medium">Klik untuk Unggah Foto Produk</p>
                  </div>
                )}
              </label>
              
              <textarea 
                placeholder="Contoh: Tambahkan latar belakang pantai dengan cahaya matahari terbenam..."
                className="w-full p-3 rounded-lg border dark:bg-slate-700 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                value={productPrompt}
                onChange={(e) => setProductPrompt(e.target.value)}
              />

              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                Generate Hasil AI
              </button>
            </div>

            {/* Sisi Kanan: Hasil */}
            <div className="bg-gray-100 dark:bg-slate-900 rounded-xl flex items-center justify-center border-2 border-gray-200 dark:border-slate-700 min-h-[300px]">
              {resultImage ? (
                <div className="relative group">
                  <img src={resultImage} alt="Hasil AI" className="rounded-lg shadow-2xl" />
                  <button 
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = resultImage;
                      a.download = 'hasil-produk.jpg';
                      a.click();
                    }}
                    className="absolute bottom-4 right-4 p-3 bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Hasil foto AI akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
          {error && <p className="mt-4 text-red-500 text-center font-medium">⚠️ {error}</p>}
        </div>
      </main>
    </div>
  );
}

// RENDER KE BROWSER
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);