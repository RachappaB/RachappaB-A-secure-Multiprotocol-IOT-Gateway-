import {useState, useEffect} from 'react'
import axios from 'axios'

function UserAPI(token) {
   const [products,setproducts] = useState([]);
   const [pooja,setpooja] = useState([]);
    useEffect(() =>{
        if(token){
            const getUser = async () =>{
                try {
                        const res = await axios.get('/customer/all')
                        setproducts(res.data.products)
                        setpooja(res.data.pooja)
                } catch (err) {
                  
                    alert(err.response.data.msg)
                }

            }
            getUser()
            
        }
    },[token])
    console.log(products)

    return {
        products:[products,setproducts],
        pooja:[pooja,setpooja],
    }
}

export default UserAPI
 