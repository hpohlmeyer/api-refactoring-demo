import * as React from 'react';

export function getDisplayName(WrappedComponent: React.ComponentClass): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}