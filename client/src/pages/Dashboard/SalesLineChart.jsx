import { Chart } from 'react-google-charts'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { useEffect } from 'react'
import LoadingSpinner from '../../components/Shared/LoadingSpinner'

 const options = {
  title: 'Sales Over Time',
  curveType: 'function',
  legend: { position: 'bottom' },
  series: [{ color: '#F43F5E' }],
}
const SalesLineChart = ({data}) => {
    const [loading, setLoading] = useState(true)
    useEffect(()=>{
        setTimeout(()=> setLoading(false), 1000)
    },[])
  return (
    <>
        {
            loading?
             
            (<LoadingSpinner smallHeight/>) 
            : 
            data.length > 1 ?
            (<Chart chartType='LineChart' width='100%' data={data} options={options} />)
            :
            (
            <>
                <LoadingSpinner smallHeight/>
                <p>Not enough data available for this section</p>
            </>
            )

        }
    </>
  )
}
SalesLineChart.propTypes = {
    data: PropTypes.array,
  }
export default SalesLineChart