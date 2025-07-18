
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const SiteSettingsManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSiteSettings();
  
  // Initialize form data
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Populate form data when settings are loaded
  React.useEffect(() => {
    if (settings && Object.keys(formData).length === 0) {
      const data: Record<string, string> = {};
      settings.forEach(setting => {
        data[setting.key] = setting.value || '';
      });
      setFormData(data);
    }
  }, [settings, formData]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: { key: string; value: string }[]) => {
      const promises = updates.map(({ key, value }) =>
        supabase
          .from('site_settings')
          .update({ value })
          .eq('key', key)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "تم حفظ الإعدادات بنجاح",
        description: "تم تحديث إعدادات الموقع",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "خطأ في حفظ الإعدادات",
        description: "حدث خطأ أثناء تحديث الإعدادات",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const updates = Object.entries(formData).map(([key, value]) => ({
      key,
      value
    }));

    updateMutation.mutate(updates);
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الموقع</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">جاري تحميل الإعدادات...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          إعدادات الموقع
        </CardTitle>
        <CardDescription>
          تخصيص محتوى الفوتر ومعلومات الموقع
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {/* Footer Title */}
          <div>
            <label className="block text-sm font-medium mb-2">عنوان النظام في الفوتر</label>
            <Input
              value={formData.footer_title || ''}
              onChange={(e) => handleInputChange('footer_title', e.target.value)}
              placeholder="نظام التحقق من تراخيص العيادات"
            />
          </div>

          {/* Footer Description */}
          <div>
            <label className="block text-sm font-medium mb-2">وصف النظام</label>
            <Textarea
              value={formData.footer_description || ''}
              onChange={(e) => handleInputChange('footer_description', e.target.value)}
              placeholder="نظام متطور للتحقق السريع والآمن من تراخيص عيادات الأسنان في الأردن"
              rows={3}
            />
          </div>

          {/* Footer Features */}
          <div>
            <label className="block text-sm font-medium mb-2">قائمة الميزات (JSON)</label>
            <Textarea
              value={formData.footer_features || ''}
              onChange={(e) => handleInputChange('footer_features', e.target.value)}
              placeholder='["• مسح رمز QR السريع", "• التحقق اليدوي من الترخيص"]'
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              يرجى إدخال قائمة JSON صحيحة للميزات
            </p>
          </div>

          {/* Developer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">اسم المطور</label>
              <Input
                value={formData.footer_developer_name || ''}
                onChange={(e) => handleInputChange('footer_developer_name', e.target.value)}
                placeholder="د. براء صادق"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">منصب المطور</label>
              <Input
                value={formData.footer_developer_title || ''}
                onChange={(e) => handleInputChange('footer_developer_title', e.target.value)}
                placeholder="رئيس لجنة تكنولوجيا المعلومات"
              />
            </div>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium mb-2">اسم المنظمة</label>
            <Input
              value={formData.footer_organization || ''}
              onChange={(e) => handleInputChange('footer_organization', e.target.value)}
              placeholder="نقابة أطباء الأسنان الأردنية"
            />
          </div>

          {/* Copyright */}
          <div>
            <label className="block text-sm font-medium mb-2">نص حقوق النشر</label>
            <Input
              value={formData.footer_copyright || ''}
              onChange={(e) => handleInputChange('footer_copyright', e.target.value)}
              placeholder="جميع الحقوق محفوظة © {year} نقابة أطباء الأسنان الأردنية"
            />
            <p className="text-xs text-gray-500 mt-1">
              استخدم {`{year}`} لإدراج السنة الحالية تلقائياً
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsManagement;
