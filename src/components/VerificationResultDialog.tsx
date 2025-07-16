
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Phone, MapPin, Calendar, User, RotateCcw, Share2 } from 'lucide-react';
import { Clinic } from '@/types/clinic';

interface VerificationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic: Clinic | null;
  status: 'success' | 'failed' | 'not_found';
  licenseNumber: string;
  onScanAgain: () => void;
}

const VerificationResultDialog: React.FC<VerificationResultDialogProps> = ({
  open,
  onOpenChange,
  clinic,
  status,
  licenseNumber,
  onScanAgain
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="h-16 w-16 text-green-500" />,
          title: "ترخيص صالح ✓",
          titleColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      case 'not_found':
        return {
          icon: <XCircle className="h-16 w-16 text-red-500" />,
          title: "الترخيص غير موجود ✗",
          titleColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      default:
        return {
          icon: <AlertCircle className="h-16 w-16 text-yellow-500" />,
          title: "خطأ في التحقق ⚠",
          titleColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        };
    }
  };

  const getStatusBadge = (licenseStatus?: string) => {
    switch (licenseStatus) {
      case 'active':
        return <Badge className="bg-green-500 text-white">صالح</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي الصلاحية</Badge>;
      case 'suspended':
        return <Badge variant="destructive">معلق</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStatusMessage = () => {
    if (status === 'not_found') {
      return "رقم الترخيص المدخل غير مسجل في النظام";
    }
    
    if (clinic) {
      if (clinic.license_status === 'active') {
        return "العيادة مرخصة وصالحة للعمل";
      } else {
        return "العيادة موجودة لكن الترخيص غير صالح";
      }
    }

    return "حدث خطأ أثناء التحقق من الترخيص";
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتيجة التحقق من الترخيص',
          text: `رقم الترخيص: ${licenseNumber}\nالحالة: ${getStatusConfig().title}\n${clinic ? `العيادة: ${clinic.clinic_name}` : ''}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const statusConfig = getStatusConfig();
  const currentTime = new Date().toLocaleString('ar-JO');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            نتيجة التحقق من الترخيص
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Icon and Title */}
          <div className={`text-center p-6 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
            <div className="flex justify-center mb-4 animate-scale-in">
              {statusConfig.icon}
            </div>
            <h3 className={`text-2xl font-bold ${statusConfig.titleColor} mb-2`}>
              {statusConfig.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {getStatusMessage()}
            </p>
          </div>

          {/* License Number */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-1">رقم الترخيص</p>
            <p className="font-mono text-lg font-semibold bg-gray-100 py-2 px-4 rounded-lg">
              {licenseNumber}
            </p>
          </div>

          {/* Clinic Details */}
          {clinic && status === 'success' && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">{clinic.clinic_name}</h4>
                  <p className="text-gray-600">{clinic.specialization}</p>
                </div>
                {getStatusBadge(clinic.license_status)}
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {clinic.doctor_name && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{clinic.doctor_name}</span>
                  </div>
                )}

                {clinic.phone && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{clinic.phone}</span>
                  </div>
                )}

                {clinic.address && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{clinic.address}</span>
                  </div>
                )}

                {clinic.expiry_date && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      انتهاء الصلاحية: {new Date(clinic.expiry_date).toLocaleDateString('ar-JO')}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <p>عدد مرات التحقق: <span className="font-semibold">{clinic.verification_count}</span></p>
              </div>
            </div>
          )}

          {/* Verification Time */}
          <div className="text-center text-xs text-gray-400 border-t pt-3">
            تم التحقق في: {currentTime}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onScanAgain}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              مسح آخر
            </Button>
            
            {navigator.share && (
              <Button
                onClick={handleShare}
                variant="outline"
                size="icon"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VerificationResultDialog;
