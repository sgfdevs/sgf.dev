export default function RichText({ htmlString }: { htmlString: string }) {
  return (
    <div
      className={
        'sm: mx-auto max-w-[1028px] px-[30px] font-sans prose-h1:my-[0.67em] prose-h1:text-[2rem] prose-h1:font-black prose-h1:text-[#254151] prose-p:my-[1em]'
      }
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
}