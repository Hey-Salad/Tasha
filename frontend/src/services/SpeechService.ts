export class SpeechService {
    private recognition: any = null;
    private isListening: boolean = false;
    
    constructor() {
      // Initialize speech recognition if browser supports it
      if (typeof window !== 'undefined') {
        // @ts-ignore - TypeScript doesn't know about the window.webkitSpeechRecognition API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.lang = 'en-US';
        }
      }
    }
    
    /**
     * Check if speech recognition is supported
     */
    isSupported(): boolean {
      return this.recognition !== null;
    }
    
    /**
     * Start listening for speech
     */
    startListening(onResult: (text: string) => void, onError: (error: any) => void): void {
      if (!this.isSupported()) {
        onError(new Error("Speech recognition not supported by your browser"));
        return;
      }
      
      if (this.isListening) {
        this.stopListening();
      }
      
      this.isListening = true;
      
      this.recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        onResult(text);
      };
      
      this.recognition.onerror = (event: any) => {
        onError(event.error);
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
      };
      
      try {
        this.recognition.start();
      } catch (error) {
        onError(error);
        this.isListening = false;
      }
    }
    
    /**
     * Stop listening for speech
     */
    stopListening(): void {
      if (this.isListening && this.recognition) {
        try {
          this.recognition.stop();
        } catch (error) {
          console.error("Error stopping speech recognition:", error);
        }
        this.isListening = false;
      }
    }
    
    /**
     * Check if currently listening
     */
    getIsListening(): boolean {
      return this.isListening;
    }
  }