'use client';

import { ImageUpload } from '@/components/ui/image-upload';
import { Label } from '@/components/ui/label';
import type { AnhCCCD } from '@/types';

interface CCCDUploadProps {
  anhCCCD?: AnhCCCD;
  onCCCDChange: (value: AnhCCCD) => void;
  className?: string;
}

export function CCCDUpload({
  anhCCCD = { matTruoc: '', matSau: '' },
  onCCCDChange,
  className,
}: CCCDUploadProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cccd-front">Anh CCCD mat truoc</Label>
          <ImageUpload
            imageUrl={anhCCCD.matTruoc}
            onImageChange={(url) => onCCCDChange({ ...anhCCCD, matTruoc: url })}
            placeholder="Tai anh mat truoc CCCD"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cccd-back">Anh CCCD mat sau</Label>
          <ImageUpload
            imageUrl={anhCCCD.matSau}
            onImageChange={(url) => onCCCDChange({ ...anhCCCD, matSau: url })}
            placeholder="Tai anh mat sau CCCD"
          />
        </div>
      </div>
    </div>
  );
}
