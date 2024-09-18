interface NullCheckTextProps {
  isModalOpen: boolean;
  setIsModalOpen: any;
}

export default function NullCheckText({
  isModalOpen,
  setIsModalOpen,
}: NullCheckTextProps) {
  return (
    <>
      <span className='flex-shrink-0 font-light'>
        {' '}
        (What is the Springfield, MO Airport Code?){' '}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsModalOpen(!isModalOpen);
          }}
          className={'underline'}
        >
          Need help?
        </button>
      </span>
    </>
  );
}
