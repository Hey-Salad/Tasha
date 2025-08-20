// components/MediaCapture.tsx
'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { Camera, Video, Upload } from 'lucide-react';

interface MediaCaptureProps {
  onMediaCaptured: (mediaUrl: string, type: 'image' | 'video') => void;
  isLoading: boolean;
}

export const MediaCapture = ({ onMediaCaptured, isLoading }: MediaCaptureProps) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const videoConstraints = {
    width: { ideal: isMobile ? 720 : 1280 },
    height: { ideal: isMobile ? 1280 : 720 },
    facingMode: isMobile ? 'environment' : 'user', // Back camera on mobile for food photos
    aspectRatio: isMobile ? 9/16 : 16/9
  };

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
        
        if (webcamRef.current) {
          webcamRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
        setCameraError('Unable to access camera: ' + errorMessage);
      }
    };

    initCamera();

    return () => {
      // Cleanup camera stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isMobile]);

  const handleCapture = useCallback(() => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        onMediaCaptured(url, 'image');
      }
    }, 'image/jpeg', 0.9);
  }, [onMediaCaptured]);

  const handleStartRecording = useCallback(() => {
    if (!stream) return;

    setIsRecording(true);
    setRecordedChunks([]);

    try {
      // Support for different video formats across devices
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
          mimeType = 'video/webm;codecs=vp8';
        } else if (MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/webm';
        } else {
          throw new Error('No supported video format');
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: isMobile ? 1500000 : 2500000 // Lower bitrate for mobile
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
      };

      mediaRecorderRef.current.start();
    } catch (err) {
      console.error('Error starting recording:', err);
      setCameraError('Video recording not supported on this device');
      setIsRecording(false);
    }
  }, [stream, isMobile]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const maxSize = 50 * 1024 * 1024; // 50MB limit
      if (file.size > maxSize) {
        alert('File too large. Please select a file under 50MB.');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        alert('Unsupported file type. Please select an image (JPEG, PNG, WebP) or video (MP4, WebM, MOV).');
        return;
      }

      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      onMediaCaptured(url, type);
    }
  }, [onMediaCaptured]);

  // Handle recorded chunks
  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      let mimeType = 'video/mp4';
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
      }
      
      const blob = new Blob(recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onMediaCaptured(url, 'video');
      setRecordedChunks([]);
    }
  }, [recordedChunks, isRecording, onMediaCaptured]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#000000',
    borderRadius: '0 0 25px 25px',
    overflow: 'hidden'
  };

  const buttonContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '16px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
    padding: '0 16px',
    zIndex: 10
  };

  const buttonStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    padding: isMobile ? '10px 16px' : '12px 20px',
    fontSize: isMobile ? '12px' : '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(237, 76, 76, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: isMobile ? '80px' : '120px',
    justifyContent: 'center'
  };

  const recordButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: isRecording 
      ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
      : 'linear-gradient(135deg, #ed4c4c 0%, #faa09a 100%)'
  };

  if (cameraError) {
    return (
      <div style={containerStyle}>
        <div style={{
          position: 'absolute',
          inset: '0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: '#111111'
        }}>
          <p style={{ color: '#dc3545', marginBottom: '16px', fontSize: '14px' }}>
            {cameraError}
          </p>
          <button 
            style={{
              ...buttonStyle,
              background: '#666666',
              marginBottom: '12px'
            }}
            onClick={() => window.location.reload()}
          >
            Retry Camera
          </button>
          
          <div style={{ margin: '8px 0', color: '#666666', fontSize: '12px' }}>or</div>
          
          <button
            style={buttonStyle}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
            Upload File
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            capture={isMobile ? "environment" : undefined}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={handleCapture}
          disabled={isLoading || isRecording}
          onMouseEnter={(e) => {
            if (!isLoading && !isRecording) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !isRecording) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
            }
          }}
        >
          <Camera size={isMobile ? 14 : 16} />
          Photo
        </button>

        <button
          style={recordButtonStyle}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isRecording 
                ? '0 6px 16px rgba(220, 53, 69, 0.4)'
                : '0 6px 16px rgba(237, 76, 76, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isRecording
                ? '0 4px 12px rgba(220, 53, 69, 0.3)'
                : '0 4px 12px rgba(237, 76, 76, 0.3)';
            }
          }}
        >
          <Video size={isMobile ? 14 : 16} />
          {isRecording ? 'Stop' : 'Record'}
        </button>

        <button
          style={buttonStyle}
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isRecording}
          onMouseEnter={(e) => {
            if (!isLoading && !isRecording) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(237, 76, 76, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !isRecording) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 76, 76, 0.3)';
            }
          }}
        >
          <Upload size={isMobile ? 14 : 16} />
          Upload
        </button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        capture={isMobile ? "environment" : undefined}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
};