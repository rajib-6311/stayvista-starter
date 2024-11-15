import { useState } from "react";
import AddRoomForm from "../../../components/Form/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { imageUpload } from "../../../api/utils";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const AddRoom = () => {
    const navigate = useNavigate()
    const {user} = useAuth()
    const axiosSecure = useAxiosSecure()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState();
    const [imageText, setImageText] = useState('Upload Image');
    const [dates, setDates] = useState({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    })

    // Date range handling
    const handleDates = item => {
        console.log(item)
        setDates(item.selection)
    }

    const {mutateAsync} = useMutation({
        mutationFn: async roomData => {
            const {data} = axiosSecure.post(`/room`, roomData)
            return data
        },
        onSuccess: ()=> {
            console.log('Data Saved Successfully')
            toast.success('Room added successfully..')
            navigate('/dashboard/my-listings')
            setLoading(false)
        }

    })

    // form handel
    const handelSubmit = async e =>{
        e.preventDefault();
        setLoading(true)
        const form = e.target 
        const location = form.location.value 
        const category = form.category.value 
        const title = form.title.value 
        const to = dates.endDate
        const from = dates.statDate
        const price = form.price.value 
        const guests = form.total_guest.value 
        const bathrooms = form.bathrooms.value 
        const description = form.description.value 
        const bedrooms = form.bathrooms.value 
        const image = form.image.files[0]

        const host = {
            name: user?.displayName,
            image: user?.photoURL ,
            email: user?.email
        }
       
        try {
            const image_url =await imageUpload(image)
            const roomData = {
                location,
                category,
                title,
                to,
                from,
                price,
                guests,
                bathrooms,
                description,
                bedrooms,
                image:image_url,
                host
            }
            console.table(roomData);
            // Post request to server
            await mutateAsync(roomData)

        }catch(err){
            console.log(err)
            toast.error(err.message)
            setLoading(false)
        }
    }

    // handle image change
    const handleImage = image =>{
        setImagePreview(URL.createObjectURL(image))
        setImageText(image.name)
    }
    return (
        <>
        <Helmet>
            <title>Add room | Dashboard</title>
        </Helmet>
        
        <AddRoomForm
            dates={dates}
            handleDates={handleDates}
            handelSubmit={handelSubmit}
            setImagePreview={setImagePreview}
            imagePreview={imagePreview}
            handleImage={handleImage}
            imageText={imageText}
            loading={loading}

            />
        </>
    );
};

export default AddRoom;