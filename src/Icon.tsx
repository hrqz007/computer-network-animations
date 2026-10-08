export default function Icon({name,size=20}:{name:string;size?:number}){
 const paths:Record<string,React.ReactNode>={
  search:<><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></>,chevron:<path d="m9 5 7 7-7 7"/>,
  arrow:<path d="m5 12 14 0m-6-6 6 6-6 6"/>,back:<path d="M19 12H5m6-6-6 6 6 6"/>,play:<path d="m8 5 11 7-11 7z" fill="currentColor" strokeWidth="1"/>,pause:<><path d="M8 5v14M16 5v14" strokeWidth="4"/></>,step:<><path d="m6 5 10 7-10 7z"/><path d="M19 5v14"/></>,reset:<><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,full:<path d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5"/>,book:<><path d="M12 5v15M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1z"/></>,close:<path d="m6 6 12 12M6 18 18 6"/>,check:<path d="m5 12 4 4L19 6"/>,shuffle:<><path d="M3 6h3c5 0 5 12 10 12h5m-4-4 4 4-4 4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3m-4-4 4 4-4 4"/></>,network:<><circle cx="12" cy="4" r="2.5"/><circle cx="4" cy="19" r="2.5"/><circle cx="20" cy="19" r="2.5"/><path d="m11 6-6 10m8-10 6 10M7 19h10"/></>
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.book}</svg>;
}
