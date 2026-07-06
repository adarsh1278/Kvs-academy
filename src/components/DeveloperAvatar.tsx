'use client';

import React, { useState } from 'react';

export default function DeveloperAvatar() {
  const [imgSrc, setImgSrc] = useState('/adarsh.jpg');

  return (
    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-indigo-500/30 bg-slate-800">
      <img
        src={imgSrc}
        alt="Adarsh - Developer"
        className="h-full w-full object-cover"
        onError={() => setImgSrc('https://ui-avatars.com/api/?name=Adarsh&background=4f46e5&color=fff')}
      />
    </div>
  );
}
