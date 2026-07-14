'use client';

import * as React from 'react';
import { IVariant } from '../types/product.types';
import { Button } from '@/components/ui/button';

interface VariantSelectorProps {
  variants: IVariant[];
  selectedVariant: IVariant;
  onVariantSelect: (variant: IVariant) => void;
}

export function VariantSelector({ variants, selectedVariant, onVariantSelect }: VariantSelectorProps) {
  const allAttributesKeys = Array.from(
    new Set(variants.flatMap((v) => Object.keys(v.attributes || {})))
  );

  const attributesMap: Record<string, string[]> = {};
  allAttributesKeys.forEach((key) => {
    attributesMap[key] = Array.from(
      new Set(variants.map((v) => String(v.attributes[key])).filter(Boolean))
    );
  });

  const handleAttributeClick = (key: string, value: string) => {
    const targetAttributes = { ...selectedVariant.attributes, [key]: value };

    const match = variants.find((v) =>
      Object.entries(targetAttributes).every(
        ([k, val]) => String(v.attributes[k]) === String(val)
      )
    );

    if (match) {
      onVariantSelect(match);
    } else {
      const fallbackMatch = variants.find((v) => String(v.attributes[key]) === String(value));
      if (fallbackMatch) {
        onVariantSelect(fallbackMatch);
      }
    }
  };

  if (variants.length <= 1) return null;

  return (
    <div className="space-y-6 border-y border-border py-6">
      {Object.entries(attributesMap).map(([key, values]) => {
        const activeVal = String(selectedVariant.attributes[key]);

        return (
          <div key={key} className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider capitalize">
              Select {key}
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {values.map((val) => {
                const isSelected = activeVal === val;
                const isColorShade = key.toLowerCase() === 'shade' || key.toLowerCase() === 'color';
                
                return (
                  <Button
                    key={val}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleAttributeClick(key, val)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10'
                        : 'border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {isColorShade && (
                      <span
                        className="mr-2 h-3.5 w-3.5 rounded-full border border-black/10 inline-block align-middle"
                        style={{ backgroundColor: val.toLowerCase().replace(' ', '') }}
                      />
                    )}
                    <span className="align-middle">{val}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
