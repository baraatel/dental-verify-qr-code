
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clinic } from '@/types/clinic';
import { ClinicFormData, useCreateClinic, useUpdateClinic } from '@/hooks/useClinicCRUD';
import ClinicForm from './ClinicForm';

interface ClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: Clinic;
  mode: 'create' | 'edit';
}

const ClinicDialog: React.FC<ClinicDialogProps> = ({
  open,
  onOpenChange,
  clinic,
  mode
}) => {
  const createMutation = useCreateClinic();
  const updateMutation = useUpdateClinic();

  const handleSubmit = async (data: ClinicFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else if (clinic) {
        await updateMutation.mutateAsync({ id: clinic.id, ...data });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'إضافة عيادة جديدة' : 'تعديل بيانات العيادة'}
          </DialogTitle>
        </DialogHeader>
        
        <ClinicForm
          clinic={clinic}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ClinicDialog;
