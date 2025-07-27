import { Helmet } from 'react-helmet-async'
import Categories from '../../components/Categories/Categories'
import Rooms from '../../components/Home/Rooms'
import HeroSlider from '../../components/HeroSlider/HeroSlider'

const Home = () => {
  return (
    <div>
      <Helmet>
        <title>StayVista | Vacation Homes & Condo Rentals</title>
      </Helmet>
      {/* Slider  */}
      <HeroSlider/>
      {/* Categories section  */}
      <Categories />
      {/* Rooms section */}
      <Rooms />
    </div>
  )
}

export default Home
