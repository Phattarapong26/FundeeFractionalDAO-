
import React from 'react';
import { formatEthValue } from '@/lib/utils';

interface EthValueProps {
  value: number | string;
  decimals?: number;
  className?: string;
}

export const EthValue: React.FC<EthValueProps> = ({ 
  value, 
  decimals = 4, 
  className = ""
}) => {
  return (
    <span className={className}>
      {formatEthValue(value, decimals)}
    </span>
  );
};
