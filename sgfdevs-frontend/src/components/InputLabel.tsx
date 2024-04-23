import { ReactNode } from 'react';

interface LableProps {
  labelText: string;
  inputName: string;
  errors?: Record<string, string>;
  nullCheckText?: ReactNode | undefined;
}

export default function InputLabel({
  labelText,
  inputName,
  errors,
  nullCheckText,
}: LableProps) {
  return (
    <>
      <div className={'flex'}>
        <div>
          <label
            htmlFor={inputName}
            className={'text-[18px] font-extrabold tracking-wide text-black'}
          >
            {labelText}
            {nullCheckText}
          </label>
        </div>

        {errors?.[inputName] && (
          <span className='ml-auto flex-shrink-0 text-[#d23634]'>
            {errors?.[inputName]}
          </span>
        )}
      </div>
    </>
  );
}
