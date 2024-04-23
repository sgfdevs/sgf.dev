interface ModalProps {
  isModalOpen: boolean;
  setIsModalOpen: any;
}

export default function Modal({ isModalOpen, setIsModalOpen }: ModalProps) {
  return (
    <div
      className={
        'fixed inset-0 flex h-full w-full items-center justify-center overflow-y-auto bg-[#999999] bg-opacity-50'
      }
    >
      <div className='flex h-[360px] w-[478px] flex-col items-center justify-center rounded-md bg-white px-5 text-[#595959]'>
        <img
          className={'h-[110px] w-[124px]'}
          src={'/check.png'}
          alt={'Check'}
        />
        <h1 className={'pt-[20px] text-[27px] font-semibold'}>
          The answer is SGF
        </h1>
        <p className={'px-[1px] py-5 text-[16px] leading-[24px]'}>
          This is an attempt to crack down on spam submissions. Hopefully it
          works and you are not a robot sniffing out the answer to this riddle.
          Welp. See ya later.
        </p>
        <button
          onClick={() => setIsModalOpen(!isModalOpen)}
          className={
            'ml-auto mt-2 h-[36px] w-[69px] rounded-md bg-[#7cd1f9] text-[16px] font-semibold text-white'
          }
        >
          OK
        </button>
      </div>
    </div>
  );
}
