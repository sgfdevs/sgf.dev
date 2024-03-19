const RichText = ({ htmlString }: { htmlString: string }) => {
  return (
    <div
      className={
        'prose-h1:text-[2rem] sm: prose-h1:text-[#254151] prose-h1:font-black prose-h1:my-[0.67em] prose-p:my-[1em] mx-auto max-w-[1028px] px-[30px] font-sans'
      }
      dangerouslySetInnerHTML={{ __html: htmlString }}
    />
  );
};

export default RichText;
