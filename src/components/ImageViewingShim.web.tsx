import React from 'react';

interface Props {
  images: { uri: string }[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

export default function ImageViewingShim(_props: Props) {
  return null;
}
