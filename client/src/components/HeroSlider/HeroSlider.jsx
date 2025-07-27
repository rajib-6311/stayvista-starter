import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Autoplay, Pagination, Navigation } from 'swiper/modules';

const HeroSlider = () => {
    return (
        <div className='pb-12'>
            <Swiper
                spaceBetween={30}
                centeredSlides={true}
                loop={true}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                modules={[Autoplay, Pagination, Navigation]}
                className="mySwiper"
            >
                <SwiperSlide>
                  <img className='h-[550px] w-full' src="https://i.ibb.co/chQ0YkXy/h4.jpg" alt="" />
                </SwiperSlide>
                <SwiperSlide>
                  <img className='h-[550px] w-full' src="https://i.ibb.co/zHJ4Tg4v/hotel2.jpg" alt="" />
                </SwiperSlide>
                <SwiperSlide>
                  <img className='h-[550px] w-full' src="https://i.ibb.co/PsqGMjK4/hotel3.jpg" alt="" />
                </SwiperSlide>
                <SwiperSlide>
                  <img className='h-[550px] w-full' src="https://i.ibb.co/KjwLMdq0/h6.jpg" alt="" />
                </SwiperSlide>
                <SwiperSlide>
                  <img className='h-[550px] w-full' src="https://i.ibb.co/KzxJ8MBn/h7.jpg" alt="" />
                </SwiperSlide>
              
               

            </Swiper>
        </div>
    );
};

export default HeroSlider;