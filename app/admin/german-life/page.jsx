"use client";

import { Icon } from "@iconify/react";

export default function AdminGermanLifePage() {
  return (
    <div className="flex min-h-full items-center justify-center p-6 sm:p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
          <Icon icon="material-symbols:public" className="text-3xl text-sky-600" />
        </div>
        <h1 className="text-2xl font-bold text-appleGray-900">German life</h1>
        <p className="mt-2 text-appleGray-600">
          Content management for German life resources is coming soon.
        </p>
      </div>
    </div>
  );
}
