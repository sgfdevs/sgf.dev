export default function RichText({ htmlString }: { htmlString: string }) {
  return (
    <div
      className={
        'mx-auto max-w-[1028px] px-[30px] font-source-sans-3 prose-h1:my-[0.67em] prose-h1:text-[2rem] prose-h1:font-black prose-h1:text-[#254151] prose-p:my-[1em] prose-a:text-foreground-light'
      }
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
}
