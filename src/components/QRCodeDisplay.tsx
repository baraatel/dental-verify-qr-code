
import { QrCode } from "lucide-react";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

const QRCodeDisplay = ({ value, size = 200, className = "" }: QRCodeDisplayProps) => {
  // Generate a simple QR-like pattern for demonstration
  // In a real app, you'd use a proper QR code library
  const generateQRPattern = (text: string) => {
    const grid = 21; // Standard QR code is 21x21 for version 1
    const pattern = [];
    
    for (let i = 0; i < grid; i++) {
      const row = [];
      for (let j = 0; j < grid; j++) {
        // Create a pseudo-random pattern based on text and position
        const hash = (text.charCodeAt((i + j) % text.length) + i * j) % 3;
        row.push(hash > 0);
      }
      pattern.push(row);
    }
    
    return pattern;
  };

  const pattern = generateQRPattern(value);
  const cellSize = size / 21;

  return (
    <div className={`inline-block bg-white p-4 rounded-lg shadow-md ${className}`}>
      <div className="mb-2 text-center">
        <QrCode className="h-5 w-5 mx-auto text-gray-600" />
        <p className="text-xs text-gray-500 mt-1">QR Code</p>
      </div>
      <div 
        style={{ 
          width: size, 
          height: size,
          display: 'grid',
          gridTemplateColumns: `repeat(21, 1fr)`,
          gridTemplateRows: `repeat(21, 1fr)`,
          border: '2px solid #000'
        }}
      >
        {pattern.flat().map((cell, index) => (
          <div
            key={index}
            style={{
              backgroundColor: cell ? '#000' : '#fff',
              width: '100%',
              height: '100%'
            }}
          />
        ))}
      </div>
      <p className="text-xs text-center text-gray-600 mt-2 break-all">
        {value}
      </p>
    </div>
  );
};

export default QRCodeDisplay;
