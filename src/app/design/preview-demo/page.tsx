"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProcessingAnimation } from '@/components/ui/processing-animation';
import ZoomablePreviewDemoPage from './zoomable-preview-demo';
import ActionPanelDemoPage from './action-panel-demo';
import { PageTransitionWrapper } from '@/components/ui/page-transition-wrapper';

export default function PreviewDemo() {
  const [activeTab, setActiveTab] = useState("processing");
  const [status, setStatus] = useState<'initial' | 'processing' | 'complete' | 'error'>('initial');
  const [message, setMessage] = useState('Starting process...');
  const [progress, setProgress] = useState(0);
  const [determinate, setDeterminate] = useState(true);
  const [customText, setCustomText] = useState('');
  const [autoProgress, setAutoProgress] = useState(false);

  // Handle auto-progress simulation
  useEffect(() => {
    if (!autoProgress || status !== 'processing' || !determinate) return;
    
    let progressTimer: NodeJS.Timeout;
    
    if (progress < 100) {
      progressTimer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 2, 100));
      }, 200);
    } else {
      // When progress reaches 100%, complete the process
      setTimeout(() => {
        setStatus('complete');
        setMessage('Process completed successfully!');
      }, 500);
    }
    
    return () => {
      if (progressTimer) clearTimeout(progressTimer);
    };
  }, [progress, autoProgress, status, determinate]);

  // Reset to initial state
  const handleReset = () => {
    setStatus('initial');
    setMessage('Starting process...');
    setProgress(0);
  };
  
  // Start processing
  const handleStart = () => {
    setStatus('processing');
    setMessage('Processing your request...');
  };
  
  // Handle completion
  const handleComplete = () => {
    setStatus('complete');
    setMessage('Process completed successfully!');
  };
  
  // Simulate error
  const handleError = () => {
    setStatus('error');
    setMessage('An error occurred!');
  };

  return (
    <PageTransitionWrapper>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Preview & Processing Demos</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="processing">Processing Animation</TabsTrigger>
            <TabsTrigger value="zoomable">Zoomable Preview</TabsTrigger>
            <TabsTrigger value="action-panel">Action Panel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="processing" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Animation Preview */}
              <div className="p-6 border rounded-lg bg-white shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <ProcessingAnimation 
                  state={status}
                  progress={progress}
                  size="md"
                  className="mx-auto"
                />
                <p className="mt-4 text-center">{message}</p>
                {determinate && progress > 0 && (
                  <div className="w-full max-w-xs mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      {customText || `${progress}%`}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Animation Controls</h2>
                
                {/* Status Controls */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Animation State</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={handleReset} 
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                    >
                      Initial
                    </button>
                    <button 
                      onClick={handleStart} 
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md text-sm"
                    >
                      Processing
                    </button>
                    <button 
                      onClick={handleComplete} 
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 rounded-md text-sm"
                    >
                      Complete
                    </button>
                    <button 
                      onClick={handleError} 
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm"
                    >
                      Error
                    </button>
                  </div>
                </div>
                
                {/* Progress Controls */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Progress Options</h3>
                  <div className="flex items-center mb-3">
                    <input 
                      type="checkbox" 
                      id="determinate" 
                      checked={determinate}
                      onChange={() => setDeterminate(!determinate)}
                      className="mr-2"
                    />
                    <label htmlFor="determinate">Show determinate progress</label>
                  </div>
                  
                  {determinate && (
                    <>
                      <div className="mb-3">
                        <label className="block text-sm mb-1">Progress value</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={progress} 
                          onChange={(e) => setProgress(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        <input 
                          type="checkbox" 
                          id="auto-progress" 
                          checked={autoProgress}
                          onChange={() => {
                            setAutoProgress(!autoProgress);
                            if (!autoProgress && status !== 'processing') {
                              setStatus('processing');
                              setProgress(0);
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor="auto-progress">Auto-progress simulation</label>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm mb-1">Custom progress text (optional)</label>
                        <input 
                          type="text" 
                          value={customText} 
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder="e.g. 'Uploading: 45%'"
                          className="px-3 py-1 border rounded w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                {/* Message Control */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Message</h3>
                  <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="px-3 py-1 border rounded w-full"
                  />
                </div>
                
                {/* Size Options */}
                <div>
                  <h3 className="font-medium mb-2">Size Options</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                      <p className="text-sm mb-2">Small</p>
                      <ProcessingAnimation 
                        state={status}
                        size="sm"
                        className="mx-auto"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm mb-2">Medium</p>
                      <ProcessingAnimation 
                        state={status}
                        size="md"
                        className="mx-auto"
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-sm mb-2">Large</p>
                      <ProcessingAnimation 
                        state={status}
                        size="lg"
                        className="mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="zoomable" className="mt-0">
            <ZoomablePreviewDemoPage />
          </TabsContent>
          
          <TabsContent value="action-panel" className="mt-0">
            <ActionPanelDemoPage />
          </TabsContent>
        </Tabs>
      </div>
    </PageTransitionWrapper>
  );
} 