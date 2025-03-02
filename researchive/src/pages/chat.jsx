import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, Send, FileCheck, AlertTriangle, Lightbulb } from 'lucide-react';

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a PDF file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleSendMessage = () => {
    if (message.trim() === '' && !file) return;
    
    let newMessage = message;
    if (file) {
      newMessage += ` [Attached: ${file.name}]`;
    }
    
    setChat([...chat, { type: 'user', content: newMessage }]);
    setMessage('');
    setFile(null);
    
    setTimeout(() => {
      setChat((prev) => [...prev, { 
        type: 'bot', 
        content: 'I received your message. How can I help you with this document?' 
      }]);
    }, 1000);
  };

  const handleFeatureClick = (feature) => {
    if (!file) {
      setChat([...chat, { type: 'bot', content: 'Please upload a PDF document first to use this feature.' }]);
      return;
    }
    
    let botResponse = '';
    switch (feature) {
      case 'summarize':
        botResponse = `I'll summarize the content of "${file.name}" for you. This may take a moment...`;
        break;
      case 'plagiarism':
        botResponse = `I'll check "${file.name}" for potential plagiarism. This may take a moment...`;
        break;
      case 'suggestion':
        botResponse = `I'll provide suggestions for improving "${file.name}". This may take a moment...`;
        break;
    }
    
    setChat([...chat, { type: 'bot', content: botResponse }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <FileText className="mr-2" size={24} />
          <h1 className="text-xl font-bold">PDF Chat Assistant</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col max-w-4xl">
        <div className="flex-1 overflow-y-auto mb-4 border border-gray-200 rounded-lg bg-white p-4">
          {chat.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <FileText size={48} className="mb-4" />
              <p className="text-center">Upload a PDF and start chatting to analyze your document</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chat.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${msg.type === 'user' ? 'bg-black text-white ml-auto' : 'bg-gray-100 text-black mr-auto'} max-w-[80%]`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <button onClick={() => handleFeatureClick('summarize')} className="bg-white border-2 border-black text-black py-2 px-4 rounded-lg hover:bg-gray-100 transition flex items-center justify-center">
            <FileCheck className="mr-2" size={18} />
            Summarize
          </button>
          <button onClick={() => handleFeatureClick('plagiarism')} className="bg-white border-2 border-black text-black py-2 px-4 rounded-lg hover:bg-gray-100 transition flex items-center justify-center">
            <AlertTriangle className="mr-2" size={18} />
            Plagiarism Check
          </button>
          <button onClick={() => handleFeatureClick('suggestion')} className="bg-white border-2 border-black text-black py-2 px-4 rounded-lg hover:bg-gray-100 transition flex items-center justify-center">
            <Lightbulb className="mr-2" size={18} />
            Suggestions
          </button>
        </div>

        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${isDragActive ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-gray-400'}`}>
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-2" size={24} />
          {file ? (
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Drop your PDF here, or click to select</p>
              <p className="text-sm text-gray-500">Only PDF files are supported</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here..." className="flex-1 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-black" onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} />
          <button onClick={handleSendMessage} className="bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition">
            <Send size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
