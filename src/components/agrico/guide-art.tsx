/** Decorative cover drawings follow the three covers in the approved Sample 2. */
export function GuideArt({ variant }: { variant: string }) {
  const book = <g>
    <path d="M20 146q45-14 94 2 48-17 95-3l14 47q-54-10-109 7-53-16-108-6Z" fill="#f5f8ed" />
    <path d="M114 148v51M15 185q47-12 93 6m15 0q43-15 91-6M24 153q39-9 81 3m-77 5q38-8 77 3m-73 5q36-6 73 3m-69 5q35-5 69 3m19-24q37-12 76-7m-76 15q39-12 79-6m-79 14q40-11 82-5m-82 13q40-10 85-4" />
  </g>;
  return <svg className="ag-art ag-guide-art" viewBox="0 0 240 210" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {variant === 'degree-choice' ? <>
      <path d="M77 151q3-53-20-88m61 86q-4-64 22-111m29 108q-3-41 19-72" />
      <path d="M64 92Q24 82 25 49q35 2 39 43ZM72 117Q31 109 36 85q31 3 36 32Zm49-23q-29-19-25-47 27 11 25 47Zm9-23q31-3 36-34-29 1-36 34Zm-9 46q31 1 41-27-31-2-41 27Zm55-4q-17-31-6-50 19 16 6 50Zm8-17q28 0 37-28-27-1-37 28Z" fill="#dce9d2" />
      <path d="m30 56 29 30m-18 6 25 20m36-57 16 31m24-42-9 20m-6 46 27-15m20-22 3 28m16-12 22-15" />
      <path d="m60 133 5 23h30l4-23Zm43-5 5 27h28l5-27Zm53 6 4 22h29l5-22Z" fill="#edf4e5" />
      {book}
    </> : variant === 'university-learning' ? <>
      <path d="M29 139V91l29-14 29 14v50m0-34 24-13 27 13v34m0-7V58l24-17 24 17v84m0-45 23 9v36M150 58h24m-17-17V23l6-10 6 10v18" fill="#e3edd8" />
      <path d="m24 91 34-20 34 20m42-32 28-23 29 23M47 84V61h23v24m-29 56v-33h34v33m80 0v-24h15v24" />
      {[52, 64, 99, 114, 148, 164, 178, 198].map((x, index) => <path key={x} d={`M${x} ${index > 3 ? 76 : 96}h6v11h-6zM${x} ${index > 3 ? 93 : 114}h6v11h-6z`} />)}
      <path d="M20 145v-28m-7 5q-9-14 0-25 10 10 0 25Zm8-5q14-8 10-21-12 6-10 21Zm194 30v-29m0 0q-14-14-8-29 15 8 8 29Zm1 8q17-3 20-18-17-1-20 18Z" fill="#dce9d2" />
      {book}
    </> : <g transform="rotate(8 124 108)">
      <path d="M44 25h132q10 0 10 10v156q0 8-8 8H45q-9 0-9-9V35q0-10 8-10Z" fill="#f1f7e9" />
      <path d="M50 40h122v145H50zM91 22v-7h40v7h9v22H81V22Z" fill="#e0ebd3" />
      {[67, 94, 121, 148].map(y => <g key={y}><path d={`M61 ${y}l5 6 10-14m10 2h62m-62 8h48`} /></g>)}
      <path d="m179 152 29-108 9 3-29 108-9 14Zm3 0 6 3m20-111 2-7q1-5 6-4t3 7l-2 7" fill="#e0ebd3" />
      <path d="M208 190v-35m0 9q-23-6-22-27 22 4 22 27Zm1-9q25-4 28-25-22 0-28 25Z" fill="#dce9d2" />
    </g>}
  </svg>;
}
