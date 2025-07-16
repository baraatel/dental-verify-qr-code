
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  value, 
  size = 200, 
  title = "QR Code",
  showDownload = false 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) console.error('Error generating QR code:', error);
      });
    }
  }, [value, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  if (!value) {
    return (
      <Card className="w-fit">
        <CardContent className="p-6 text-center">
          <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">لا يوجد بيانات لإنشاء رمز QR</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-fit">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center space-y-3">
          <canvas 
            ref={canvasRef}
            className="border border-gray-200 rounded"
          />
          <p className="text-xs text-gray-600 max-w-[200px] break-all text-center">
            {value}
          </p>
          {showDownload && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadQR}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تحميل
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
