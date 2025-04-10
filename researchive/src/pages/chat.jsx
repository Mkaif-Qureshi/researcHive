import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileText, BrainCircuit, Lightbulb, MessageSquare, Send, Download, RefreshCw, Podcast } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// API base URL - can be configured based on environment
const API_BASE_URL = 'http://localhost:5000/api';

const ResearchAssistant = () => {
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [activeOperation, setActiveOperation] = useState(null);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [pdfName, setPdfName] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ message: '', isError: false });
  const [summary, setSummary] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [podcastDuration, setPodcastDuration] = useState(12);
  const [podcastAudio, setPodcastAudio] = useState(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);


  // Check for existing PDF on load
  useEffect(() => {
    // You could implement an endpoint to check if a PDF is already processed
    // For now, we'll just reset the state
    setPdfUploaded(false);
    setPdfName('');
    setSummary('');
    setSuggestions('');
    setChatHistory([]);
    setPodcastAudio(null);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    setIsLoading(true);
    setActiveOperation('upload');
    setUploadStatus({ message: '', isError: false });

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/refresh`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadStatus({
        message: response.data.message || 'PDF uploaded successfully!',
        isError: false
      });
      setPdfUploaded(true);
      setPdfName(file.name);

      // Reset other states when new PDF is uploaded
      setSummary('');
      setSuggestions('');
      setChatHistory([]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadStatus({
        message: error.response?.data?.error || 'Failed to upload PDF. Please try again.',
        isError: true
      });
      setPdfUploaded(false);
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  // Request summary
  const handleGetSummary = async () => {
    if (!pdfUploaded) {
      setUploadStatus({
        message: 'Please upload a PDF first.',
        isError: true
      });
      return;
    }

    setIsLoading(true);
    setActiveOperation('summary');

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/summarize`, {
        query: customQuery || 'Summarize the research paper'
      });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error getting summary:', error);
      setUploadStatus({
        message: error.response?.data?.error || 'Failed to generate summary.',
        isError: true
      });
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  // Request research suggestions
  const handleGetSuggestions = async () => {
    if (!pdfUploaded) {
      setUploadStatus({
        message: 'Please upload a PDF first.',
        isError: true
      });
      return;
    }

    setIsLoading(true);
    setActiveOperation('suggestions');

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/research_suggestions`, {
        query: customQuery || 'Suggest future research directions'
      });
      setSuggestions(response.data.research_suggestions);
    } catch (error) {
      console.error('Error getting research suggestions:', error);
      setUploadStatus({
        message: error.response?.data?.error || 'Failed to generate research suggestions.',
        isError: true
      });
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  // New function to generate podcast
  const handleGeneratePodcast = async () => {
    if (!pdfUploaded) {
      setUploadStatus({
        message: 'Please upload a PDF first.',
        isError: true
      });
      return;
    }

    setIsLoading(true);
    setActiveOperation('podcast');
    setPodcastAudio(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/generate_podcast`,
        { duration: podcastDuration },
        { responseType: 'blob' }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      setPodcastAudio(URL.createObjectURL(audioBlob));
    } catch (error) {
      console.error('Error generating podcast:', error);
      setUploadStatus({
        message: error.response?.data?.error || 'Failed to generate podcast.',
        isError: true
      });
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  // Handle chat with the document
  const handleChat = async (e) => {
    e.preventDefault();

    if (!pdfUploaded) {
      setUploadStatus({
        message: 'Please upload a PDF first.',
        isError: true
      });
      return;
    }

    if (!chatQuery.trim()) {
      return;
    }

    const userQuery = chatQuery.trim();
    setChatHistory([...chatHistory, { role: 'user', content: userQuery }]);
    setChatQuery('');
    setIsLoading(true);
    setActiveOperation('chat');

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/chat`, {
        query: userQuery
      });

      const aiResponse = response.data.response;
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting chat response:', error);
      setUploadStatus({
        message: error.response?.data?.error || 'Failed to get a response.',
        isError: true
      });
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      setActiveOperation(null);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setChatHistory([]);
  };

  // Export chat history
  const exportChat = () => {
    const chatText = chatHistory.map(msg =>
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`
    ).join('\n\n');

    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfName.replace('.pdf', '')}-chat-export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container mx-auto py-10 px-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Research Paper Assistant</CardTitle>
          <CardDescription>
            Upload a research paper and get AI-powered analysis and answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={triggerFileInput}>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
            />
            {isLoading && activeOperation === 'upload' ? (
              <Loader2 className="h-12 w-12 text-gray-400 mb-2 animate-spin" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF files only</p>
          </div>

          {uploadStatus.message && (
            <Alert className={`mt-4 ${uploadStatus.isError ? 'bg-red-50' : 'bg-green-50'}`}>
              <AlertTitle>{uploadStatus.isError ? 'Error' : 'Success'}</AlertTitle>
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          {pdfUploaded && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-green-600">
                <FileText size={16} />
                <span>{pdfName || 'PDF processed and ready'}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary" disabled={isLoading}>
            <div className="flex items-center gap-2">
              <BrainCircuit size={16} />
              <span>Summary</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="suggestions" disabled={isLoading}>
            <div className="flex items-center gap-2">
              <Lightbulb size={16} />
              <span>Research Suggestions</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={isLoading}>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <span>Chat</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="podcast" disabled={isLoading}>
            <div className="flex items-center gap-2">
              <Podcast size={16} />
              <span>Podcast</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Paper Summary</CardTitle>
              <CardDescription>
                Get a comprehensive summary of the uploaded research paper
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Custom query (optional, e.g., 'Summarize the methodology')"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {summary ? (
                <div className="p-4 bg-gray-50 rounded-md prose max-w-none">
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
                  Summary will appear here
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGetSummary} disabled={isLoading || !pdfUploaded} className="w-full">
                {isLoading && activeOperation === 'summary' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  'Generate Summary'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Research Suggestions</CardTitle>
              <CardDescription>
                Get AI-generated ideas for future research directions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Custom query (optional, e.g., 'Suggest research on limitations')"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {suggestions ? (
                <div className="p-4 bg-gray-50 rounded-md prose max-w-none">
                  <ReactMarkdown>{suggestions}</ReactMarkdown>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
                  Research suggestions will appear here
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleGetSuggestions} disabled={isLoading || !pdfUploaded} className="w-full">
                {isLoading && activeOperation === 'suggestions' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  'Generate Research Suggestions'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Ask about the Paper</CardTitle>
                <CardDescription>
                  Chat with the AI about specific aspects of the research paper
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={clearChat}
                        disabled={isLoading || chatHistory.length === 0}
                      >
                        <RefreshCw size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear chat history</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={exportChat}
                        disabled={isLoading || chatHistory.length === 0}
                      >
                        <Download size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Export conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent
              className="flex-grow overflow-y-auto mb-4"
              ref={chatContainerRef}
            >
              <div className="space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p>Ask a question about the research paper</p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3/4 rounded-lg p-3 ${message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                          }`}
                      >
                        <div className="prose max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && activeOperation === 'chat' && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <form onSubmit={handleChat} className="w-full flex gap-2">
                <Input
                  placeholder="Ask a question about the paper..."
                  value={chatQuery}
                  onChange={(e) => setChatQuery(e.target.value)}
                  disabled={isLoading || !pdfUploaded}
                  className="flex-grow"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !pdfUploaded || !chatQuery.trim()}
                >
                  {isLoading && activeOperation === 'chat' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="podcast">
          <Card>
            <CardHeader>
              <CardTitle>Research Paper Podcast</CardTitle>
              <CardDescription>
                Generate an AI-narrated podcast from your research paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="podcast-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Podcast Duration (minutes)
                </label>
                <Input
                  id="podcast-duration"
                  type="number"
                  min="5"
                  max="30"
                  value={podcastDuration}
                  onChange={(e) => setPodcastDuration(Number(e.target.value))}
                  disabled={isLoading || !pdfUploaded}
                  className="w-full"
                />
              </div>

              {podcastAudio ? (
                <div className="mt-4">
                  <audio controls className="w-full">
                    <source src={podcastAudio} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-gray-500 text-center">
                  Generated podcast will appear here
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGeneratePodcast}
                disabled={isLoading || !pdfUploaded}
                className="w-full"
              >
                {isLoading && activeOperation === 'podcast' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Podcast...
                  </>
                ) : (
                  <>
                    <Podcast className="mr-2 h-4 w-4" />
                    Generate Podcast
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearchAssistant;