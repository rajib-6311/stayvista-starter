import { useState } from "react";
import AddRoomForm from "../../../components/Form/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { imageUpload } from "../../../api/utils";

const AddRoom = () => {
    const {user} = useAuth()
    const [imagePreview, setImagePreview] = useState();
    const [imageText, setImageText] = useState('Upload Image');
    const [dates, setDates] = useState({
        statDate: new Date(),
        endDate: null,
        key: 'selection',
    })

    // Date range handling
    const handleDates = item => {
        console.log(item)
        setDates(item.selection)
    }

    // form handel
    const handelSubmit = async e =>{
        e.preventDefault();
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
        }catch(err){
            console.log(err)
        }
    }

    // handle image change
    const handleImage = image =>{
        setImagePreview(URL.createObjectURL(image))
        setImageText(image.name)
    }
    return (
        <div>
            {/* <h1>Add Room Page..</h1>
            <div>
                {imagePreview && <img src={imagePreview}/>}
            </div> */}

        <AddRoomForm
            dates={dates}
            handleDates={handleDates}
            handelSubmit={handelSubmit}
            setImagePreview={setImagePreview}
            imagePreview={imagePreview}
            handleImage={handleImage}
            imageText={imageText}

            />
        </div>
    );
};

export default AddRoom;