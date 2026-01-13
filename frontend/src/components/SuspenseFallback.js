import React from 'react';
import Loader from './Loader';

export default function SuspenseFallback() {
  return <Loader message="Loading component..." />;
}
