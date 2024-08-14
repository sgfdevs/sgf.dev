'use client'

import React from 'react';
import SampleData from "./SampleData";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export interface ICarouselProps {
  directoryCard: React.ReactNode;
  className: string;
  length: number;
}

export default function Carousel (props: ICarouselProps){

  const scrollElement = React.useRef<HTMLDivElement | null>(null);

  const cardWidth = 244

  function scrollRight(){
    scrollElement.current?.scrollTo(scrollElement.current?.scrollLeft - cardWidth, 0);
  }

  function scrollLeft(){
    scrollElement.current?.scrollTo(scrollElement.current?.scrollLeft + cardWidth, 0);
  }

  return (
      <div className="w-full h-auto">
        <RightScroll onClick={scrollRight} />
        <div className="overflow-x-auto scroll-smooth" ref={scrollElement}>
          <div className='flex px-4 snap-center'>
            {props.directoryCard}
            <SampleData />
          </div>
        </div>
        <LeftScroll onClick={scrollLeft} />
      </div>
  );
};

interface IScrollButtonProps {
  onClick: () => void;
}

function RightScroll({ onClick }: IScrollButtonProps){
  
  return(
    <div className="absolute left-0 top-0 z-10 h-full">
      <button 
      className="h-full w-20 bg-gradient-to-r from-white"
      onClick={onClick}>
      <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    </div>
  )
}

function LeftScroll({onClick}: IScrollButtonProps){
  const leftChevron = ">"

  return (
    <div className="absolute right-0 top-0 z-10 h-full">
      <button 
      className="h-full w-20 bg-gradient-to-l from-white"
      onClick={onClick}>
        <FontAwesomeIcon icon={faChevronRight} />
      </button>
    </div>
  )
}

