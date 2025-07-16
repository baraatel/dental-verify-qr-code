
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVerifyLicense } from '@/hooks/useClinicData';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose?: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerReady, setScannerReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const qrCodeRegionId = "qr-reader";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { verifyLicense } = useVerifyLicense();

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const parseQRData = (qrText: string) => {
    try {
      // Try to parse as JSON first (new format)
      const qrData = JSON.parse(qrText);
      if (qrData.type === 'clinic' && qrData.license) {
        return qrData.license;
      }
    } catch {
      // If not JSON, treat as direct license number (old format)
      return qrText;
    }
    return qrText;
  };

  const handleQRDetection = async (qrText: string) => {
    const licenseNumber = parseQRData(qrText);
    console.log("QR Code detected:", qrText, "License:", licenseNumber);
    
    try {
      await verifyLicense(licenseNumber, 'qr_scan');
      onScan(licenseNumber);
      toast({
        title: "تم مسح الكود بنجاح",
        description: `رقم الترخيص: ${licenseNumber}`,
      });
      stopScanning();
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "خطأ في التحقق",
        description: "حدث خطأ أثناء التحقق من البيانات",
        variant: "destructive",
      });
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        handleQRDetection,
        (errorMessage) => {
          // تجاهل الأخطاء العادية أثناء المسح
        }
      );

      setScannerReady(true);
      toast({
        title: "الكاميرا جاهزة",
        description: "وجه الكاميرا نحو رمز QR للمسح",
      });
    } catch (err) {
      console.error("خطأ في بدء المسح:", err);
      toast({
        title: "خطأ في الكاميرا",
        description: "تأكد من منح الإذن للوصول للكاميرا",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (err) {
      console.error("خطأ في إيقاف المسح:", err);
    }
    setIsScanning(false);
    setScannerReady(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            await handleQRDetection(code.data);
          } else {
            toast({
              title: "لم يتم العثور على رمز QR",
              description: "تأكد من وضوح الصورة ووجود رمز QR صالح",
              variant: "destructive",
            });
          }
        }
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("خطأ في قراءة الصورة:", error);
      toast({
        title: "خطأ في قراءة الصورة",
        description: "حدث خطأ أثناء معالجة الصورة",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">مسح رمز QR</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          id={qrCodeRegionId}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
        >
          {!isScanning && (
            <div className="text-center text-gray-500">
              <Camera className="mx-auto h-12 w-12 mb-2" />
              <p>اضغط على "بدء المسح" لتشغيل الكاميرا</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="mr-2 h-4 w-4" />
              بدء المسح
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              إيقاف المسح
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            رفع صورة
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {selectedFile && (
          <p className="text-sm text-gray-600 text-center">
            تم تحديد: {selectedFile.name}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default QRScanner;
