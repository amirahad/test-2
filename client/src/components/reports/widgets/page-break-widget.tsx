import React from 'react';

export function PageBreakWidget() {
  return (
    <div className="p-4 w-full">
      <div className="border-t-2 border-dashed border-gray-300 relative">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 text-xs text-gray-500 border border-gray-300 rounded-full">
          Page Break
        </div>
      </div>
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Content after this widget will appear on a new page in the PDF report</p>
      </div>
    </div>
  );
}