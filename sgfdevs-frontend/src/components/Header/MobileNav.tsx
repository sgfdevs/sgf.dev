import { cn } from '@/utils/cn';
import { MobileMenuProps } from '@/components/Header/MobileMenu';

export function MobileNav({
  open,
  toggle,
}: { toggle: () => void } & MobileMenuProps) {
  return (
    <div className='flex items-center lg:hidden' onClick={toggle}>
      <div className='relative mr-8 h-5 w-5 [&>*]:transition-all'>
        <span
          className={cn(
            'bg-foreground absolute block h-[3px] w-1/2',
            open && 'left-[2px] top-[3px] rotate-45',
          )}
        />
        <span
          className={cn(
            'bg-foreground absolute left-1/2 block h-[3px] w-1/2',
            open && 'top-[3px] -rotate-45',
          )}
        />
        <span
          className={cn(
            'bg-foreground absolute top-[7px] block h-[3px] w-1/2 transition-none',
            open && '-left-1/2 opacity-0',
          )}
        />
        <span
          className={cn(
            'bg-foreground absolute left-1/2 top-[7px] block h-[3px] w-1/2 transition-none',
            open && 'left-full opacity-0',
          )}
        />
        <span
          className={cn(
            'bg-foreground absolute top-[14px] block h-[3px] w-1/2',
            open && 'left-[2px] top-[11px] -rotate-45',
          )}
        />
        <span
          className={cn(
            'bg-foreground absolute left-1/2 top-[14px] block h-[3px] w-1/2',
            open &&
              'left-[calc(50%-2px)] top-[10px] w-[calc(50%+3px)] rotate-45',
          )}
        />
      </div>
      <span>Menu</span>
    </div>
  );
}
